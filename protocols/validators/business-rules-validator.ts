import { ParsedMessage, RuleViolation } from './types';

export class BusinessRulesValidator {
  /**
   * Validate business rules for a parsed message
   */
  validate(message: ParsedMessage): RuleViolation[] {
    const violations: RuleViolation[] = [];

    violations.push(...this.validateTemporalRules(message));
    violations.push(...this.validatePriorityRules(message));
    violations.push(...this.validateRetryRules(message));
    violations.push(...this.validateAgentHierarchy(message));

    return violations;
  }

  /**
   * Rule 1: Temporal validation - expiration must be after timestamp
   */
  private validateTemporalRules(message: ParsedMessage): RuleViolation[] {
    const violations: RuleViolation[] = [];

    if (message.expiration <= message.timestamp) {
      violations.push({
        rule: 'temporal-expiration',
        message: `Message expiration (${message.expiration.toISOString()}) must be after timestamp (${message.timestamp.toISOString()})`,
        severity: 'error',
        path: '/agent-message/header/expiration',
        suggestion: 'Set expiration to a future time relative to timestamp',
      });
    }

    // Check if message is pre-expired (expiration is in the past)
    const now = new Date();
    if (message.expiration < now) {
      violations.push({
        rule: 'temporal-pre-expired',
        message: `Message is already expired. Expiration: ${message.expiration.toISOString()}, Current time: ${now.toISOString()}`,
        severity: 'warning',
        path: '/agent-message/header/expiration',
        suggestion: 'Update expiration to a future time',
      });
    }

    return violations;
  }

  /**
   * Rule 2: Priority-based expiration constraints
   * Critical/High priority messages should expire within 5 hours
   */
  private validatePriorityRules(message: ParsedMessage): RuleViolation[] {
    const violations: RuleViolation[] = [];

    if (message.priority === 'critical' || message.priority === 'high') {
      const timeDiffMs = message.expiration.getTime() - message.timestamp.getTime();
      const timeDiffHours = timeDiffMs / (1000 * 60 * 60);

      if (timeDiffHours > 5) {
        violations.push({
          rule: 'priority-expiration-window',
          message: `${message.priority} priority messages should expire within 5 hours. Current window: ${timeDiffHours.toFixed(2)} hours`,
          severity: 'warning',
          path: '/agent-message/header',
          suggestion: `Reduce expiration window to ≤5 hours or lower priority to "normal"`,
        });
      }
    }

    return violations;
  }

  /**
   * Rule 3: Retry policy validation
   * Max attempts should not exceed 5
   */
  private validateRetryRules(message: ParsedMessage): RuleViolation[] {
    const violations: RuleViolation[] = [];

    if (message.retryPolicy) {
      if (message.retryPolicy.maxAttempts > 5) {
        violations.push({
          rule: 'retry-max-attempts',
          message: `max-attempts (${message.retryPolicy.maxAttempts}) exceeds recommended limit of 5`,
          severity: 'warning',
          path: '/agent-message/header/retry-policy/max-attempts',
          suggestion: 'Reduce max-attempts to ≤5 to prevent excessive retries',
        });
      }

      // Validate timeout is reasonable
      if (message.retryPolicy.timeoutSeconds > 600) {
        violations.push({
          rule: 'retry-timeout-excessive',
          message: `timeout-seconds (${message.retryPolicy.timeoutSeconds}) is excessive (>10 minutes)`,
          severity: 'warning',
          path: '/agent-message/header/retry-policy/timeout-seconds',
          suggestion: 'Consider reducing timeout to a more reasonable value',
        });
      }

      // Validate backoff strategy makes sense with timeout
      if (message.retryPolicy.backoffStrategy === 'exponential' && message.retryPolicy.maxAttempts > 10) {
        violations.push({
          rule: 'retry-exponential-explosion',
          message: `Exponential backoff with ${message.retryPolicy.maxAttempts} attempts may cause extremely long delays`,
          severity: 'warning',
          path: '/agent-message/header/retry-policy',
          suggestion: 'Reduce max-attempts or use linear/fixed backoff strategy',
        });
      }
    }

    return violations;
  }

  /**
   * Rule 4: Agent hierarchy validation
   * Coordinators can send to specialists or other coordinators
   * Specialists can send to coordinators or orchestrators (escalation)
   * Orchestrators can send to coordinators
   */
  private validateAgentHierarchy(message: ParsedMessage): RuleViolation[] {
    const violations: RuleViolation[] = [];

    const senderRole = message.sender.agentRole;
    const recipientRole = message.recipient.agentRole;

    // Coordinators cannot send to orchestrators (must escalate through proper channels)
    if (senderRole === 'coordinator' && recipientRole === 'orchestrator') {
      violations.push({
        rule: 'agent-hierarchy-coordinator-to-orchestrator',
        message: 'Coordinators should not directly message orchestrators. Use proper escalation channels.',
        severity: 'warning',
        path: '/agent-message/header',
        suggestion: 'Route through appropriate coordinator or tech-lead',
      });
    }

    // Specialists should not send to other specialists directly (should go through coordinator)
    if (senderRole === 'specialist' && recipientRole === 'specialist') {
      violations.push({
        rule: 'agent-hierarchy-specialist-to-specialist',
        message: 'Specialists should communicate through their coordinator, not directly',
        severity: 'info',
        path: '/agent-message/header',
        suggestion: 'Route message through coordinator for proper context filtering',
      });
    }

    // Validate tier alignment (warnings for inefficient routing)
    if (message.sender.tier === 'opus' && message.recipient.tier === 'haiku') {
      violations.push({
        rule: 'tier-alignment-inefficient',
        message: 'High-tier agent (opus) sending to low-tier agent (haiku) may indicate inefficient routing',
        severity: 'info',
        path: '/agent-message/header',
        suggestion: 'Consider if task is appropriate for recipient tier',
      });
    }

    return violations;
  }

  /**
   * Additional validation: Body type consistency
   * Ensure body type attribute matches the actual child element
   */
  validateBodyTypeConsistency(bodyType: string, actualChildElement: string): RuleViolation | null {
    if (bodyType !== actualChildElement) {
      return {
        rule: 'body-type-mismatch',
        message: `Body type attribute "${bodyType}" does not match child element "${actualChildElement}"`,
        severity: 'error',
        path: '/agent-message/body',
        suggestion: `Change body type to "${actualChildElement}" or use correct child element`,
      };
    }
    return null;
  }

  /**
   * Additional validation: Correlation ID chain consistency
   * Verify correlation-id matches conversation chain references
   */
  validateCorrelationChain(correlationId: string, conversationChain?: string[]): RuleViolation[] {
    const violations: RuleViolation[] = [];

    if (conversationChain && conversationChain.length > 0) {
      // Check if correlation-id appears in conversation chain
      const correlationInChain = conversationChain.some(msgId => msgId === correlationId);
      
      if (!correlationInChain) {
        violations.push({
          rule: 'correlation-chain-mismatch',
          message: 'correlation-id should match at least one message-ref in conversation-chain',
          severity: 'warning',
          path: '/agent-message/header',
          suggestion: 'Ensure correlation-id matches the original message that started this conversation',
        });
      }
    }

    return violations;
  }
}
