import { PrismaClient } from '@prisma/client';
import type { TxSecureRecord } from '@repo/crypto';
import type { ITransactionStorage, TxSummary } from './storage.interface.js';
import { ConflictError, InternalServerError } from '../errors/api-errors.js';

/**
 * Prisma (PostgreSQL) storage implementation
 * 
 * Pros:
 * - Persistent storage
 * - ACID guarantees
 * - Production-ready
 * - Supports concurrent access
 * 
 * Cons:
 * - Requires database setup
 * - Slower than in-memory (but still fast)
 */
export class PrismaStorage implements ITransactionStorage {
  constructor(private prisma: PrismaClient) {}

  async save(record: TxSecureRecord): Promise<void> {
    try {
      await this.prisma.transaction.create({
        data: {
          id: record.id,
          partyId: record.partyId,
          createdAt: new Date(record.createdAt),
          payloadNonce: record.payload_nonce,
          payloadCt: record.payload_ct,
          payloadTag: record.payload_tag,
          dekWrapNonce: record.dek_wrap_nonce,
          dekWrapped: record.dek_wrapped,
          dekWrapTag: record.dek_wrap_tag,
          alg: record.alg,
          mkVersion: record.mk_version,
        },
      });
    } catch (error: any) {
      // Prisma unique constraint violation (P2002)
      if (error.code === 'P2002') {
        throw new ConflictError(`Transaction with id '${record.id}' already exists`);
      }
      throw new InternalServerError(
        `Failed to save transaction: ${error.message || 'Unknown error'}`
      );
    }
  }

  async findById(id: string): Promise<TxSecureRecord | null> {
    try {
      const tx = await this.prisma.transaction.findUnique({
        where: { id },
      });

      if (!tx) {
        return null;
      }

      return this.mapToTxSecureRecord(tx);
    } catch (error: any) {
      throw new InternalServerError(
        `Failed to find transaction: ${error.message || 'Unknown error'}`
      );
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.prisma.transaction.count({
        where: { id },
      });
      return count > 0;
    } catch (error: any) {
      throw new InternalServerError(
        `Failed to check transaction existence: ${error.message || 'Unknown error'}`
      );
    }
  }

  async findAll(): Promise<TxSummary[]> {
    try {
      const transactions = await this.prisma.transaction.findMany({
        select: {
          id: true,
          partyId: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return transactions.map((tx) => ({
        id: tx.id,
        partyId: tx.partyId,
        createdAt: tx.createdAt.toISOString(),
      }));
    } catch (error: any) {
      throw new InternalServerError(
        `Failed to list transactions: ${error.message || 'Unknown error'}`
      );
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Map Prisma model to TxSecureRecord
   */
  private mapToTxSecureRecord(tx: any): TxSecureRecord {
    return {
      id: tx.id,
      partyId: tx.partyId,
      createdAt: tx.createdAt.toISOString(),
      payload_nonce: tx.payloadNonce,
      payload_ct: tx.payloadCt,
      payload_tag: tx.payloadTag,
      dek_wrap_nonce: tx.dekWrapNonce,
      dek_wrapped: tx.dekWrapped,
      dek_wrap_tag: tx.dekWrapTag,
      alg: tx.alg as 'AES-256-GCM',
      mk_version: tx.mkVersion,
    };
  }
}