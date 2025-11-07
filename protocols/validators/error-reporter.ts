import { ValidationError, ValidationResult, ValidationWarning, RuleViolation } from './types';

export interface FormattedReport {
  summary: string;
  errors: FormattedError[];
  warnings: FormattedWarning[];
  suggestions: string[];
  xmlContext?: string[];
}

export interface FormattedError {
  message: string;
  location?: string;
  severity: 'error';
  context?: string;
  suggestion?: string;
}

export interface FormattedWarning {
  message: string;
  location?: string;
  severity: 'warning' | 'info';
  context?: string;
  suggestion?: string;
}

export class ValidationErrorReporter {
  /**
   * Format validation results into human-readable report
   */
  format(result: ValidationResult, violations: RuleViolation[], xmlString: string): FormattedReport {
    const errors: FormattedError[] = [];
    const warnings: FormattedWarning[] = [];
    const suggestions: string[] = [];

    // Process schema validation errors
    for (const error of result.errors) {
      const formatted = this.formatSchemaError(error, xmlString);
      errors.push(formatted);
      if (formatted.suggestion) {
        suggestions.push(formatted.suggestion);
      }
    }

    // Process schema validation warnings
    for (const warning of result.warnings) {
      const formatted = this.formatSchemaWarning(warning, xmlString);
      warnings.push(formatted);
      if (formatted.suggestion) {
        suggestions.push(formatted.suggestion);
      }
    }

    // Process business rule violations
    for (const violation of violations) {
      if (violation.severity === 'error') {
        errors.push(this.formatRuleViolation(violation, xmlString) as FormattedError);
      } else {
        warnings.push(this.formatRuleViolation(violation, xmlString) as FormattedWarning);
      }
      if (violation.suggestion) {
        suggestions.push(violation.suggestion);
      }
    }

    // Generate summary
    const summary = this.generateSummary(errors.length, warnings.length);

    return {
      summary,
      errors,
      warnings,
      suggestions: Array.from(new Set(suggestions)), // Remove duplicates
      xmlContext: this.extractRelevantContext(xmlString, [...result.errors, ...result.warnings]),
    };
  }

  /**
   * Format a schema validation error
   */
  private formatSchemaError(error: ValidationError, xmlString: string): FormattedError {
    const location = this.formatLocation(error.line, error.column, error.path);
    const context = this.extractContext(xmlString, error.line);
    const suggestion = this.getSuggestion(error);

    return {
      message: error.message,
      location,
      severity: 'error',
      context,
      suggestion,
    };
  }

  /**
   * Format a schema validation warning
   */
  private formatSchemaWarning(warning: ValidationWarning, xmlString: string): FormattedWarning {
    const location = this.formatLocation(warning.line, warning.column, warning.path);
    const context = this.extractContext(xmlString, warning.line);

    return {
      message: warning.message,
      location,
      severity: 'warning',
      context,
    };
  }

  /**
   * Format a business rule violation
   */
  private formatRuleViolation(violation: RuleViolation, xmlString: string): FormattedError | FormattedWarning {
    const base = {
      message: `[${violation.rule}] ${violation.message}`,
      location: violation.path,
      suggestion: violation.suggestion,
    };

    if (violation.severity === 'error') {
      return { ...base, severity: 'error' as const };
    } else {
      return { ...base, severity: violation.severity };
    }
  }

  /**
   * Generate summary text
   */
  private generateSummary(errorCount: number, warningCount: number): string {
    if (errorCount === 0 && warningCount === 0) {
      return '✅ Validation passed with no errors or warnings';
    }

    const parts: string[] = [];
    if (errorCount > 0) {
      parts.push(`${errorCount} error${errorCount > 1 ? 's' : ''}`);
    }
    if (warningCount > 0) {
      parts.push(`${warningCount} warning${warningCount > 1 ? 's' : ''}`);
    }

    return `❌ Validation failed with ${parts.join(' and ')}`;
  }

  /**
   * Format location information
   */
  private formatLocation(line?: number, column?: number, path?: string): string | undefined {
    const parts: string[] = [];

    if (path) {
      parts.push(path);
    }

    if (line !== undefined) {
      if (column !== undefined) {
        parts.push(`line ${line}:${column}`);
      } else {
        parts.push(`line ${line}`);
      }
    }

    return parts.length > 0 ? parts.join(' at ') : undefined;
  }

