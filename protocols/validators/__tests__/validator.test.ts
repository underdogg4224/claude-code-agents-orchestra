import * as fs from 'fs';
import * as path from 'path';
import { SchemaValidator } from '../schema-validator';
import { BusinessRulesValidator } from '../business-rules-validator';
import { ValidationErrorReporter } from '../error-reporter';
import { ParsedMessage } from '../types';

describe('SchemaValidator', () => {
  let validator: SchemaValidator;
  const schemaPath = path.join(__dirname, '../../agent-message-v1.0.xsd');

  beforeAll(() => {
    validator = new SchemaValidator(schemaPath);
  });

  describe('Valid Messages', () => {
    it('should validate a correct task-delegation message', () => {
      const xmlPath = path.join(__dirname, '../../templates/task-delegation.xml');
      const xml = fs.readFileSync(xmlPath, 'utf-8');
      const result = validator.validate(xml);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate a correct status-update message', () => {
      const xmlPath = path.join(__dirname, '../../templates/status-update.xml');
      const xml = fs.readFileSync(xmlPath, 'utf-8');
      const result = validator.validate(xml);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate a correct task-completion message', () => {
      const xmlPath = path.join(__dirname, '../../templates/task-completion.xml');
      const xml = fs.readFileSync(xmlPath, 'utf-8');
      const result = validator.validate(xml);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate a correct error message', () => {
      const xmlPath = path.join(__dirname, '../../templates/error.xml');
      const xml = fs.readFileSync(xmlPath, 'utf-8');
      const result = validator.validate(xml);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate a correct query message', () => {
      const xmlPath = path.join(__dirname, '../../templates/query.xml');
      const xml = fs.readFileSync(xmlPath, 'utf-8');
      const result = validator.validate(xml);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Schema Violations', () => {
    it('should reject message with missing root element', () => {
      const xml = '<?xml version="1.0" encoding="UTF-8"?><wrong-root></wrong-root>';
      const result = validator.validate(xml);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Root element'))).toBe(true);
    });

    it('should reject message with missing version attribute', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <agent-message xmlns="http://agent-orchestra.local/protocol/1.0">
          <header><message-id>550e8400-e29b-41d4-a716-446655440000</message-id></header>
        </agent-message>`;
      const result = validator.validate(xml);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('version'))).toBe(true);
    });

    it('should reject message with invalid version', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <agent-message version="2.0" xmlns="http://agent-orchestra.local/protocol/1.0">
          <header></header>
        </agent-message>`;
      const result = validator.validate(xml);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Invalid version'))).toBe(true);
    });

    it('should reject message with missing header', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <agent-message version="1.0" xmlns="http://agent-orchestra.local/protocol/1.0">
          <body type="query"></body>
          <signature></signature>
        </agent-message>`;
      const result = validator.validate(xml);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Missing required element: header'))).toBe(true);
    });

    it('should reject message with invalid UUID format', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <agent-message version="1.0" xmlns="http://agent-orchestra.local/protocol/1.0">
          <header>
            <message-id>not-a-valid-uuid</message-id>
            <timestamp>2025-11-06T14:30:00Z</timestamp>
            <sender>
              <agent-name>test</agent-name>
              <agent-role>specialist</agent-role>
              <tier>sonnet</tier>
            </sender>
            <recipient>
              <agent-name>test2</agent-name>
              <agent-role>coordinator</agent-role>
              <tier>sonnet</tier>
            </recipient>
            <correlation-id>550e8400-e29b-41d4-a716-446655440001</correlation-id>
            <priority>high</priority>
            <expiration>2025-11-06T19:30:00Z</expiration>
          </header>
          <body type="query"></body>
          <signature></signature>
        </agent-message>`;
      const result = validator.validate(xml);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Invalid UUID format'))).toBe(true);
    });

    it('should reject message with invalid priority enum', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <agent-message version="1.0" xmlns="http://agent-orchestra.local/protocol/1.0">
          <header>
            <message-id>550e8400-e29b-41d4-a716-446655440000</message-id>
            <timestamp>2025-11-06T14:30:00Z</timestamp>
            <sender>
              <agent-name>test</agent-name>
              <agent-role>specialist</agent-role>
              <tier>sonnet</tier>
            </sender>
            <recipient>
              <agent-name>test2</agent-name>
              <agent-role>coordinator</agent-role>
              <tier>sonnet</tier>
            </recipient>
            <correlation-id>550e8400-e29b-41d4-a716-446655440001</correlation-id>
            <priority>super-urgent</priority>
            <expiration>2025-11-06T19:30:00Z</expiration>
          </header>
          <body type="query"></body>
          <signature></signature>
        </agent-message>`;
      const result = validator.validate(xml);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Invalid priority value'))).toBe(true);
    });

    it('should reject message with invalid agent-role', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <agent-message version="1.0" xmlns="http://agent-orchestra.local/protocol/1.0">
          <header>
            <message-id>550e8400-e29b-41d4-a716-446655440000</message-id>
            <timestamp>2025-11-06T14:30:00Z</timestamp>
            <sender>
              <agent-name>test</agent-name>
              <agent-role>super-agent</agent-role>
              <tier>sonnet</tier>
            </sender>
            <recipient>
              <agent-name>test2</agent-name>
              <agent-role>coordinator</agent-role>
              <tier>sonnet</tier>
            </recipient>
            <correlation-id>550e8400-e29b-41d4-a716-446655440001</correlation-id>
            <priority>high</priority>
            <expiration>2025-11-06T19:30:00Z</expiration>
          </header>
          <body type="query"></body>
          <signature></signature>
        </agent-message>`;
      const result = validator.validate(xml);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Invalid agent-role'))).toBe(true);
    });

    it('should reject message with invalid tier', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <agent-message version="1.0" xmlns="http://agent-orchestra.local/protocol/1.0">
          <header>
            <message-id>550e8400-e29b-41d4-a716-446655440000</message-id>
            <timestamp>2025-11-06T14:30:00Z</timestamp>
            <sender>
              <agent-name>test</agent-name>
              <agent-role>specialist</agent-role>
              <tier>gpt4</tier>
            </sender>
            <recipient>
              <agent-name>test2</agent-name>
              <agent-role>coordinator</agent-role>
              <tier>sonnet</tier>
            </recipient>
            <correlation-id>550e8400-e29b-41d4-a716-446655440001</correlation-id>
            <priority>high</priority>
            <expiration>2025-11-06T19:30:00Z</expiration>
          </header>
          <body type="query"></body>
          <signature></signature>
        </agent-message>`;
      const result = validator.validate(xml);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Invalid tier'))).toBe(true);
    });

    it('should reject message with malformed XML', () => {
      const xml = '<?xml version="1.0"?><agent-message><unclosed-tag>';
      const result = validator.validate(xml);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Retry Policy Validation', () => {
    it('should reject retry policy with invalid backoff-strategy', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <agent-message version="1.0" xmlns="http://agent-orchestra.local/protocol/1.0">
          <header>
            <message-id>550e8400-e29b-41d4-a716-446655440000</message-id>
            <timestamp>2025-11-06T14:30:00Z</timestamp>
            <sender>
              <agent-name>test</agent-name>
              <agent-role>specialist</agent-role>
              <tier>sonnet</tier>
            </sender>
            <recipient>
              <agent-name>test2</agent-name>
              <agent-role>coordinator</agent-role>
              <tier>sonnet</tier>
            </recipient>
            <correlation-id>550e8400-e29b-41d4-a716-446655440001</correlation-id>
            <priority>high</priority>
            <expiration>2025-11-06T19:30:00Z</expiration>
            <retry-policy>
              <max-attempts>3</max-attempts>
              <backoff-strategy>random</backoff-strategy>
              <timeout-seconds>300</timeout-seconds>
            </retry-policy>
          </header>
          <body type="query"></body>
          <signature></signature>
        </agent-message>`;
      const result = validator.validate(xml);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Invalid backoff-strategy'))).toBe(true);
    });
  });
});

