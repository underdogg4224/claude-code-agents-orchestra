// Type definitions for validation system

export interface ValidationError {
  line?: number;
  column?: number;
  message: string;
  path?: string;
  severity: 'error';
}

export interface ValidationWarning {
  line?: number;
  column?: number;
  message: string;
  path?: string;
  severity: 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface RuleViolation {
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  path?: string;
  suggestion?: string;
}

export interface ParsedMessage {
  messageId: string;
  timestamp: Date;
  sender: {
    agentName: string;
    agentRole: 'coordinator' | 'specialist' | 'orchestrator';
    tier: 'opus' | 'sonnet' | 'haiku';
  };
  recipient: {
    agentName: string;
    agentRole: 'coordinator' | 'specialist' | 'orchestrator';
    tier: 'opus' | 'sonnet' | 'haiku';
  };
  correlationId: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
  expiration: Date;
  retryPolicy?: {
    maxAttempts: number;
    backoffStrategy: 'exponential' | 'linear' | 'fixed';
    timeoutSeconds: number;
  };
  body: MessageBody;
  rawXml: string;
}

export type MessageBody = 
  | TaskDelegationBody
  | StatusUpdateBody
  | TaskCompletionBody
  | ErrorBody
  | QueryBody;

export interface TaskDelegationBody {
  type: 'task-delegation';
  task: {
    taskId: string;
    taskType: string;
    title: string;
    description: string;
  };
  assignment: {
    assignedTo: string;
    assignedBy: string;
    assignedTimestamp: Date;
  };
}

export interface StatusUpdateBody {
  type: 'status-update';
  taskId: string;
  status: 'in-progress' | 'blocked' | 'completed' | 'failed' | 'pending';
  progressPercentage: number;
  currentActivity: string;
}

export interface TaskCompletionBody {
  type: 'task-completion';
  taskId: string;
  status: 'success' | 'partial-success' | 'failed';
  summary: string;
  completionTimestamp: Date;
}

export interface ErrorBody {
  type: 'error';
  errorId: string;
  errorType: 'task-failed' | 'timeout' | 'blocked' | 'validation-error' | 'system-error';
  severity: 'critical' | 'warning' | 'info';
  message: string;
}

export interface QueryBody {
  type: 'query';
  queryType: 'ask-for-help' | 'request-review' | 'request-analysis' | 'get-status' | 'request-guidance';
  subject: string;
  urgency: 'critical' | 'high' | 'normal' | 'low';
}
