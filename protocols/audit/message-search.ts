import { MessageStore } from './message-store';
import { StoredMessage, DateRange, MessageStats } from './types';

export class MessageSearch {
  constructor(private store: MessageStore) {}

  /**
   * Find messages within a time range
   */
  findByTimeRange(start: Date, end: Date): StoredMessage[] {
    const stmt = (this.store as any).db.prepare(`
      SELECT * FROM messages 
      WHERE timestamp >= ? AND timestamp <= ?
      ORDER BY timestamp DESC
    `);
    return stmt.all(start.toISOString(), end.toISOString()) as StoredMessage[];
  }

  /**
   * Find messages by sender
   */
  findBySender(sender: string, limit?: number): StoredMessage[] {
    return this.store.findBySender(sender, limit);
  }

  /**
   * Find messages by recipient
   */
  findByRecipient(recipient: string, limit?: number): StoredMessage[] {
    return this.store.findByRecipient(recipient, limit);
  }

  /**
   * Find all messages in a conversation chain
   */
  findConversationChain(correlationId: string): StoredMessage[] {
    return this.store.findByCorrelation(correlationId);
  }

  /**
   * Find failed messages
   */
  findFailed(since?: Date): StoredMessage[] {
    let sql = "SELECT * FROM messages WHERE status = 'failed'";
    const params: any[] = [];

    if (since) {
      sql += ' AND timestamp >= ?';
      params.push(since.toISOString());
    }

    sql += ' ORDER BY timestamp DESC';

    const stmt = (this.store as any).db.prepare(sql);
    return stmt.all(...params) as StoredMessage[];
  }

  /**
   * Find expired messages
   */
  findExpired(since?: Date): StoredMessage[] {
    let sql = "SELECT * FROM messages WHERE status = 'expired'";
    const params: any[] = [];

    if (since) {
      sql += ' AND timestamp >= ?';
      params.push(since.toISOString());
    }

    sql += ' ORDER BY timestamp DESC';

    const stmt = (this.store as any).db.prepare(sql);
    return stmt.all(...params) as StoredMessage[];
  }

  /**
   * Find messages by body type
   */
  findByBodyType(bodyType: string, limit?: number): StoredMessage[] {
    const sql = limit
      ? 'SELECT * FROM messages WHERE body_type = ? ORDER BY timestamp DESC LIMIT ?'
      : 'SELECT * FROM messages WHERE body_type = ? ORDER BY timestamp DESC';

    const stmt = (this.store as any).db.prepare(sql);
    return (limit ? stmt.all(bodyType, limit) : stmt.all(bodyType)) as StoredMessage[];
  }

  /**
   * Find messages by priority
   */
  findByPriority(priority: string, limit?: number): StoredMessage[] {
    const sql = limit
      ? 'SELECT * FROM messages WHERE priority = ? ORDER BY timestamp DESC LIMIT ?'
      : 'SELECT * FROM messages WHERE priority = ? ORDER BY timestamp DESC';

    const stmt = (this.store as any).db.prepare(sql);
    return (limit ? stmt.all(priority, limit) : stmt.all(priority)) as StoredMessage[];
  }

