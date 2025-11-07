import { MessageQueue } from '../message-queue';
import { RetryHandler } from '../retry-handler';
import { AgentRegistry } from '../agent-registry';
import { ParsedMessage } from '../../validators/types';
import * as path from 'path';

describe('MessageQueue', () => {
  let queue: MessageQueue;

  beforeEach(() => {
    queue = new MessageQueue();
  });

  const createTestMessage = (priority: 'critical' | 'high' | 'normal' | 'low', expiration: Date): ParsedMessage => ({
    messageId: `msg-${Date.now()}-${Math.random()}`,
    timestamp: new Date(),
    expiration,
    sender: { agentName: 'test-sender', agentRole: 'specialist', tier: 'sonnet' },
    recipient: { agentName: 'test-recipient', agentRole: 'coordinator', tier: 'sonnet' },
    correlationId: '550e8400-e29b-41d4-a716-446655440001',
    priority,
    body: { type: 'query', queryType: 'ask-for-help', subject: 'test', urgency: priority },
    rawXml: '',
  });

  describe('Priority Ordering', () => {
    it('should dequeue critical messages before high', () => {
      const futureDate = new Date(Date.now() + 60000);
      
      const highMsg = createTestMessage('high', futureDate);
      const criticalMsg = createTestMessage('critical', futureDate);

      queue.enqueue(highMsg);
      queue.enqueue(criticalMsg);

      const dequeued = queue.dequeue();
      expect(dequeued?.messageId).toBe(criticalMsg.messageId);
    });

    it('should dequeue high messages before normal', () => {
      const futureDate = new Date(Date.now() + 60000);
      
      const normalMsg = createTestMessage('normal', futureDate);
      const highMsg = createTestMessage('high', futureDate);

      queue.enqueue(normalMsg);
      queue.enqueue(highMsg);

      const dequeued = queue.dequeue();
      expect(dequeued?.messageId).toBe(highMsg.messageId);
    });

    it('should respect FIFO within same priority', () => {
      const futureDate = new Date(Date.now() + 60000);
      
      const msg1 = createTestMessage('normal', futureDate);
      const msg2 = createTestMessage('normal', futureDate);
      const msg3 = createTestMessage('normal', futureDate);

      queue.enqueue(msg1);
      queue.enqueue(msg2);
      queue.enqueue(msg3);

      expect(queue.dequeue()?.messageId).toBe(msg1.messageId);
      expect(queue.dequeue()?.messageId).toBe(msg2.messageId);
      expect(queue.dequeue()?.messageId).toBe(msg3.messageId);
    });
  });

  describe('Expiration Handling', () => {
    it('should skip expired messages when dequeuing', () => {
      const pastDate = new Date(Date.now() - 1000);
      const futureDate = new Date(Date.now() + 60000);
      
      const expiredMsg = createTestMessage('critical', pastDate);
      const validMsg = createTestMessage('normal', futureDate);

      queue.enqueue(expiredMsg);
      queue.enqueue(validMsg);

      const dequeued = queue.dequeue();
      expect(dequeued?.messageId).toBe(validMsg.messageId);
    });

    it('should purge expired messages', () => {
      const pastDate = new Date(Date.now() - 1000);
      const futureDate = new Date(Date.now() + 60000);
      
      queue.enqueue(createTestMessage('high', pastDate));
      queue.enqueue(createTestMessage('high', pastDate));
      queue.enqueue(createTestMessage('normal', futureDate));

      const purged = queue.purgeExpired();
      expect(purged).toBe(2);
      expect(queue.size()).toBe(1);
    });

    it('should return null when all messages are expired', () => {
      const pastDate = new Date(Date.now() - 1000);
      
      queue.enqueue(createTestMessage('critical', pastDate));
      queue.enqueue(createTestMessage('high', pastDate));

      expect(queue.dequeue()).toBeNull();
    });
  });

  describe('Queue Operations', () => {
    it('should track queue size correctly', () => {
      const futureDate = new Date(Date.now() + 60000);
      
      expect(queue.size()).toBe(0);
      queue.enqueue(createTestMessage('high', futureDate));
      expect(queue.size()).toBe(1);
      queue.enqueue(createTestMessage('normal', futureDate));
      expect(queue.size()).toBe(2);
      queue.dequeue();
      expect(queue.size()).toBe(1);
    });

    it('should track size by priority', () => {
      const futureDate = new Date(Date.now() + 60000);
      
      queue.enqueue(createTestMessage('critical', futureDate));
      queue.enqueue(createTestMessage('critical', futureDate));
      queue.enqueue(createTestMessage('high', futureDate));

      expect(queue.sizeByPriority('critical')).toBe(2);
      expect(queue.sizeByPriority('high')).toBe(1);
      expect(queue.sizeByPriority('normal')).toBe(0);
    });

    it('should find messages by ID', () => {
      const futureDate = new Date(Date.now() + 60000);
      const msg = createTestMessage('high', futureDate);
      
      queue.enqueue(msg);
      const found = queue.findById(msg.messageId);
      expect(found?.messageId).toBe(msg.messageId);
    });

    it('should remove messages by ID', () => {
      const futureDate = new Date(Date.now() + 60000);
      const msg = createTestMessage('high', futureDate);
      
      queue.enqueue(msg);
      expect(queue.size()).toBe(1);
      
      const removed = queue.removeById(msg.messageId);
      expect(removed).toBe(true);
      expect(queue.size()).toBe(0);
    });

    it('should clear all messages', () => {
      const futureDate = new Date(Date.now() + 60000);
      
      queue.enqueue(createTestMessage('critical', futureDate));
      queue.enqueue(createTestMessage('high', futureDate));
      queue.enqueue(createTestMessage('normal', futureDate));
      
      queue.clear();
      expect(queue.size()).toBe(0);
      expect(queue.isEmpty()).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should generate accurate statistics', () => {
      const futureDate = new Date(Date.now() + 60000);
      
      queue.enqueue(createTestMessage('critical', futureDate));
      queue.enqueue(createTestMessage('high', futureDate));
      queue.enqueue(createTestMessage('high', futureDate));
      queue.enqueue(createTestMessage('normal', futureDate));

      const stats = queue.getStats();
      expect(stats.totalMessages).toBe(4);
      expect(stats.byPriority.critical).toBe(1);
      expect(stats.byPriority.high).toBe(2);
      expect(stats.byPriority.normal).toBe(1);
      expect(stats.oldestEnqueueTime).not.toBeNull();
      expect(stats.newestEnqueueTime).not.toBeNull();
    });
  });
});

