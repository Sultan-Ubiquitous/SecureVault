/**
 * @packageDocumentation
 * Cryptographic utilities for secure envelope encryption using AES-256-GCM
 * 
 * This package provides envelope encryption functionality where:
 * - Data is encrypted with a random Data Encryption Key (DEK)
 * - DEK is wrapped (encrypted) with a Master Key
 * - Both encrypted data and wrapped DEK are stored together
 * 
 * @example
 * ```typescript
 * import { encryptPayload, decryptPayload, loadMasterKey } from '@repo/crypto';
 * 
 * const masterKey = loadMasterKey(process.env.MASTER_KEY_HEX!);
 * 
 * // Encrypt
 * const record = encryptPayload(
 *   { partyId: 'party_123', payload: { amount: 100 } },
 *   masterKey
 * );
 * 
 * // Decrypt
 * const result = decryptPayload(record, masterKey);
 * console.log(result.payload); // { amount: 100 }
 * ```
 */

// Core functions
export { encryptPayload, decryptPayload } from './core/envelope.js';
export { generateMasterKey, loadMasterKey } from './core/key-management.js';

// Validation
export { validateTxSecureRecord } from './validation/schema.js';

// Types
export type { TxSecureRecord, EncryptInput, DecryptResult } from './types/index.js';

// Errors
export {
  CryptoError,
  ValidationError,
  AuthenticationError,
  DecryptionError,
  KeyManagementError,
} from './errors/crypto-errors.js';