  /**
   * Search messages by multiple criteria
   */
  search(criteria: {
    sender?: string;
    recipient?: string;
    bodyType?: string;
    priority?: string;
    status?: string;
    timeRange?: DateRange;
    limit?: number;
  }): StoredMessage[] {
    let sql = 'SELECT * FROM messages WHERE 1=1';
    const params: any[] = [];

    if (criteria.sender) {
      sql += ' AND sender = ?';
      params.push(criteria.sender);
    }

    if (criteria.recipient) {
      sql += ' AND recipient = ?';
      params.push(criteria.recipient);
    }

    if (criteria.bodyType) {
      sql += ' AND body_type = ?';
      params.push(criteria.bodyType);
    }

    if (criteria.priority) {
      sql += ' AND priority = ?';
      params.push(criteria.priority);
    }

    if (criteria.status) {
      sql += ' AND status = ?';
      params.push(criteria.status);
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

    const stmt = (this.store as any).db.prepare(sql);
    return stmt.all(...params) as StoredMessage[];
  }

  /**
   * Get message statistics for a time range
   */
  getStats(timeRange?: DateRange): MessageStats {
    let sql = 'SELECT priority, body_type, status FROM messages WHERE 1=1';
    const params: any[] = [];

    if (timeRange) {
      sql += ' AND timestamp >= ? AND timestamp <= ?';
      params.push(timeRange.start.toISOString());
      params.push(timeRange.end.toISOString());
    }

    const stmt = (this.store as any).db.prepare(sql);
    const messages = stmt.all(...params) as Array<{ priority: string; body_type: string; status: string }>;

    const byPriority: Record<string, number> = {};
    const byBodyType: Record<string, number> = {};
    let deliveredCount = 0;

    for (const msg of messages) {
      byPriority[msg.priority] = (byPriority[msg.priority] || 0) + 1;
      byBodyType[msg.body_type] = (byBodyType[msg.body_type] || 0) + 1;
      if (msg.status === 'delivered') {
        deliveredCount++;
      }
    }

    const deliveryRate = messages.length > 0 ? (deliveredCount / messages.length) * 100 : 0;
    const avgDeliveryTime = this.calculateAvgDeliveryTime(timeRange);

    return {
      totalMessages: messages.length,
      byPriority,
      byBodyType,
      deliveryRate,
      avgDeliveryTime,
    };
  }

  /**
   * Calculate average delivery time
   */
  private calculateAvgDeliveryTime(timeRange?: DateRange): number {
    let sql = `
      SELECT AVG(
        (julianday(dl.delivered_at) - julianday(m.timestamp)) * 86400
      ) as avg_seconds
      FROM messages m
      JOIN delivery_logs dl ON m.message_id = dl.message_id
      WHERE dl.status = 'success' AND dl.attempt_number = 1
    `;
    const params: any[] = [];

    if (timeRange) {
      sql += ' AND m.timestamp >= ? AND m.timestamp <= ?';
      params.push(timeRange.start.toISOString());
      params.push(timeRange.end.toISOString());
    }

    const stmt = (this.store as any).db.prepare(sql);
    const result = stmt.get(...params) as { avg_seconds: number | null };
    return result.avg_seconds || 0;
  }

  /**
   * Get top senders by message count
   */
  getTopSenders(limit: number = 10, timeRange?: DateRange): Array<{ sender: string; count: number }> {
    let sql = 'SELECT sender, COUNT(*) as count FROM messages WHERE 1=1';
    const params: any[] = [];

    if (timeRange) {
      sql += ' AND timestamp >= ? AND timestamp <= ?';
      params.push(timeRange.start.toISOString());
      params.push(timeRange.end.toISOString());
    }

    sql += ' GROUP BY sender ORDER BY count DESC LIMIT ?';
    params.push(limit);

    const stmt = (this.store as any).db.prepare(sql);
    return stmt.all(...params) as Array<{ sender: string; count: number }>;
  }

  /**
   * Get top recipients by message count
   */
  getTopRecipients(limit: number = 10, timeRange?: DateRange): Array<{ recipient: string; count: number }> {
    let sql = 'SELECT recipient, COUNT(*) as count FROM messages WHERE 1=1';
    const params: any[] = [];

    if (timeRange) {
      sql += ' AND timestamp >= ? AND timestamp <= ?';
      params.push(timeRange.start.toISOString());
      params.push(timeRange.end.toISOString());
    }

    sql += ' GROUP BY recipient ORDER BY count DESC LIMIT ?';
    params.push(limit);

    const stmt = (this.store as any).db.prepare(sql);
    return stmt.all(...params) as Array<{ recipient: string; count: number }>;
  }

  /**
   * Get message count trends over time
   */
  getMessageTrends(interval: 'hour' | 'day' | 'week', timeRange?: DateRange): Array<{ period: string; count: number }> {
    const format = interval === 'hour' 
      ? '%Y-%m-%d %H:00:00'
      : interval === 'day'
        ? '%Y-%m-%d'
        : '%Y-W%W'; // Week number

    let sql = `
      SELECT strftime('${format}', timestamp) as period, COUNT(*) as count
      FROM messages
      WHERE 1=1
    `;
    const params: any[] = [];

    if (timeRange) {
      sql += ' AND timestamp >= ? AND timestamp <= ?';
      params.push(timeRange.start.toISOString());
      params.push(timeRange.end.toISOString());
    }

    sql += ' GROUP BY period ORDER BY period ASC';

    const stmt = (this.store as any).db.prepare(sql);
    return stmt.all(...params) as Array<{ period: string; count: number }>;
  }
}