describe('BusinessRulesValidator', () => {
  let validator: BusinessRulesValidator;

  beforeAll(() => {
    validator = new BusinessRulesValidator();
  });

  describe('Temporal Rules', () => {
    it('should reject message with expiration before timestamp', () => {
      const message: ParsedMessage = {
        messageId: '550e8400-e29b-41d4-a716-446655440000',
        timestamp: new Date('2025-11-06T14:30:00Z'),
        expiration: new Date('2025-11-06T13:00:00Z'), // Before timestamp
        sender: { agentName: 'test', agentRole: 'specialist', tier: 'sonnet' },
        recipient: { agentName: 'test2', agentRole: 'coordinator', tier: 'sonnet' },
        correlationId: '550e8400-e29b-41d4-a716-446655440001',
        priority: 'high',
        body: { type: 'query', queryType: 'ask-for-help', subject: 'test', urgency: 'high' },
        rawXml: '',
      };

      const violations = validator.validate(message);
      expect(violations.some(v => v.rule === 'temporal-expiration')).toBe(true);
    });

    it('should warn about pre-expired messages', () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);

      const message: ParsedMessage = {
        messageId: '550e8400-e29b-41d4-a716-446655440000',
        timestamp: new Date('2025-01-01T00:00:00Z'),
        expiration: pastDate,
        sender: { agentName: 'test', agentRole: 'specialist', tier: 'sonnet' },
        recipient: { agentName: 'test2', agentRole: 'coordinator', tier: 'sonnet' },
        correlationId: '550e8400-e29b-41d4-a716-446655440001',
        priority: 'high',
        body: { type: 'query', queryType: 'ask-for-help', subject: 'test', urgency: 'high' },
        rawXml: '',
      };

      const violations = validator.validate(message);
      expect(violations.some(v => v.rule === 'temporal-pre-expired')).toBe(true);
    });
  });

  describe('Priority Rules', () => {
    it('should warn about critical priority with long expiration window', () => {
      const timestamp = new Date('2025-11-06T14:30:00Z');
      const expiration = new Date('2025-11-07T00:00:00Z'); // 9.5 hours later

      const message: ParsedMessage = {
        messageId: '550e8400-e29b-41d4-a716-446655440000',
        timestamp,
        expiration,
        sender: { agentName: 'test', agentRole: 'specialist', tier: 'sonnet' },
        recipient: { agentName: 'test2', agentRole: 'coordinator', tier: 'sonnet' },
        correlationId: '550e8400-e29b-41d4-a716-446655440001',
        priority: 'critical',
        body: { type: 'query', queryType: 'ask-for-help', subject: 'test', urgency: 'critical' },
        rawXml: '',
      };

      const violations = validator.validate(message);
      expect(violations.some(v => v.rule === 'priority-expiration-window')).toBe(true);
    });
  });

  describe('Retry Rules', () => {
    it('should warn about excessive max-attempts', () => {
      const message: ParsedMessage = {
        messageId: '550e8400-e29b-41d4-a716-446655440000',
        timestamp: new Date('2025-11-06T14:30:00Z'),
        expiration: new Date('2025-11-06T19:30:00Z'),
        sender: { agentName: 'test', agentRole: 'specialist', tier: 'sonnet' },
        recipient: { agentName: 'test2', agentRole: 'coordinator', tier: 'sonnet' },
        correlationId: '550e8400-e29b-41d4-a716-446655440001',
        priority: 'high',
        retryPolicy: {
          maxAttempts: 10,
          backoffStrategy: 'exponential',
          timeoutSeconds: 300,
        },
        body: { type: 'query', queryType: 'ask-for-help', subject: 'test', urgency: 'high' },
        rawXml: '',
      };

      const violations = validator.validate(message);
      expect(violations.some(v => v.rule === 'retry-max-attempts')).toBe(true);
    });

    it('should warn about exponential backoff explosion', () => {
      const message: ParsedMessage = {
        messageId: '550e8400-e29b-41d4-a716-446655440000',
        timestamp: new Date('2025-11-06T14:30:00Z'),
        expiration: new Date('2025-11-06T19:30:00Z'),
        sender: { agentName: 'test', agentRole: 'specialist', tier: 'sonnet' },
        recipient: { agentName: 'test2', agentRole: 'coordinator', tier: 'sonnet' },
        correlationId: '550e8400-e29b-41d4-a716-446655440001',
        priority: 'high',
        retryPolicy: {
          maxAttempts: 15,
          backoffStrategy: 'exponential',
          timeoutSeconds: 300,
        },
        body: { type: 'query', queryType: 'ask-for-help', subject: 'test', urgency: 'high' },
        rawXml: '',
      };

      const violations = validator.validate(message);
      expect(violations.some(v => v.rule === 'retry-exponential-explosion')).toBe(true);
    });
  });

  describe('Agent Hierarchy Rules', () => {
    it('should warn about coordinator sending to orchestrator', () => {
      const message: ParsedMessage = {
        messageId: '550e8400-e29b-41d4-a716-446655440000',
        timestamp: new Date('2025-11-06T14:30:00Z'),
        expiration: new Date('2025-11-06T19:30:00Z'),
        sender: { agentName: 'frontend-coordinator', agentRole: 'coordinator', tier: 'sonnet' },
        recipient: { agentName: 'tech-lead-orchestrator', agentRole: 'orchestrator', tier: 'opus' },
        correlationId: '550e8400-e29b-41d4-a716-446655440001',
        priority: 'high',
        body: { type: 'query', queryType: 'ask-for-help', subject: 'test', urgency: 'high' },
        rawXml: '',
      };

      const violations = validator.validate(message);
      expect(violations.some(v => v.rule === 'agent-hierarchy-coordinator-to-orchestrator')).toBe(true);
    });

    it('should warn about specialist-to-specialist communication', () => {
      const message: ParsedMessage = {
        messageId: '550e8400-e29b-41d4-a716-446655440000',
        timestamp: new Date('2025-11-06T14:30:00Z'),
        expiration: new Date('2025-11-06T19:30:00Z'),
        sender: { agentName: 'react-expert', agentRole: 'specialist', tier: 'sonnet' },
        recipient: { agentName: 'vue-expert', agentRole: 'specialist', tier: 'sonnet' },
        correlationId: '550e8400-e29b-41d4-a716-446655440001',
        priority: 'normal',
        body: { type: 'query', queryType: 'ask-for-help', subject: 'test', urgency: 'normal' },
        rawXml: '',
      };

      const violations = validator.validate(message);
      expect(violations.some(v => v.rule === 'agent-hierarchy-specialist-to-specialist')).toBe(true);
    });
  });
});

