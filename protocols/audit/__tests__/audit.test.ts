import * as fs from 'fs';
import * as path from 'path';
import { MessageStore } from '../message-store';
import { MessageSearch } from '../message-search';
import { MessageReplay } from '../message-replay';
import { AuditLogger } from '../audit-logger';
import { SchemaValidator } from '../../validators/schema-validator';
import { BusinessRulesValidator } from '../../validators/business-rules-validator';
import { ParsedMessage } from '../../validators/types';

describe('MessageStore', () => {
  let store: MessageStore;
  const dbPath = ':memory:'; // Use in-memory database for tests

  beforeEach(() => {
    store = new MessageStore(dbPath);
  });

  afterEach(() => {
    store.close();
  });

  const createTestMessage = (): ParsedMessage => ({
    messageId: `msg-${Date.now()}-${Math.random()}`,
    timestamp: new Date(),
    expiration: new Date(Date.now() + 60000),
    sender: { agentName: 'test-sender', agentRole: 'specialist', tier: 'sonnet' },
    recipient: { agentName: 'test-recipient', agentRole: 'coordinator', tier: 'sonnet' },
    correlationId: '550e8400-e29b-41d4-a716-446655440001',
    priority: 'high',
    body: { type: 'query', queryType: 'ask-for-help', subject: 'test', urgency: 'high' },
    rawXml: '<?xml version="1.0"?><agent-message></agent-message>',
  });

  describe('Message Persistence', () => {
    it('should save and retrieve a message', () => {
      const message = createTestMessage();
      store.save(message, message.rawXml);

      const retrieved = store.findById(message.messageId);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.message_id).toBe(message.messageId);
      expect(retrieved!.correlation_id).toBe(message.correlationId);
    });

    it('should find messages by correlation ID', () => {
      const correlationId = 'test-correlation-123';
      const msg1 = createTestMessage();
      const msg2 = createTestMessage();
      msg1.correlationId = correlationId;
      msg2.correlationId = correlationId;

      store.save(msg1, msg1.rawXml);
      store.save(msg2, msg2.rawXml);

      const messages = store.findByCorrelation(correlationId);
      expect(messages).toHaveLength(2);
    });

    it('should find messages by sender', () => {
      const msg1 = createTestMessage();
      const msg2 = createTestMessage();
      msg1.sender.agentName = 'sender-A';
      msg2.sender.agentName = 'sender-A';

      store.save(msg1, msg1.rawXml);
      store.save(msg2, msg2.rawXml);

      const messages = store.findBySender('sender-A');
      expect(messages.length).toBeGreaterThanOrEqual(2);
    });

    it('should find messages by recipient', () => {
      const msg = createTestMessage();
      msg.recipient.agentName = 'recipient-B';

      store.save(msg, msg.rawXml);

      const messages = store.findByRecipient('recipient-B');
      expect(messages.length).toBeGreaterThanOrEqual(1);
    });

    it('should update message status', () => {
      const message = createTestMessage();
      store.save(message, message.rawXml, 'pending');

      store.updateStatus(message.messageId, 'delivered');

      const retrieved = store.findById(message.messageId);
      expect(retrieved!.status).toBe('delivered');
    });
  });

  describe('Delivery Logging', () => {
    it('should log delivery attempts', () => {
      const message = createTestMessage();
      store.save(message, message.rawXml);

      store.logDelivery(message.messageId, 1, 'success');
      store.logDelivery(message.messageId, 2, 'retry', 'Timeout error');

      const logs = store.getDeliveryLogs(message.messageId);
      expect(logs).toHaveLength(2);
      expect(logs[0].status).toBe('success');
      expect(logs[1].status).toBe('retry');
      expect(logs[1].error_message).toBe('Timeout error');
    });
  });

  describe('Statistics', () => {
    it('should count messages correctly', () => {
      const msg1 = createTestMessage();
      const msg2 = createTestMessage();

      const initialCount = store.count();

      store.save(msg1, msg1.rawXml);
      store.save(msg2, msg2.rawXml);

      expect(store.count()).toBe(initialCount + 2);
    });

    it('should count by status', () => {
      const msg1 = createTestMessage();
      const msg2 = createTestMessage();

      store.save(msg1, msg1.rawXml, 'pending');
      store.save(msg2, msg2.rawXml, 'delivered');

      expect(store.countByStatus('pending')).toBeGreaterThanOrEqual(1);
      expect(store.countByStatus('delivered')).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('MessageSearch', () => {
  let store: MessageStore;
  let search: MessageSearch;
  const dbPath = ':memory:';

  beforeEach(() => {
    store = new MessageStore(dbPath);
    search = new MessageSearch(store);
  });

  afterEach(() => {
    store.close();
  });

  const createTestMessage = (overrides?: Partial<ParsedMessage>): ParsedMessage => ({
    messageId: `msg-${Date.now()}-${Math.random()}`,
    timestamp: new Date(),
    expiration: new Date(Date.now() + 60000),
    sender: { agentName: 'test-sender', agentRole: 'specialist', tier: 'sonnet' },
    recipient: { agentName: 'test-recipient', agentRole: 'coordinator', tier: 'sonnet' },
    correlationId: '550e8400-e29b-41d4-a716-446655440001',
    priority: 'high',
    body: { type: 'query', queryType: 'ask-for-help', subject: 'test', urgency: 'high' },
    rawXml: '<?xml version="1.0"?><agent-message></agent-message>',
    ...overrides,
  });

  describe('Search Operations', () => {
    it('should search by multiple criteria', () => {
      const msg1 = createTestMessage({ priority: 'critical' });
      const msg2 = createTestMessage({ priority: 'normal' });

      store.save(msg1, msg1.rawXml);
      store.save(msg2, msg2.rawXml);

      const results = search.search({ priority: 'critical' });
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.every(r => r.priority === 'critical')).toBe(true);
    });

    it('should find by body type', () => {
      const msg = createTestMessage();
      store.save(msg, msg.rawXml);

      const results = search.findByBodyType('query');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find by priority', () => {
      const msg = createTestMessage({ priority: 'high' });
      store.save(msg, msg.rawXml);

      const results = search.findByPriority('high');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Statistics', () => {
    it('should generate message statistics', () => {
      const msg1 = createTestMessage({ priority: 'high' });
      const msg2 = createTestMessage({ priority: 'normal' });

      store.save(msg1, msg1.rawXml, 'delivered');
      store.save(msg2, msg2.rawXml, 'delivered');

      const stats = search.getStats();
      expect(stats.totalMessages).toBeGreaterThanOrEqual(2);
      expect(stats.byPriority).toHaveProperty('high');
      expect(stats.byPriority).toHaveProperty('normal');
    });
  });
});

describe('MessageReplay', () => {
  let store: MessageStore;
  let replay: MessageReplay;
  let schemaValidator: SchemaValidator;
  let businessValidator: BusinessRulesValidator;
  const dbPath = ':memory:';
  const schemaPath = path.join(__dirname, '../../agent-message-v1.0.xsd');

  beforeEach(() => {
    store = new MessageStore(dbPath);
    schemaValidator = new SchemaValidator(schemaPath);
    businessValidator = new BusinessRulesValidator();
    replay = new MessageReplay(store, schemaValidator, businessValidator);
  });

  afterEach(() => {
    store.close();
  });

  describe('Replay Operations', () => {
    it('should validate message without replaying (dry run)', async () => {
      const xmlPath = path.join(__dirname, '../../templates/query.xml');
      const xml = fs.readFileSync(xmlPath, 'utf-8');

      const message: ParsedMessage = {
        messageId: 'test-msg-123',
        timestamp: new Date(),
        expiration: new Date(Date.now() + 60000),
        sender: { agentName: 'test-sender', agentRole: 'specialist', tier: 'sonnet' },
        recipient: { agentName: 'test-recipient', agentRole: 'coordinator', tier: 'sonnet' },
        correlationId: '550e8400-e29b-41d4-a716-446655440001',
        priority: 'high',
        body: { type: 'query', queryType: 'ask-for-help', subject: 'test', urgency: 'high' },
        rawXml: xml,
      };

      store.save(message, xml);

      const result = await replay.replay('test-msg-123', { dryRun: true });
      expect(result.success).toBe(true);
      expect(result.validationResult).toBeDefined();
    });

    it('should handle non-existent message', async () => {
      const result = await replay.replay('non-existent-id');
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('Validation', () => {
    it('should validate stored message', async () => {
      const xmlPath = path.join(__dirname, '../../templates/query.xml');
      const xml = fs.readFileSync(xmlPath, 'utf-8');

      const message: ParsedMessage = {
        messageId: 'test-msg-456',
        timestamp: new Date(),
        expiration: new Date(Date.now() + 60000),
        sender: { agentName: 'test-sender', agentRole: 'specialist', tier: 'sonnet' },
        recipient: { agentName: 'test-recipient', agentRole: 'coordinator', tier: 'sonnet' },
        correlationId: '550e8400-e29b-41d4-a716-446655440001',
        priority: 'high',
        body: { type: 'query', queryType: 'ask-for-help', subject: 'test', urgency: 'high' },
        rawXml: xml,
      };

      store.save(message, xml);

      const validationResult = await replay.validate('test-msg-456');
      expect(validationResult.valid).toBe(true);
    });
  });
});

describe('AuditLogger', () => {
  let logger: AuditLogger;
  const dbPath = ':memory:';

  beforeEach(() => {
    logger = new AuditLogger(dbPath);
  });

  afterEach(() => {
    logger.close();
  });

  describe('Event Logging', () => {
    it('should log audit events', () => {
      logger.log({
        timestamp: new Date(),
        eventType: 'message-received',
        messageId: 'msg-123',
        actorAgent: 'test-agent',
        details: { info: 'test event' },
      });

      const trail = logger.getAuditTrail('msg-123');
      expect(trail).toHaveLength(1);
      expect(trail[0].eventType).toBe('message-received');
      expect(trail[0].immutableHash).toBeDefined();
    });

    it('should track multiple events for same message', () => {
      logger.log({
        timestamp: new Date(),
        eventType: 'message-received',
        messageId: 'msg-456',
        actorAgent: 'agent-A',
        details: {},
      });

      logger.log({
        timestamp: new Date(),
        eventType: 'validation-passed',
        messageId: 'msg-456',
        actorAgent: 'agent-A',
        details: {},
      });

      logger.log({
        timestamp: new Date(),
        eventType: 'delivery-success',
        messageId: 'msg-456',
        actorAgent: 'agent-B',
        details: {},
      });

      const trail = logger.getAuditTrail('msg-456');
      expect(trail).toHaveLength(3);
    });
  });

  describe('Integrity Verification', () => {
    it('should verify event integrity', () => {
      logger.log({
        timestamp: new Date(),
        eventType: 'message-queued',
        messageId: 'msg-789',
        actorAgent: 'queue-agent',
        details: { priority: 'high' },
      });

      const trail = logger.getAuditTrail('msg-789');
      const eventId = trail[0].eventId;

      const isValid = logger.verifyIntegrity(eventId);
      expect(isValid).toBe(true);
    });

    it('should batch verify integrity', () => {
      logger.log({
        timestamp: new Date(),
        eventType: 'message-received',
        messageId: 'msg-batch-1',
        actorAgent: 'agent',
        details: {},
      });

      logger.log({
        timestamp: new Date(),
        eventType: 'message-received',
        messageId: 'msg-batch-2',
        actorAgent: 'agent',
        details: {},
      });

      const results = logger.verifyIntegrityBatch();
      expect(results.total).toBeGreaterThanOrEqual(2);
      expect(results.verified).toBe(results.total);
      expect(results.failed).toBe(0);
    });
  });

  describe('Compliance Reports', () => {
    it('should generate compliance report', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      logger.log({
        timestamp: now,
        eventType: 'validation-passed',
        messageId: 'msg-report-1',
        actorAgent: 'validator',
        details: {},
      });

      logger.log({
        timestamp: now,
        eventType: 'validation-failed',
        messageId: 'msg-report-2',
        actorAgent: 'validator',
        details: {},
      });

      const report = logger.generateReport({
        start: yesterday,
        end: new Date(now.getTime() + 1000),
      });

      expect(report.totalEvents).toBeGreaterThanOrEqual(2);
      expect(report.validationFailures).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Search', () => {
    it('should search by event type', () => {
      logger.log({
        timestamp: new Date(),
        eventType: 'delivery-attempted',
        messageId: 'msg-search-1',
        actorAgent: 'delivery-agent',
        details: {},
      });

      const events = logger.getEventsByType('delivery-attempted');
      expect(events.length).toBeGreaterThanOrEqual(1);
    });

    it('should search by actor', () => {
      logger.log({
        timestamp: new Date(),
        eventType: 'message-received',
        messageId: 'msg-actor-1',
        actorAgent: 'specific-agent',
        details: {},
      });

      const events = logger.getEventsByActor('specific-agent');
      expect(events.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Statistics', () => {
    it('should generate audit statistics', () => {
      logger.log({
        timestamp: new Date(),
        eventType: 'message-received',
        messageId: 'msg-stats-1',
        actorAgent: 'agent-1',
        details: {},
      });

      logger.log({
        timestamp: new Date(),
        eventType: 'message-received',
        messageId: 'msg-stats-2',
        actorAgent: 'agent-2',
        details: {},
      });

      const stats = logger.getStats();
      expect(stats.totalEvents).toBeGreaterThanOrEqual(2);
      expect(stats.uniqueMessages).toBeGreaterThanOrEqual(2);
      expect(stats.uniqueActors).toBeGreaterThanOrEqual(2);
    });
  });
});
