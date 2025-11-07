// Type definitions for audit system

export type MessageStatus = 'pending' | 'delivered' | 'failed' | 'expired';
export type DeliveryStatus = 'success' | 'retry' | 'failed';

export interface StoredMessage {
  id: number;
  message_id: string;
  correlation_id: string;
  sender: string;
  recipient: string;
  body_type: string;
  priority: string;
  timestamp: string;
  expiration: string;
  raw_xml: string;
  status: MessageStatus;
  created_at: string;
}

export interface DeliveryLog {
  id: number;
  message_id: string;
  attempt_number: number;
  status: DeliveryStatus;
  error_message?: string;
  delivered_at: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface MessageStats {
  totalMessages: number;
  byPriority: Record<string, number>;
  byBodyType: Record<string, number>;
  deliveryRate: number;
  avgDeliveryTime: number;
}

export type AuditEventType = 
  | 'message-received'
  | 'validation-passed'
  | 'validation-failed'
  | 'message-queued'
  | 'delivery-attempted'
  | 'delivery-success'
  | 'delivery-failed'
  | 'message-expired'
  | 'message-replayed';

export interface AuditEvent {
  eventId: string;
  timestamp: Date;
  eventType: AuditEventType;
  messageId: string;
  actorAgent: string;
  details: Record<string, any>;
  immutableHash: string;
}

export interface ComplianceReport {
  timeRange: DateRange;
  totalEvents: number;
  byEventType: Record<AuditEventType, number>;
  validationFailures: number;
  deliverySuccessRate: number;
  averageDeliveryTime: number;
  expiredMessages: number;
}
