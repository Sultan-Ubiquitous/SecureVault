import { describe, it, expect } from 'vitest';
import { encryptAesGcm, decryptAesGcm } from '../src/core/aes-gcm';
import { randomBytes } from 'crypto';
import { AuthenticationError, DecryptionError } from '../src/errors/crypto-errors';

describe('AES-GCM Primitives', () => {
  const key = randomBytes(32);
  const plaintext = Buffer.from('Hello, World!', 'utf-8');

  it('should encrypt and decrypt successfully', () => {
    const encrypted = encryptAesGcm(plaintext, key);

    expect(encrypted.ciphertext).toBeInstanceOf(Buffer);
    expect(encrypted.nonce).toHaveLength(12);
    expect(encrypted.tag).toHaveLength(16);
    expect(encrypted.ciphertext).not.toEqual(plaintext);

    const decrypted = decryptAesGcm(
      encrypted.ciphertext,
      key,
      encrypted.nonce,
      encrypted.tag
    );

    expect(decrypted.toString('utf-8')).toBe('Hello, World!');
  });

  it('should generate different nonces for each encryption', () => {
    const encrypted1 = encryptAesGcm(plaintext, key);
    const encrypted2 = encryptAesGcm(plaintext, key);

    expect(encrypted1.nonce).not.toEqual(encrypted2.nonce);
    expect(encrypted1.ciphertext).not.toEqual(encrypted2.ciphertext);
  });

  it('should fail decryption with tampered ciphertext', () => {
    const encrypted = encryptAesGcm(plaintext, key);

    // Tamper with ciphertext by flipping a bit
    const tamperedCiphertext = Buffer.from(encrypted.ciphertext);
    tamperedCiphertext[0] ^= 0x01;

    expect(() =>
      decryptAesGcm(tamperedCiphertext, key, encrypted.nonce, encrypted.tag)
    ).toThrow(AuthenticationError);
  });

  it('should fail decryption with tampered tag', () => {
    const encrypted = encryptAesGcm(plaintext, key);

    // Tamper with tag by flipping a bit
    const tamperedTag = Buffer.from(encrypted.tag);
    tamperedTag[0] ^= 0x01;

    expect(() =>
      decryptAesGcm(encrypted.ciphertext, key, encrypted.nonce, tamperedTag)
    ).toThrow(AuthenticationError);
  });

  it('should fail decryption with wrong key', () => {
    const encrypted = encryptAesGcm(plaintext, key);
    const wrongKey = randomBytes(32);

    expect(() =>
      decryptAesGcm(encrypted.ciphertext, wrongKey, encrypted.nonce, encrypted.tag)
    ).toThrow(AuthenticationError);
  });

  it('should fail decryption with wrong nonce', () => {
    const encrypted = encryptAesGcm(plaintext, key);
    const wrongNonce = randomBytes(12);

    expect(() =>
      decryptAesGcm(encrypted.ciphertext, key, wrongNonce, encrypted.tag)
    ).toThrow(AuthenticationError);
  });

  it('should handle empty plaintext', () => {
    const empty = Buffer.alloc(0);
    const encrypted = encryptAesGcm(empty, key);

    const decrypted = decryptAesGcm(
      encrypted.ciphertext,
      key,
      encrypted.nonce,
      encrypted.tag
    );

    expect(decrypted).toHaveLength(0);
  });

  it('should handle large plaintext', () => {
    const largePlaintext = randomBytes(1024 * 100); // 100KB
    const encrypted = encryptAesGcm(largePlaintext, key);

    const decrypted = decryptAesGcm(
      encrypted.ciphertext,
      key,
      encrypted.nonce,
      encrypted.tag
    );

    expect(decrypted).toEqual(largePlaintext);
  });
});