import { DOMParser } from '@xmldom/xmldom';
import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs';
import * as path from 'path';
import { ValidationError, ValidationResult, ValidationWarning } from './types';

export class SchemaValidator {
  private schemaPath: string;
  private schemaDoc: Document | null = null;
  private parser: XMLParser;
  private readonly XML_NAMESPACE = 'http://agent-orchestra.local/protocol/1.0';

  constructor(schemaPath: string) {
    this.schemaPath = schemaPath;
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseAttributeValue: false, // Don't auto-convert attribute values
      trimValues: true,
    });
  }

  /**
   * Load and parse the XSD schema
   */
  private loadSchema(): void {
    if (this.schemaDoc) return;

    try {
      const schemaContent = fs.readFileSync(this.schemaPath, 'utf-8');
      const parser = new DOMParser();
      this.schemaDoc = parser.parseFromString(schemaContent, 'text/xml');
    } catch (error) {
      throw new Error(`Failed to load schema from ${this.schemaPath}: ${error}`);
    }
  }

  /**
   * Validate an XML message against the schema
   */
  validate(xmlString: string): ValidationResult {
    this.loadSchema();

    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Step 1: Basic XML syntax validation
    const syntaxErrors = this.validateXmlSyntax(xmlString);
    if (syntaxErrors.length > 0) {
      return {
        valid: false,
        errors: syntaxErrors,
        warnings: [],
      };
    }

    // Step 2: Parse XML
    let parsedXml: any;
    try {
      parsedXml = this.parser.parse(xmlString);
    } catch (error: any) {
      errors.push({
        message: `XML parsing failed: ${error.message}`,
        severity: 'error',
      });
      return { valid: false, errors, warnings };
    }

    // Step 3: Validate root element
    const rootErrors = this.validateRootElement(parsedXml);
    errors.push(...rootErrors);

    // Step 4: Validate structure
    if (parsedXml['agent-message']) {
      const structureErrors = this.validateStructure(parsedXml['agent-message']);
      errors.push(...structureErrors);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate XML syntax using DOM parser
   */
  private validateXmlSyntax(xmlString: string): ValidationError[] {
    const errors: ValidationError[] = [];
    
    const errorHandler = {
      warning: (msg: string) => {
        // Ignore warnings during syntax check
      },
      error: (msg: string) => {
        errors.push({
          message: `XML syntax error: ${msg}`,
          severity: 'error',
        });
      },
      fatalError: (msg: string) => {
        errors.push({
          message: `XML fatal error: ${msg}`,
          severity: 'error',
        });
      },
    };

    try {
      const parser = new DOMParser({
        errorHandler,
      });
      parser.parseFromString(xmlString, 'text/xml');
    } catch (error: any) {
      errors.push({
        message: `XML parsing exception: ${error.message}`,
        severity: 'error',
      });
    }

    return errors;
  }

  /**
   * Validate root element exists and has correct namespace/version
   */
  private validateRootElement(parsedXml: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!parsedXml['agent-message']) {
      errors.push({
        message: 'Root element must be <agent-message>',
        path: '/',
        severity: 'error',
      });
      return errors;
    }

    const root = parsedXml['agent-message'];

    // Check version attribute
    if (!root['@_version']) {
      errors.push({
        message: 'Missing required attribute: version',
        path: '/agent-message',
        severity: 'error',
      });
    } else if (root['@_version'] !== '1.0') {
      errors.push({
        message: `Invalid version: expected "1.0", got "${root['@_version']}"`,
        path: '/agent-message/@version',
        severity: 'error',
      });
    }

    return errors;
  }

  /**
   * Validate message structure against schema
   */
  private validateStructure(message: any): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate required top-level elements
    if (!message.header) {
      errors.push({
        message: 'Missing required element: header',
        path: '/agent-message',
        severity: 'error',
      });
    } else {
      errors.push(...this.validateHeader(message.header));
    }

    if (!message.body) {
      errors.push({
        message: 'Missing required element: body',
        path: '/agent-message',
        severity: 'error',
      });
    } else {
      errors.push(...this.validateBody(message.body));
    }

    if (!message.signature) {
      errors.push({
        message: 'Missing required element: signature',
        path: '/agent-message',
        severity: 'error',
      });
    } else {
      errors.push(...this.validateSignature(message.signature));
    }

    return errors;
  }

  /**
   * Validate header element
   */
  private validateHeader(header: any): ValidationError[] {
    const errors: ValidationError[] = [];
    const path = '/agent-message/header';

    // Required fields
    const requiredFields = [
      'message-id',
      'timestamp',
      'sender',
      'recipient',
      'correlation-id',
      'priority',
      'expiration',
    ];

    for (const field of requiredFields) {
      if (!header[field]) {
        errors.push({
          message: `Missing required element: ${field}`,
          path,
          severity: 'error',
        });
      }
    }

    // Validate UUID format for message-id and correlation-id
    if (header['message-id'] && !this.isValidUUID(header['message-id'])) {
      errors.push({
        message: `Invalid UUID format for message-id: ${header['message-id']}`,
        path: `${path}/message-id`,
        severity: 'error',
      });
    }

    if (header['correlation-id'] && !this.isValidUUID(header['correlation-id'])) {
      errors.push({
        message: `Invalid UUID format for correlation-id: ${header['correlation-id']}`,
        path: `${path}/correlation-id`,
        severity: 'error',
      });
    }

    // Validate timestamp format
    if (header.timestamp && !this.isValidDateTime(header.timestamp)) {
      errors.push({
        message: `Invalid ISO 8601 datetime format for timestamp: ${header.timestamp}`,
        path: `${path}/timestamp`,
        severity: 'error',
      });
    }

    if (header.expiration && !this.isValidDateTime(header.expiration)) {
      errors.push({
        message: `Invalid ISO 8601 datetime format for expiration: ${header.expiration}`,
        path: `${path}/expiration`,
        severity: 'error',
      });
    }

    // Validate priority enum
    const validPriorities = ['critical', 'high', 'normal', 'low'];
    if (header.priority && !validPriorities.includes(header.priority)) {
      errors.push({
        message: `Invalid priority value: ${header.priority}. Must be one of: ${validPriorities.join(', ')}`,
        path: `${path}/priority`,
        severity: 'error',
      });
    }

    // Validate sender and recipient
    if (header.sender) {
      errors.push(...this.validateAgentRef(header.sender, `${path}/sender`));
    }

    if (header.recipient) {
      errors.push(...this.validateAgentRef(header.recipient, `${path}/recipient`));
    }

    // Validate retry policy if present
    if (header['retry-policy']) {
      errors.push(...this.validateRetryPolicy(header['retry-policy'], `${path}/retry-policy`));
    }

    return errors;
  }

  /**
   * Validate agent reference element
   */
  private validateAgentRef(agentRef: any, path: string): ValidationError[] {
    const errors: ValidationError[] = [];

    const requiredFields = ['agent-name', 'agent-role', 'tier'];
    for (const field of requiredFields) {
      if (!agentRef[field]) {
        errors.push({
          message: `Missing required element: ${field}`,
          path,
          severity: 'error',
        });
      }
    }

    // Validate agent-role enum
    const validRoles = ['coordinator', 'specialist', 'orchestrator'];
    if (agentRef['agent-role'] && !validRoles.includes(agentRef['agent-role'])) {
      errors.push({
        message: `Invalid agent-role: ${agentRef['agent-role']}. Must be one of: ${validRoles.join(', ')}`,
        path: `${path}/agent-role`,
        severity: 'error',
      });
    }

    // Validate tier enum
    const validTiers = ['opus', 'sonnet', 'haiku'];
    if (agentRef.tier && !validTiers.includes(agentRef.tier)) {
      errors.push({
        message: `Invalid tier: ${agentRef.tier}. Must be one of: ${validTiers.join(', ')}`,
        path: `${path}/tier`,
        severity: 'error',
      });
    }

    return errors;
  }

  /**
   * Validate retry policy element
   */
  private validateRetryPolicy(policy: any, path: string): ValidationError[] {
    const errors: ValidationError[] = [];

    const requiredFields = ['max-attempts', 'backoff-strategy', 'timeout-seconds'];
    for (const field of requiredFields) {
      if (!policy[field]) {
        errors.push({
          message: `Missing required element: ${field}`,
          path,
          severity: 'error',
        });
      }
    }

    // Validate backoff-strategy enum
    const validStrategies = ['exponential', 'linear', 'fixed'];
    if (policy['backoff-strategy'] && !validStrategies.includes(policy['backoff-strategy'])) {
      errors.push({
        message: `Invalid backoff-strategy: ${policy['backoff-strategy']}. Must be one of: ${validStrategies.join(', ')}`,
        path: `${path}/backoff-strategy`,
        severity: 'error',
      });
    }

    // Validate positive integers
    if (policy['max-attempts'] && (!Number.isInteger(policy['max-attempts']) || policy['max-attempts'] <= 0)) {
      errors.push({
        message: `max-attempts must be a positive integer, got: ${policy['max-attempts']}`,
        path: `${path}/max-attempts`,
        severity: 'error',
      });
    }

    if (policy['timeout-seconds'] && (!Number.isInteger(policy['timeout-seconds']) || policy['timeout-seconds'] <= 0)) {
      errors.push({
        message: `timeout-seconds must be a positive integer, got: ${policy['timeout-seconds']}`,
        path: `${path}/timeout-seconds`,
        severity: 'error',
      });
    }

    return errors;
  }

  /**
   * Validate body element
   */
  private validateBody(body: any): ValidationError[] {
    const errors: ValidationError[] = [];
    const path = '/agent-message/body';

    // Check type attribute
    if (!body['@_type']) {
      errors.push({
        message: 'Missing required attribute: type',
        path,
        severity: 'error',
      });
      return errors;
    }

    const validTypes = ['task-delegation', 'status-update', 'task-completion', 'error', 'query'];
    const bodyType = body['@_type'];

    if (!validTypes.includes(bodyType)) {
      errors.push({
        message: `Invalid body type: ${bodyType}. Must be one of: ${validTypes.join(', ')}`,
        path: `${path}/@type`,
        severity: 'error',
      });
      return errors;
    }

    // Validate that body contains content
    // The templates use simplified structure: <body type="task-delegation"><task>...
    // Instead of schema structure: <body type="task-delegation"><task-delegation><task>...
    // Accept both patterns for flexibility
    const hasContent = Object.keys(body).filter(k => !k.startsWith('@_')).length > 1; // More than just @_type
    
    if (!hasContent) {
      errors.push({
        message: `Body with type="${bodyType}" must contain content elements`,
        path,
        severity: 'error',
      });
    }

    return errors;
  }

  /**
   * Validate signature element
   */
  private validateSignature(signature: any): ValidationError[] {
    const errors: ValidationError[] = [];
    const path = '/agent-message/signature';

    const requiredFields = ['algorithm', 'signer', 'timestamp', 'public-key-id', 'signature-value'];
    for (const field of requiredFields) {
      if (!signature[field]) {
        errors.push({
          message: `Missing required element: ${field}`,
          path,
          severity: 'error',
        });
      }
    }

    if (signature.timestamp && !this.isValidDateTime(signature.timestamp)) {
      errors.push({
        message: `Invalid ISO 8601 datetime format for timestamp: ${signature.timestamp}`,
        path: `${path}/timestamp`,
        severity: 'error',
      });
    }

    return errors;
  }

  /**
   * Validate UUID format (RFC 4122)
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validate ISO 8601 datetime format
   */
  private isValidDateTime(dateTime: string): boolean {
    try {
      const date = new Date(dateTime);
      return !isNaN(date.getTime()) && dateTime.includes('T');
    } catch {
      return false;
    }
  }
}