describe('ValidationErrorReporter', () => {
  let reporter: ValidationErrorReporter;

  beforeAll(() => {
    reporter = new ValidationErrorReporter();
  });

  it('should format validation errors with suggestions', () => {
    const result = {
      valid: false,
      errors: [{
        message: 'Missing required element: header',
        path: '/agent-message',
        severity: 'error' as const,
      }],
      warnings: [],
    };

    const violations: any[] = [];
    const xml = '<?xml version="1.0"?><agent-message></agent-message>';

    const report = reporter.format(result, violations, xml);

    expect(report.summary).toContain('error');
    expect(report.errors).toHaveLength(1);
    expect(report.suggestions.length).toBeGreaterThan(0);
  });

  it('should format text report correctly', () => {
    const result = {
      valid: false,
      errors: [{
        message: 'Invalid UUID format',
        path: '/agent-message/header/message-id',
        severity: 'error' as const,
      }],
      warnings: [],
    };

    const violations: any[] = [];
    const xml = '<?xml version="1.0"?><agent-message></agent-message>';

    const report = reporter.format(result, violations, xml);
    const text = reporter.formatAsText(report);

    expect(text).toContain('ERRORS:');
    expect(text).toContain('Invalid UUID format');
    expect(text).toContain('RFC 4122 format');
  });

  it('should generate success summary for valid messages', () => {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
    };

    const violations: any[] = [];
    const xml = '';

    const report = reporter.format(result, violations, xml);

    expect(report.summary).toContain('✅');
    expect(report.summary).toContain('passed');
  });
});
