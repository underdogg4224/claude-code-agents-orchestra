// Type definitions for routing system

export type PriorityLevel = 'critical' | 'high' | 'normal' | 'low';
export type BackoffStrategy = 'exponential' | 'linear' | 'fixed';

export interface RetryMetadata {
  messageId: string;
  attemptCount: number;
  lastAttemptTime: Date;
  nextAttemptTime: Date | null;
  errors: string[];
}

export interface RetrySchedule {
  messageId: string;
  nextAttemptTime: Date;
  attemptNumber: number;
  backoffMs: number;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: BackoffStrategy;
  timeoutSeconds: number;
}
