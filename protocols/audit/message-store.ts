import Database from 'better-sqlite3';
import { ParsedMessage } from '../validators/types';
import { StoredMessage, DeliveryLog, MessageStatus, DeliveryStatus } from './types';

export class MessageStore {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.initializeSchema();
  }

  /**
   * Initialize database schema
   */
  private initializeSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id TEXT UNIQUE NOT NULL,
        correlation_id TEXT NOT NULL,
        sender TEXT NOT NULL,
        recipient TEXT NOT NULL,
        body_type TEXT NOT NULL,
        priority TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        expiration TEXT NOT NULL,
        raw_xml TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_correlation ON messages(correlation_id);
      CREATE INDEX IF NOT EXISTS idx_sender ON messages(sender);
      CREATE INDEX IF NOT EXISTS idx_recipient ON messages(recipient);
      CREATE INDEX IF NOT EXISTS idx_timestamp ON messages(timestamp);
      CREATE INDEX IF NOT EXISTS idx_status ON messages(status);

      CREATE TABLE IF NOT EXISTS delivery_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id TEXT NOT NULL,
        attempt_number INTEGER NOT NULL,
        status TEXT NOT NULL,
        error_message TEXT,
        delivered_at TEXT NOT NULL,
        FOREIGN KEY (message_id) REFERENCES messages(message_id)
      );

      CREATE INDEX IF NOT EXISTS idx_delivery_message_id ON delivery_logs(message_id);
    `);
  }

  /**
   * Save a message to the database
   */
  save(message: ParsedMessage, rawXml: string, status: MessageStatus = 'pending'): void {
    const stmt = this.db.prepare(`
      INSERT INTO messages (
        message_id, correlation_id, sender, recipient, body_type, 
        priority, timestamp, expiration, raw_xml, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      message.messageId,
      message.correlationId,
      message.sender.agentName,
      message.recipient.agentName,
      message.body.type,
      message.priority,
      message.timestamp.toISOString(),
      message.expiration.toISOString(),
      rawXml,
      status,
      new Date().toISOString()
    );
  }

  /**
   * Find a message by its ID
   */
  findById(messageId: string): StoredMessage | null {
    const stmt = this.db.prepare('SELECT * FROM messages WHERE message_id = ?');
    const result = stmt.get(messageId) as any;
    return result || null;
  }

  /**
   * Find all messages with a specific correlation ID
   */
  findByCorrelation(correlationId: string): StoredMessage[] {
    const stmt = this.db.prepare('SELECT * FROM messages WHERE correlation_id = ? ORDER BY timestamp ASC');
    return stmt.all(correlationId) as StoredMessage[];
  }

  /**
   * Find messages by sender
   */
  findBySender(sender: string, limit?: number): StoredMessage[] {
    const sql = limit 
      ? 'SELECT * FROM messages WHERE sender = ? ORDER BY timestamp DESC LIMIT ?'
      : 'SELECT * FROM messages WHERE sender = ? ORDER BY timestamp DESC';
    
    const stmt = this.db.prepare(sql);
    return (limit ? stmt.all(sender, limit) : stmt.all(sender)) as StoredMessage[];
  }

  /**
   * Find messages by recipient
   */
  findByRecipient(recipient: string, limit?: number): StoredMessage[] {
    const sql = limit 
      ? 'SELECT * FROM messages WHERE recipient = ? ORDER BY timestamp DESC LIMIT ?'
      : 'SELECT * FROM messages WHERE recipient = ? ORDER BY timestamp DESC';
    
    const stmt = this.db.prepare(sql);
    return (limit ? stmt.all(recipient, limit) : stmt.all(recipient)) as StoredMessage[];
  }

  /**
   * Update message status
   */
  updateStatus(messageId: string, status: MessageStatus): void {
    const stmt = this.db.prepare('UPDATE messages SET status = ? WHERE message_id = ?');
    stmt.run(status, messageId);
  }

  /**
   * Log a delivery attempt
   */
  logDelivery(messageId: string, attemptNumber: number, status: DeliveryStatus, errorMessage?: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO delivery_logs (message_id, attempt_number, status, error_message, delivered_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      messageId,
      attemptNumber,
      status,
      errorMessage || null,
      new Date().toISOString()
    );
  }

  /**
   * Get delivery logs for a message
   */
  getDeliveryLogs(messageId: string): DeliveryLog[] {
    const stmt = this.db.prepare('SELECT * FROM delivery_logs WHERE message_id = ? ORDER BY attempt_number ASC');
    return stmt.all(messageId) as DeliveryLog[];
  }

  /**
   * Get count of messages
   */
  count(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM messages');
    const result = stmt.get() as { count: number };
    return result.count;
  }

  /**
   * Get count by status
   */
  countByStatus(status: MessageStatus): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM messages WHERE status = ?');
    const result = stmt.get(status) as { count: number };
    return result.count;
  }

  /**
   * Delete old messages (for cleanup)
   */
  deleteOlderThan(date: Date): number {
    const stmt = this.db.prepare('DELETE FROM messages WHERE timestamp < ?');
    const result = stmt.run(date.toISOString());
    return result.changes;
  }

  /**
   * Close the database connection
   */
  close(): void {
    this.db.close();
  }
}
