import type { ITransactionStorage } from './storage.interface.js';
import { MemoryStorage } from './memory.storage.js';
import { PrismaStorage } from './prisma.storage.js';
import { env } from '../config/env.js';
import { prisma } from '../lib/db.js'; // Import the singleton with adapter

/**
 * Factory for creating storage instances based on configuration
 */
export class StorageFactory {
  /**
   * Create a storage instance based on STORAGE_TYPE environment variable
   */
  static create(): ITransactionStorage {
    const storageType = env.STORAGE_TYPE;

    switch (storageType) {
      case 'memory':
        console.log('📦 Using in-memory storage');
        //@ts-ignore
        return new MemoryStorage();

      case 'prisma':
        console.log('📦 Using Prisma (PostgreSQL) storage with pg adapter');
        // Pass the singleton prisma client with driver adapter
        return new PrismaStorage(prisma);

      default:
        throw new Error(`Unknown storage type: ${storageType}`);
    }
  }

  /**
   * Disconnect Prisma client (call on shutdown)
   */
  static async disconnect(): Promise<void> {
    if (env.STORAGE_TYPE === 'prisma') {
      await prisma.$disconnect();
    }
  }
}