describe('RetryHandler', () => {
  let handler: RetryHandler;

  beforeEach(() => {
    handler = new RetryHandler();
  });

  const createTestMessage = (maxAttempts: number, backoffStrategy: 'exponential' | 'linear' | 'fixed'): ParsedMessage => ({
    messageId: `msg-${Date.now()}-${Math.random()}`,
    timestamp: new Date(),
    expiration: new Date(Date.now() + 60000),
    sender: { agentName: 'test-sender', agentRole: 'specialist', tier: 'sonnet' },
    recipient: { agentName: 'test-recipient', agentRole: 'coordinator', tier: 'sonnet' },
    correlationId: '550e8400-e29b-41d4-a716-446655440001',
    priority: 'high',
    retryPolicy: {
      maxAttempts,
      backoffStrategy,
      timeoutSeconds: 300,
    },
    body: { type: 'query', queryType: 'ask-for-help', subject: 'test', urgency: 'high' },
    rawXml: '',
  });

  describe('Retry Scheduling', () => {
    it('should schedule exponential backoff correctly', () => {
      const msg = createTestMessage(5, 'exponential');
      
      const schedule1 = handler.scheduleRetry(msg, new Error('Test error'));
      expect(schedule1).not.toBeNull();
      expect(schedule1!.attemptNumber).toBe(1);
      expect(schedule1!.backoffMs).toBe(1000); // 1s for first retry

      const schedule2 = handler.scheduleRetry(msg, new Error('Test error'));
      expect(schedule2!.attemptNumber).toBe(2);
      expect(schedule2!.backoffMs).toBe(2000); // 2s for second retry

      const schedule3 = handler.scheduleRetry(msg, new Error('Test error'));
      expect(schedule3!.attemptNumber).toBe(3);
      expect(schedule3!.backoffMs).toBe(4000); // 4s for third retry
    });

    it('should schedule linear backoff correctly', () => {
      const msg = createTestMessage(3, 'linear');
      
      const schedule1 = handler.scheduleRetry(msg, new Error('Test error'));
      expect(schedule1!.backoffMs).toBe(5000); // 5s for first retry

      const schedule2 = handler.scheduleRetry(msg, new Error('Test error'));
      expect(schedule2!.backoffMs).toBe(10000); // 10s for second retry
    });

    it('should schedule fixed backoff correctly', () => {
      const msg = createTestMessage(3, 'fixed');
      
      const schedule1 = handler.scheduleRetry(msg, new Error('Test error'));
      expect(schedule1!.backoffMs).toBe(30000); // Always 30s

      const schedule2 = handler.scheduleRetry(msg, new Error('Test error'));
      expect(schedule2!.backoffMs).toBe(30000); // Always 30s
    });

    it('should return null when max attempts exceeded', () => {
      const msg = createTestMessage(2, 'exponential');
      
      handler.scheduleRetry(msg, new Error('Error 1'));
      handler.scheduleRetry(msg, new Error('Error 2'));
      const schedule = handler.scheduleRetry(msg, new Error('Error 3'));
      
      expect(schedule).toBeNull();
    });
  });

  describe('Retry Metadata', () => {
    it('should record attempt metadata', () => {
      const msgId = 'test-msg-123';
      
      handler.recordAttempt(msgId, new Error('Test error'));
      const metadata = handler.getMetadata(msgId);
      
      expect(metadata).not.toBeUndefined();
      expect(metadata!.attemptCount).toBe(1);
      expect(metadata!.errors).toHaveLength(1);
    });

    it('should track multiple attempts', () => {
      const msgId = 'test-msg-456';
      
      handler.recordAttempt(msgId, new Error('Error 1'));
      handler.recordAttempt(msgId, new Error('Error 2'));
      handler.recordAttempt(msgId, new Error('Error 3'));
      
      const metadata = handler.getMetadata(msgId);
      expect(metadata!.attemptCount).toBe(3);
      expect(metadata!.errors).toHaveLength(3);
    });

    it('should clear metadata', () => {
      const msgId = 'test-msg-789';
      
      handler.recordAttempt(msgId);
      expect(handler.getMetadata(msgId)).not.toBeUndefined();
      
      handler.clearMetadata(msgId);
      expect(handler.getMetadata(msgId)).toBeUndefined();
    });
  });

  describe('Statistics', () => {
    it('should generate accurate retry statistics', () => {
      const msg1 = createTestMessage(5, 'exponential');
      const msg2 = createTestMessage(5, 'exponential');
      
      handler.scheduleRetry(msg1, new Error('Error'));
      handler.scheduleRetry(msg2, new Error('Error'));
      handler.scheduleRetry(msg2, new Error('Error'));
      
      const stats = handler.getStats();
      expect(stats.totalTracked).toBe(2);
      expect(stats.maxAttempts).toBe(2);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup stale metadata', async () => {
      const msgId = 'old-msg';
      
      handler.recordAttempt(msgId);
      expect(handler.size()).toBe(1);
      
      // Simulate old timestamp
      const metadata = handler.getMetadata(msgId)!;
      metadata.lastAttemptTime = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago
      
      const removed = handler.cleanupStale(24);
      expect(removed).toBe(1);
      expect(handler.size()).toBe(0);
    });
  });
});

