import Database from 'better-sqlite3';
import * as crypto from 'crypto';
import { AuditEvent, AuditEventType, DateRange, ComplianceReport } from './types';

export class AuditLogger {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.initializeSchema();
  }

  /**
   * Initialize audit log schema
   */
  private initializeSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS audit_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id TEXT UNIQUE NOT NULL,
        timestamp TEXT NOT NULL,
        event_type TEXT NOT NULL,
        message_id TEXT NOT NULL,
        actor_agent TEXT NOT NULL,
        details TEXT NOT NULL,
        immutable_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_audit_event_type ON audit_events(event_type);
      CREATE INDEX IF NOT EXISTS idx_audit_message_id ON audit_events(message_id);
      CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_events(timestamp);
      CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_events(actor_agent);
    `);
  }

  /**
   * Log an audit event
   */
  log(event: Omit<AuditEvent, 'eventId' | 'immutableHash'>): void {
    const eventId = crypto.randomUUID();
    const timestamp = event.timestamp.toISOString();
    const detailsJson = JSON.stringify(event.details);

    // Calculate immutable hash
    const hashData = `${eventId}|${timestamp}|${event.eventType}|${event.messageId}|${event.actorAgent}|${detailsJson}`;
    const immutableHash = crypto.createHash('sha256').update(hashData).digest('hex');

    const stmt = this.db.prepare(`
      INSERT INTO audit_events (
        event_id, timestamp, event_type, message_id, actor_agent, details, immutable_hash, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      eventId,
      timestamp,
      event.eventType,
      event.messageId,
      event.actorAgent,
      detailsJson,
      immutableHash,
      new Date().toISOString()
    );
  }

  /**
   * Get audit trail for a specific message
   */
  getAuditTrail(messageId: string): AuditEvent[] {
    const stmt = this.db.prepare(`
      SELECT * FROM audit_events 
      WHERE message_id = ? 
      ORDER BY timestamp ASC
    `);

    const rows = stmt.all(messageId) as any[];
    return rows.map(row => this.mapRowToEvent(row));
  }

  /**
   * Get audit events by type
   */
  getEventsByType(eventType: AuditEventType, limit?: number): AuditEvent[] {
    const sql = limit
      ? 'SELECT * FROM audit_events WHERE event_type = ? ORDER BY timestamp DESC LIMIT ?'
      : 'SELECT * FROM audit_events WHERE event_type = ? ORDER BY timestamp DESC';

    const stmt = this.db.prepare(sql);
    const rows = (limit ? stmt.all(eventType, limit) : stmt.all(eventType)) as any[];
    return rows.map(row => this.mapRowToEvent(row));
  }

  /**
   * Get audit events by actor
   */
  getEventsByActor(actorAgent: string, limit?: number): AuditEvent[] {
    const sql = limit
      ? 'SELECT * FROM audit_events WHERE actor_agent = ? ORDER BY timestamp DESC LIMIT ?'
      : 'SELECT * FROM audit_events WHERE actor_agent = ? ORDER BY timestamp DESC';

    const stmt = this.db.prepare(sql);
    const rows = (limit ? stmt.all(actorAgent, limit) : stmt.all(actorAgent)) as any[];
    return rows.map(row => this.mapRowToEvent(row));
  }

  /**
   * Get audit events within a time range
   */
  getEventsByTimeRange(timeRange: DateRange): AuditEvent[] {
    const stmt = this.db.prepare(`
      SELECT * FROM audit_events 
      WHERE timestamp >= ? AND timestamp <= ?
      ORDER BY timestamp ASC
    `);

    const rows = stmt.all(timeRange.start.toISOString(), timeRange.end.toISOString()) as any[];
    return rows.map(row => this.mapRowToEvent(row));
  }

  /**
   * Generate compliance report
   */
  generateReport(timeRange: DateRange): ComplianceReport {
    const events = this.getEventsByTimeRange(timeRange);

    const byEventType: Partial<Record<AuditEventType, number>> = {};
    let validationFailures = 0;
    let deliverySuccesses = 0;
    let deliveryAttempts = 0;
    let expiredMessages = 0;
    let totalDeliveryTime = 0;
    let deliveryTimeCount = 0;

    // Track message delivery times
    const messageTimings: Map<string, { start: Date; end?: Date }> = new Map();

    for (const event of events) {
      byEventType[event.eventType] = (byEventType[event.eventType] || 0) + 1;

      if (event.eventType === 'validation-failed') {
        validationFailures++;
      }

      if (event.eventType === 'delivery-attempted') {
        deliveryAttempts++;
        if (!messageTimings.has(event.messageId)) {
          messageTimings.set(event.messageId, { start: event.timestamp });
        }
      }

      if (event.eventType === 'delivery-success') {
        deliverySuccesses++;
        const timing = messageTimings.get(event.messageId);
        if (timing) {
          timing.end = event.timestamp;
          const durationMs = timing.end.getTime() - timing.start.getTime();
          totalDeliveryTime += durationMs;
          deliveryTimeCount++;
        }
      }

      if (event.eventType === 'message-expired') {
        expiredMessages++;
      }
    }

    const deliverySuccessRate = deliveryAttempts > 0
      ? (deliverySuccesses / deliveryAttempts) * 100
      : 0;

    const averageDeliveryTime = deliveryTimeCount > 0
      ? totalDeliveryTime / deliveryTimeCount / 1000 // Convert to seconds
      : 0;

    return {
      timeRange,
      totalEvents: events.length,
      byEventType: byEventType as Record<AuditEventType, number>,
      validationFailures,
      deliverySuccessRate,
      averageDeliveryTime,
      expiredMessages,
    };
  }

  /**
   * Verify audit log integrity
   */
  verifyIntegrity(eventId: string): boolean {
    const stmt = this.db.prepare('SELECT * FROM audit_events WHERE event_id = ?');
    const row = stmt.get(eventId) as any;

    if (!row) {
      return false;
    }

    // Recalculate hash
    const hashData = `${row.event_id}|${row.timestamp}|${row.event_type}|${row.message_id}|${row.actor_agent}|${row.details}`;
    const calculatedHash = crypto.createHash('sha256').update(hashData).digest('hex');

    return calculatedHash === row.immutable_hash;
  }

  /**
   * Verify all audit logs in a time range
   */
  verifyIntegrityBatch(timeRange?: DateRange): { total: number; verified: number; failed: number } {
    let sql = 'SELECT event_id FROM audit_events WHERE 1=1';
    const params: any[] = [];

    if (timeRange) {
      sql += ' AND timestamp >= ? AND timestamp <= ?';
      params.push(timeRange.start.toISOString());
      params.push(timeRange.end.toISOString());
    }

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as Array<{ event_id: string }>;

    let verified = 0;
    let failed = 0;

    for (const row of rows) {
      if (this.verifyIntegrity(row.event_id)) {
        verified++;
      } else {
        failed++;
      }
    }

    return {
      total: rows.length,
      verified,
      failed,
    };
  }

  /**
   * Get audit statistics
   */
  getStats(): {
    totalEvents: number;
    byEventType: Record<string, number>;
    uniqueMessages: number;
    uniqueActors: number;
  } {
    const totalStmt = this.db.prepare('SELECT COUNT(*) as count FROM audit_events');
    const totalResult = totalStmt.get() as { count: number };

    const typeStmt = this.db.prepare('SELECT event_type, COUNT(*) as count FROM audit_events GROUP BY event_type');
    const typeResults = typeStmt.all() as Array<{ event_type: string; count: number }>;
    const byEventType: Record<string, number> = {};
    for (const result of typeResults) {
      byEventType[result.event_type] = result.count;
    }

    const messagesStmt = this.db.prepare('SELECT COUNT(DISTINCT message_id) as count FROM audit_events');
    const messagesResult = messagesStmt.get() as { count: number };

    const actorsStmt = this.db.prepare('SELECT COUNT(DISTINCT actor_agent) as count FROM audit_events');
    const actorsResult = actorsStmt.get() as { count: number };

    return {
      totalEvents: totalResult.count,
      byEventType,
      uniqueMessages: messagesResult.count,
      uniqueActors: actorsResult.count,
    };
  }

  /**
   * Search audit logs
   */
  search(criteria: {
    messageId?: string;
    eventType?: AuditEventType;
    actorAgent?: string;
    timeRange?: DateRange;
    limit?: number;
  }): AuditEvent[] {
    let sql = 'SELECT * FROM audit_events WHERE 1=1';
    const params: any[] = [];

    if (criteria.messageId) {
      sql += ' AND message_id = ?';
      params.push(criteria.messageId);
    }

    if (criteria.eventType) {
      sql += ' AND event_type = ?';
      params.push(criteria.eventType);
    }

    if (criteria.actorAgent) {
      sql += ' AND actor_agent = ?';
      params.push(criteria.actorAgent);
    }

    if (criteria.timeRange) {
      sql += ' AND timestamp >= ? AND timestamp <= ?';
      params.push(criteria.timeRange.start.toISOString());
      params.push(criteria.timeRange.end.toISOString());
    }

    sql += ' ORDER BY timestamp DESC';

    if (criteria.limit) {
      sql += ' LIMIT ?';
      params.push(criteria.limit);
    }

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];
    return rows.map(row => this.mapRowToEvent(row));
  }

  /**
   * Delete old audit logs (for compliance with retention policies)
   */
  deleteOlderThan(date: Date): number {
    const stmt = this.db.prepare('DELETE FROM audit_events WHERE timestamp < ?');
    const result = stmt.run(date.toISOString());
    return result.changes;
  }

  /**
   * Map database row to AuditEvent
   */
  private mapRowToEvent(row: any): AuditEvent {
    return {
      eventId: row.event_id,
      timestamp: new Date(row.timestamp),
      eventType: row.event_type,
      messageId: row.message_id,
      actorAgent: row.actor_agent,
      details: JSON.parse(row.details),
      immutableHash: row.immutable_hash,
    };
  }

  /**
   * Close the database connection
   */
  close(): void {
    this.db.close();
  }
}
