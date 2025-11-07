import { ParsedMessage } from '../validators/types';
import { RetryMetadata, RetrySchedule, RetryPolicy, BackoffStrategy } from './types';

export class RetryHandler {
  private retryMetadata: Map<string, RetryMetadata>;
  private readonly baseDelayMs: number = 1000; // 1 second base delay

  constructor() {
    this.retryMetadata = new Map();
  }

  /**
   * Record a delivery attempt for a message
   */
  recordAttempt(messageId: string, error?: Error): void {
    const existing = this.retryMetadata.get(messageId);

    if (existing) {
      existing.attemptCount++;
      existing.lastAttemptTime = new Date();
      if (error) {
        existing.errors.push(error.message);
      }
    } else {
      this.retryMetadata.set(messageId, {
        messageId,
        attemptCount: 1,
        lastAttemptTime: new Date(),
        nextAttemptTime: null,
        errors: error ? [error.message] : [],
      });
    }
  }

  /**
   * Determine if a message should be retried based on policy
   */
  shouldRetry(messageId: string, policy: RetryPolicy): boolean {
    const metadata = this.retryMetadata.get(messageId);
    if (!metadata) {
      return true; // First attempt
    }

    return metadata.attemptCount < policy.maxAttempts;
  }

  /**
   * Schedule the next retry attempt
   * Returns null if max attempts exceeded or message should not be retried
   */
  scheduleRetry(message: ParsedMessage, error: Error): RetrySchedule | null {
    if (!message.retryPolicy) {
      return null; // No retry policy defined
    }

    this.recordAttempt(message.messageId, error);

    if (!this.shouldRetry(message.messageId, message.retryPolicy)) {
      return null; // Max attempts exceeded
    }

    const metadata = this.retryMetadata.get(message.messageId)!;
    const attemptNumber = metadata.attemptCount;
    const backoffMs = this.calculateBackoff(
      attemptNumber,
      message.retryPolicy.backoffStrategy
    );

    const nextAttemptTime = new Date(Date.now() + backoffMs);
    metadata.nextAttemptTime = nextAttemptTime;

    return {
      messageId: message.messageId,
      nextAttemptTime,
      attemptNumber,
      backoffMs,
    };
  }

  /**
   * Calculate backoff delay based on strategy
   */
  private calculateBackoff(attemptNumber: number, strategy: BackoffStrategy): number {
    switch (strategy) {
      case 'exponential':
        // 1s, 2s, 4s, 8s, 16s, ...
        return this.baseDelayMs * Math.pow(2, attemptNumber - 1);

      case 'linear':
        // 5s, 10s, 15s, 20s, ...
        return this.baseDelayMs * 5 * attemptNumber;

      case 'fixed':
        // Always 30s
        return 30 * 1000;

      default:
        throw new Error(`Unknown backoff strategy: ${strategy}`);
    }
  }

  /**
   * Get retry metadata for a message
   */
  getMetadata(messageId: string): RetryMetadata | undefined {
    return this.retryMetadata.get(messageId);
  }

  /**
   * Check if a message is ready for retry
   */
  isReadyForRetry(messageId: string): boolean {
    const metadata = this.retryMetadata.get(messageId);
    if (!metadata || !metadata.nextAttemptTime) {
      return false;
    }

    return new Date() >= metadata.nextAttemptTime;
  }

  /**
   * Get all messages that are ready for retry
   */
  getReadyForRetry(): string[] {
    const ready: string[] = [];
    const now = new Date();

    for (const [messageId, metadata] of this.retryMetadata.entries()) {
      if (metadata.nextAttemptTime && now >= metadata.nextAttemptTime) {
        ready.push(messageId);
      }
    }

    return ready;
  }

  /**
   * Clear retry metadata for a message (e.g., after successful delivery)
   */
  clearMetadata(messageId: string): void {
    this.retryMetadata.delete(messageId);
  }

  /**
   * Clear all retry metadata
   */
  clearAll(): void {
    this.retryMetadata.clear();
  }

  /**
   * Get count of messages with retry metadata
   */
  size(): number {
    return this.retryMetadata.size;
  }

  /**
   * Get statistics about retry attempts
   */
  getStats(): {
    totalTracked: number;
    pendingRetries: number;
    avgAttempts: number;
    maxAttempts: number;
  } {
    const now = new Date();
    let totalAttempts = 0;
    let maxAttempts = 0;
    let pendingRetries = 0;

    for (const metadata of this.retryMetadata.values()) {
      totalAttempts += metadata.attemptCount;
      maxAttempts = Math.max(maxAttempts, metadata.attemptCount);

      if (metadata.nextAttemptTime && now < metadata.nextAttemptTime) {
        pendingRetries++;
      }
    }

    const totalTracked = this.retryMetadata.size;
    const avgAttempts = totalTracked > 0 ? totalAttempts / totalTracked : 0;

    return {
      totalTracked,
      pendingRetries,
      avgAttempts: Math.round(avgAttempts * 100) / 100,
      maxAttempts,
    };
  }

  /**
   * Clean up old metadata (messages not attempted in last 24 hours)
   */
  cleanupStale(maxAgeHours: number = 24): number {
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    let removed = 0;

    for (const [messageId, metadata] of this.retryMetadata.entries()) {
      if (metadata.lastAttemptTime < cutoffTime) {
        this.retryMetadata.delete(messageId);
        removed++;
      }
    }

    return removed;
  }
}
