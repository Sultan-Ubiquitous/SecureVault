import type { TxSecureRecord } from '@repo/crypto';

/**
 * Storage abstraction interface
 * Allows swapping between in-memory and database implementations
 */
export interface TxSummary {
  id: string;
  partyId: string;
  createdAt: string;
}

export interface ITransactionStorage {
  /**
   * Save a transaction record
   * @throws {ConflictError} If a record with the same ID already exists
   */
  save(record: TxSecureRecord): Promise<void>;

  /**
   * Find a transaction by ID
   * @returns The record if found, null otherwise
   */
  findById(id: string): Promise<TxSecureRecord | null>;

  /**
   * Check if a transaction exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Health check for the storage backend
   * @returns true if healthy, false otherwise
   */
  healthCheck(): Promise<boolean>;

  findAll(): Promise<TxSummary[]>;
}