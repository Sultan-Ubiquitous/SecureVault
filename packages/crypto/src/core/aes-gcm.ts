import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { AuthenticationError, DecryptionError } from '../errors/crypto-errors.js';

const ALGORITHM = 'aes-256-gcm';
const NONCE_LENGTH = 12; // 96 bits (optimal for GCM)
const TAG_LENGTH = 16; // 128 bits

/**
 * Result of AES-GCM encryption
 */
export interface AesGcmEncryptResult {
  ciphertext: Buffer;
  nonce: Buffer;
  tag: Buffer;
}

/**
 * Encrypts data using AES-256-GCM
 * 
 * @param plaintext - Data to encrypt
 * @param key - 32-byte encryption key
 * @returns Ciphertext, nonce, and authentication tag
 */
export function encryptAesGcm(plaintext: Buffer, key: Buffer): AesGcmEncryptResult {
  // Generate random nonce
  const nonce = randomBytes(NONCE_LENGTH);

  // Create cipher
  const cipher = createCipheriv(ALGORITHM, key, nonce);

  // Encrypt data
  const ciphertext = Buffer.concat([
    cipher.update(plaintext),
    cipher.final(),
  ]);

  // Get authentication tag
  const tag = cipher.getAuthTag();

  return {
    ciphertext,
    nonce,
    tag,
  };
}

/**
 * Decrypts data using AES-256-GCM
 * 
 * @param ciphertext - Encrypted data
 * @param key - 32-byte decryption key
 * @param nonce - 12-byte nonce used during encryption
 * @param tag - 16-byte authentication tag
 * @returns Decrypted plaintext
 * @throws {AuthenticationError} If authentication tag verification fails
 * @throws {DecryptionError} If decryption fails for other reasons
 */
export function decryptAesGcm(
  ciphertext: Buffer,
  key: Buffer,
  nonce: Buffer,
  tag: Buffer
): Buffer {
  try {
    // Create decipher
    const decipher = createDecipheriv(ALGORITHM, key, nonce);

    // Set authentication tag
    decipher.setAuthTag(tag);

    // Decrypt data
    const plaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return plaintext;
  } catch (error) {
    // Check if error is due to authentication failure
    if (error instanceof Error && error.message.includes('Unsupported state or unable to authenticate data')) {
      throw new AuthenticationError(
        'Authentication tag verification failed - data may have been tampered with'
      );
    }

    // Other decryption errors
    throw new DecryptionError(
      `Decryption failed: ${error instanceof Error ? error.message : 'unknown error'}`
    );
  }
}