  /**
   * Extract XML context around an error (5 lines before and after)
   */
  private extractContext(xmlString: string, line?: number): string | undefined {
    if (line === undefined) return undefined;

    const lines = xmlString.split('\n');
    const start = Math.max(0, line - 3);
    const end = Math.min(lines.length, line + 2);
    
    const contextLines = lines.slice(start, end).map((l, i) => {
      const lineNum = start + i + 1;
      const marker = lineNum === line ? '→ ' : '  ';
      return `${marker}${lineNum}: ${l}`;
    });

    return contextLines.join('\n');
  }

  /**
   * Extract relevant context from XML for all errors
   */
  private extractRelevantContext(xmlString: string, issues: Array<ValidationError | ValidationWarning>): string[] {
    const contexts: string[] = [];

    for (const issue of issues) {
      if (issue.line) {
        const context = this.extractContext(xmlString, issue.line);
        if (context) {
          contexts.push(context);
        }
      }
    }

    return contexts;
  }

  /**
   * Get remediation suggestion based on error type
   */
  private getSuggestion(error: ValidationError): string | undefined {
    const msg = error.message.toLowerCase();

    if (msg.includes('missing required')) {
      const match = error.message.match(/element: (.+)/);
      if (match) {
        return `Add the required <${match[1]}> element to your message`;
      }
    }

    if (msg.includes('invalid uuid')) {
      return 'Ensure UUIDs follow RFC 4122 format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (lowercase hex)';
    }

    if (msg.includes('invalid iso 8601') || msg.includes('datetime format')) {
      return 'Use ISO 8601 format: YYYY-MM-DDTHH:mm:ssZ (e.g., 2025-11-06T14:30:00Z)';
    }

    if (msg.includes('invalid priority')) {
      return 'Priority must be one of: critical, high, normal, low';
    }

    if (msg.includes('invalid agent-role')) {
      return 'agent-role must be one of: coordinator, specialist, orchestrator';
    }

    if (msg.includes('invalid tier')) {
      return 'tier must be one of: opus, sonnet, haiku';
    }

    if (msg.includes('invalid backoff-strategy')) {
      return 'backoff-strategy must be one of: exponential, linear, fixed';
    }

    if (msg.includes('invalid body type')) {
      return 'body type must be one of: task-delegation, status-update, task-completion, error, query';
    }

    if (msg.includes('must be a positive integer')) {
      return 'Provide a positive integer value (1, 2, 3, ...)';
    }

    if (msg.includes('version')) {
      return 'Set version attribute to "1.0"';
    }

    if (msg.includes('root element')) {
      return 'Ensure your XML document starts with <agent-message> root element';
    }

    return undefined;
  }

  /**
   * Format report as plain text for console output
   */
  formatAsText(report: FormattedReport): string {
    const lines: string[] = [];

    lines.push('═'.repeat(80));
    lines.push(report.summary);
    lines.push('═'.repeat(80));

    if (report.errors.length > 0) {
      lines.push('');
      lines.push('ERRORS:');
      lines.push('─'.repeat(80));
      for (const error of report.errors) {
        lines.push(`❌ ${error.message}`);
        if (error.location) {
          lines.push(`   Location: ${error.location}`);
        }
        if (error.context) {
          lines.push(`   Context:\n${error.context}`);
        }
        if (error.suggestion) {
          lines.push(`   💡 Suggestion: ${error.suggestion}`);
        }
        lines.push('');
      }
    }

    if (report.warnings.length > 0) {
      lines.push('');
      lines.push('WARNINGS:');
      lines.push('─'.repeat(80));
      for (const warning of report.warnings) {
        const icon = warning.severity === 'warning' ? '⚠️' : 'ℹ️';
        lines.push(`${icon} ${warning.message}`);
        if (warning.location) {
          lines.push(`   Location: ${warning.location}`);
        }
        if (warning.suggestion) {
          lines.push(`   💡 Suggestion: ${warning.suggestion}`);
        }
        lines.push('');
      }
    }

    if (report.suggestions.length > 0 && (report.errors.length > 0 || report.warnings.length > 0)) {
      lines.push('');
      lines.push('RECOMMENDED ACTIONS:');
      lines.push('─'.repeat(80));
      report.suggestions.forEach((suggestion, i) => {
        lines.push(`${i + 1}. ${suggestion}`);
      });
    }

    lines.push('═'.repeat(80));

    return lines.join('\n');
  }
}