describe('AgentRegistry', () => {
  let registry: AgentRegistry;
  const agentsPath = path.join(__dirname, '../../../agents');

  beforeAll(async () => {
    registry = await AgentRegistry.load(agentsPath);
  });

  describe('Agent Discovery', () => {
    it('should load agents from filesystem', () => {
      expect(registry.size()).toBeGreaterThan(0);
    });

    it('should find agents by name', () => {
      // Test with known agents
      const agents = registry.getAll();
      if (agents.length > 0) {
        const firstAgent = agents[0];
        const found = registry.findByName(firstAgent.name);
        expect(found).not.toBeUndefined();
        expect(found!.name).toBe(firstAgent.name);
      }
    });

    it('should find agents by role', () => {
      const coordinators = registry.findByRole('coordinator');
      const specialists = registry.findByRole('specialist');
      const orchestrators = registry.findByRole('orchestrator');
      
      // Should have at least some agents
      expect(coordinators.length + specialists.length + orchestrators.length).toBeGreaterThan(0);
    });

    it('should find agents by tier', () => {
      const opusAgents = registry.findByTier('opus');
      const sonnetAgents = registry.findByTier('sonnet');
      const haikuAgents = registry.findByTier('haiku');
      
      // Should have at least some agents
      expect(opusAgents.length + sonnetAgents.length + haikuAgents.length).toBeGreaterThan(0);
    });
  });

  describe('Routing Validation', () => {
    it('should validate coordinator to specialist routing', () => {
      const coordinators = registry.findByRole('coordinator');
      const specialists = registry.findByRole('specialist');
      
      if (coordinators.length > 0 && specialists.length > 0) {
        const canRoute = registry.canRoute(coordinators[0].name, specialists[0].name);
        expect(canRoute).toBe(true);
      }
    });

    it('should reject routing for unknown agents', () => {
      const canRoute = registry.canRoute('unknown-agent-1', 'unknown-agent-2');
      expect(canRoute).toBe(false);
    });
  });

  describe('Statistics', () => {
    it('should generate accurate statistics', () => {
      const stats = registry.getStats();
      
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.total).toBe(
        stats.byRole.coordinator +
        stats.byRole.specialist +
        stats.byRole.orchestrator
      );
      expect(stats.total).toBe(
        stats.byTier.opus +
        stats.byTier.sonnet +
        stats.byTier.haiku
      );
    });
  });
});
