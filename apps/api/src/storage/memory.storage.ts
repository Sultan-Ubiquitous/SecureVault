import type { TxSecureRecord } from '@repo/crypto';
import type { ITransactionStorage, TxSummary } from './storage.interface.js';
import { ConflictError } from '../errors/api-errors.js';

/**
 * In-memory storage implementation using Map
 * 
 * Pros:
 * - Fast (no I/O)
 * - Simple (no setup required)
 * - Great for development and testing
 * 
 * Cons:
 * - Data lost on restart
 * - Not suitable for production
 * - No persistence across instances
 */
export class MemoryStorage implements ITransactionStorage {
  private store: Map<string, TxSecureRecord>;

  constructor() {
    this.store = new Map();
  }

  async save(record: TxSecureRecord): Promise<void> {
    if (this.store.has(record.id)) {
      throw new ConflictError(`Transaction with id '${record.id}' already exists`);
    }

    this.store.set(record.id, record);
  }

  async findById(id: string): Promise<TxSecureRecord | null> {
    return this.store.get(id) ?? null;
  }

  async exists(id: string): Promise<boolean> {
    return this.store.has(id);
  }

  async healthCheck(): Promise<boolean> {
    // In-memory storage is always healthy
    return true;
  }

  /**
   * Get total number of stored transactions
   * Useful for debugging and testing
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Clear all stored transactions
   * Useful for testing
   */
  async findAll(): Promise<TxSummary[]> {
    // Convert Map values to an array
    const records = Array.from(this.store.values());

    // Map to summary format
    const summaries = records.map((record) => ({
      id: record.id,
      partyId: record.partyId,
      createdAt: record.createdAt,
    }));

    // Sort by creation date descending (newest first)
    // This ensures consistency with the Prisma implementation
    return summaries.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  clear(): void {
    this.store.clear();
  }
}