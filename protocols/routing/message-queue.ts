import { ParsedMessage } from '../validators/types';
import { PriorityLevel } from './types';

interface QueuedMessage {
  message: ParsedMessage;
  enqueuedAt: Date;
}

export class MessageQueue {
  private queues: Map<PriorityLevel, QueuedMessage[]>;
  private readonly priorityOrder: PriorityLevel[] = ['critical', 'high', 'normal', 'low'];

  constructor() {
    this.queues = new Map();
    for (const priority of this.priorityOrder) {
      this.queues.set(priority, []);
    }
  }

  /**
   * Add a message to the queue based on its priority
   */
  enqueue(message: ParsedMessage): void {
    const queue = this.queues.get(message.priority);
    if (!queue) {
      throw new Error(`Invalid priority: ${message.priority}`);
    }

    queue.push({
      message,
      enqueuedAt: new Date(),
    });
  }

  /**
   * Remove and return the highest priority non-expired message
   */
  dequeue(): ParsedMessage | null {
    for (const priority of this.priorityOrder) {
      const queue = this.queues.get(priority);
      if (!queue || queue.length === 0) continue;

      // Find first non-expired message
      const now = new Date();
      const index = queue.findIndex(qm => qm.message.expiration > now);
      
      if (index !== -1) {
        const [queuedMessage] = queue.splice(index, 1);
        return queuedMessage.message;
      }
    }

    return null;
  }

  /**
   * Peek at the next message without removing it
   */
  peek(): ParsedMessage | null {
    const now = new Date();

    for (const priority of this.priorityOrder) {
      const queue = this.queues.get(priority);
      if (!queue || queue.length === 0) continue;

      const queuedMessage = queue.find(qm => qm.message.expiration > now);
      if (queuedMessage) {
        return queuedMessage.message;
      }
    }

    return null;
  }

  /**
   * Remove expired messages from all queues
   * Returns the number of messages purged
   */
  purgeExpired(): number {
    let purgedCount = 0;
    const now = new Date();

    for (const queue of this.queues.values()) {
      const originalLength = queue.length;
      const filtered = queue.filter(qm => qm.message.expiration > now);
      queue.length = 0;
      queue.push(...filtered);
      purgedCount += originalLength - filtered.length;
    }

    return purgedCount;
  }

  /**
   * Get the total number of messages in all queues
   */
  size(): number {
    let total = 0;
    for (const queue of this.queues.values()) {
      total += queue.length;
    }
    return total;
  }

  /**
   * Get the number of messages for a specific priority
   */
  sizeByPriority(priority: PriorityLevel): number {
    const queue = this.queues.get(priority);
    return queue ? queue.length : 0;
  }

  /**
   * Check if the queue is empty
   */
  isEmpty(): boolean {
    return this.size() === 0;
  }

  /**
   * Clear all messages from all queues
   */
  clear(): void {
    for (const queue of this.queues.values()) {
      queue.length = 0;
    }
  }

  /**
   * Get all messages from a specific priority queue (without removing them)
   */
  getMessagesByPriority(priority: PriorityLevel): ParsedMessage[] {
    const queue = this.queues.get(priority);
    return queue ? queue.map(qm => qm.message) : [];
  }

  /**
   * Find a message by ID across all queues
   */
  findById(messageId: string): ParsedMessage | null {
    for (const queue of this.queues.values()) {
      const queuedMessage = queue.find(qm => qm.message.messageId === messageId);
      if (queuedMessage) {
        return queuedMessage.message;
      }
    }
    return null;
  }

  /**
   * Remove a specific message by ID
   * Returns true if message was found and removed
   */
  removeById(messageId: string): boolean {
    for (const queue of this.queues.values()) {
      const index = queue.findIndex(qm => qm.message.messageId === messageId);
      if (index !== -1) {
        queue.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    totalMessages: number;
    byPriority: Record<PriorityLevel, number>;
    oldestEnqueueTime: Date | null;
    newestEnqueueTime: Date | null;
  } {
    let oldestTime: Date | null = null;
    let newestTime: Date | null = null;

    const byPriority: Record<PriorityLevel, number> = {
      critical: 0,
      high: 0,
      normal: 0,
      low: 0,
    };

    for (const [priority, queue] of this.queues.entries()) {
      byPriority[priority] = queue.length;

      for (const qm of queue) {
        if (!oldestTime || qm.enqueuedAt < oldestTime) {
          oldestTime = qm.enqueuedAt;
        }
        if (!newestTime || qm.enqueuedAt > newestTime) {
          newestTime = qm.enqueuedAt;
        }
      }
    }

    return {
      totalMessages: this.size(),
      byPriority,
      oldestEnqueueTime: oldestTime,
      newestEnqueueTime: newestTime,
    };
  }
}
