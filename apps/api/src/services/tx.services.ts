import { encryptPayload, decryptPayload } from '@repo/crypto';
import type { TxSecureRecord, EncryptInput } from '@repo/crypto';
import type { ITransactionStorage, TxSummary } from '../storage/storage.interface.js';
import { NotFoundError } from '../errors/api-errors.js';
import type { DecryptResponse } from '../types/api.types.js';

/**
 * Transaction service - handles business logic for encryption/decryption
 */
export class TransactionService {
  constructor(
    private storage: ITransactionStorage,
    private masterKey: Buffer
  ) {}

  /**
   * Encrypt and store a new transaction
   */
  async encrypt(input: EncryptInput): Promise<TxSecureRecord> {
    // Encrypt using envelope encryption
    const record = encryptPayload(input, this.masterKey);

    // Save to storage
    await this.storage.save(record);

    return record;
  }

  /**
   * Get an encrypted transaction by ID (no decryption)
   */
  async getById(id: string): Promise<TxSecureRecord> {
    const record = await this.storage.findById(id);

    if (!record) {
      throw new NotFoundError(`Transaction with id '${id}' not found`);
    }

    return record;
  }

  /**
   * Decrypt a transaction and return the original payload
   */
  async decrypt(id: string): Promise<DecryptResponse> {
    // Fetch encrypted record
    const record = await this.getById(id);

    // Decrypt payload
    const result = decryptPayload(record, this.masterKey);

    return {
      id: record.id,
      partyId: result.partyId,
      payload: result.payload,
    };
  }
  //get all the transactions
  async list(): Promise<TxSummary[]> {
    return this.storage.findAll();
  }

  /**
   * Check if storage backend is healthy
   */
  async healthCheck(): Promise<boolean> {
    return this.storage.healthCheck();
  }
}