import { MessageStore } from './message-store';
import { SchemaValidator } from '../validators/schema-validator';
import { BusinessRulesValidator } from '../validators/business-rules-validator';
import { ValidationResult } from '../validators/types';
import { XMLParser } from 'fast-xml-parser';

export interface ReplayOptions {
  dryRun?: boolean;
  resetRetryCount?: boolean;
  updateTimestamps?: boolean;
}

export interface ReplayResult {
  messageId: string;
  success: boolean;
  validationResult?: ValidationResult;
  error?: string;
  timestamp: Date;
}

export class MessageReplay {
  private parser: XMLParser;

  constructor(
    private store: MessageStore,
    private schemaValidator: SchemaValidator,
    private businessRulesValidator: BusinessRulesValidator
  ) {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseAttributeValue: true,
      trimValues: true,
    });
  }

  /**
   * Replay a single message
   */
  async replay(messageId: string, options: ReplayOptions = {}): Promise<ReplayResult> {
    const stored = this.store.findById(messageId);

    if (!stored) {
      return {
        messageId,
        success: false,
        error: 'Message not found',
        timestamp: new Date(),
      };
    }

    // Validate message
    const validationResult = await this.validate(messageId);
    if (!validationResult.valid) {
      return {
        messageId,
        success: false,
        validationResult,
        error: 'Validation failed',
        timestamp: new Date(),
      };
    }

    // Dry run: validation only
    if (options.dryRun) {
      return {
        messageId,
        success: true,
        validationResult,
        timestamp: new Date(),
      };
    }

    // Update timestamps if requested
    let xmlToReplay = stored.raw_xml;
    if (options.updateTimestamps) {
      xmlToReplay = this.updateMessageTimestamps(stored.raw_xml);
    }

    try {
      // Log replay attempt
      this.store.logDelivery(messageId, 0, 'retry', 'Message replayed');

      // Update status to pending for reprocessing
      this.store.updateStatus(messageId, 'pending');

      return {
        messageId,
        success: true,
        validationResult,
        timestamp: new Date(),
      };
    } catch (error: any) {
      return {
        messageId,
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Replay all messages in a conversation
   */
  async replayConversation(correlationId: string, options: ReplayOptions = {}): Promise<ReplayResult[]> {
    const messages = this.store.findByCorrelation(correlationId);
    const results: ReplayResult[] = [];

    for (const message of messages) {
      const result = await this.replay(message.message_id, options);
      results.push(result);
    }

    return results;
  }

  /**
   * Replay all failed messages
   */
  async replayFailed(options: ReplayOptions = {}): Promise<ReplayResult[]> {
    const db = (this.store as any).db;
    const stmt = db.prepare("SELECT message_id FROM messages WHERE status = 'failed' ORDER BY timestamp ASC");
    const failed = stmt.all() as Array<{ message_id: string }>;

    const results: ReplayResult[] = [];

    for (const msg of failed) {
      const result = await this.replay(msg.message_id, options);
      results.push(result);
    }

    return results;
  }

  /**
   * Validate a message without replaying
   */
  async validate(messageId: string): Promise<ValidationResult> {
    const stored = this.store.findById(messageId);

    if (!stored) {
      return {
        valid: false,
        errors: [{ message: 'Message not found', severity: 'error' }],
        warnings: [],
      };
    }

    // Run schema validation
    const schemaResult = this.schemaValidator.validate(stored.raw_xml);
    if (!schemaResult.valid) {
      return schemaResult;
    }

    // Parse message for business rule validation
    try {
      const parsed = this.parseStoredMessage(stored);
      const violations = this.businessRulesValidator.validate(parsed);

      const errors = violations.filter(v => v.severity === 'error').map(v => ({
        message: v.message,
        path: v.path,
        severity: 'error' as const,
      }));

      const warnings = violations.filter(v => v.severity !== 'error').map(v => ({
        message: v.message,
        path: v.path,
        severity: v.severity as 'warning',
      }));

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error: any) {
      return {
        valid: false,
        errors: [{ message: `Parsing error: ${error.message}`, severity: 'error' }],
        warnings: [],
      };
    }
  }

  /**
   * Update message timestamps to current time
   */
  private updateMessageTimestamps(xml: string): string {
    const now = new Date().toISOString();
    const futureExpiration = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(); // 5 hours from now

    // Update timestamp
    xml = xml.replace(
      /<timestamp>[^<]+<\/timestamp>/,
      `<timestamp>${now}</timestamp>`
    );

    // Update expiration
    xml = xml.replace(
      /<expiration>[^<]+<\/expiration>/,
      `<expiration>${futureExpiration}</expiration>`
    );

    // Update signature timestamp
    xml = xml.replace(
      /<timestamp>[^<]+<\/timestamp>/g,
      `<timestamp>${now}</timestamp>`
    );

    return xml;
  }

  /**
   * Parse stored message into ParsedMessage format
   */
  private parseStoredMessage(stored: any): any {
    const parsedXml = this.parser.parse(stored.raw_xml);
    const agentMessage = parsedXml['agent-message'];

    return {
      messageId: stored.message_id,
      timestamp: new Date(stored.timestamp),
      expiration: new Date(stored.expiration),
      sender: {
        agentName: stored.sender,
        agentRole: 'specialist', // Simplified
        tier: 'sonnet',
      },
      recipient: {
        agentName: stored.recipient,
        agentRole: 'coordinator',
        tier: 'sonnet',
      },
      correlationId: stored.correlation_id,
      priority: stored.priority,
      body: {
        type: stored.body_type,
      },
      rawXml: stored.raw_xml,
    };
  }

  /**
   * Get replay statistics
   */
  getReplayStats(): {
    totalReplays: number;
    successfulReplays: number;
    failedReplays: number;
  } {
    const db = (this.store as any).db;
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM delivery_logs
      WHERE error_message LIKE '%replayed%'
    `);

    const result = stmt.get() as { total: number; successful: number; failed: number };

    return {
      totalReplays: result.total || 0,
      successfulReplays: result.successful || 0,
      failedReplays: result.failed || 0,
    };
  }
}
