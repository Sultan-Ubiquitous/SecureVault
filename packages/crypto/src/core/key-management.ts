import { randomBytes } from 'crypto';
import { KeyManagementError } from '../errors/crypto-errors.js';
import { validateMasterKey } from '../validation/crypto-validators.js';

const DEK_LENGTH = 32; // 256 bits

/**
 * Generates a random Data Encryption Key (DEK)
 * 
 * @returns 32-byte random key
 */
export function generateDEK(): Buffer {
  return randomBytes(DEK_LENGTH);
}

/**
 * Loads and validates a master key from a hex string
 * 
 * @param masterKeyHex - 64-character hex string representing 32 bytes
 * @returns Validated master key buffer
 * @throws {KeyManagementError} If master key is invalid
 */
export function loadMasterKey(masterKeyHex: string): Buffer {
  if (!masterKeyHex) {
    throw new KeyManagementError('Master key is required');
  }

  if (!/^[0-9a-fA-F]{64}$/.test(masterKeyHex)) {
    throw new KeyManagementError(
      'Master key must be a 64-character hexadecimal string (32 bytes)'
    );
  }

  const masterKey = Buffer.from(masterKeyHex, 'hex');
  
  try {
    validateMasterKey(masterKey);
  } catch (error) {
    throw new KeyManagementError(
      `Invalid master key: ${error instanceof Error ? error.message : 'unknown error'}`
    );
  }

  return masterKey;
}

/**
 * Generates a new master key (for setup/initialization)
 * 
 * @returns 32-byte random master key
 */
export function generateMasterKey(): Buffer {
  return randomBytes(32);
}

/**
 * Securely overwrites a buffer with zeros
 * 
 * @param buffer - Buffer to overwrite
 */
export function secureWipe(buffer: Buffer): void {
  buffer.fill(0);
}