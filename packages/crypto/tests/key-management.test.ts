import { describe, it, expect } from 'vitest';
import {
  generateMasterKey,
  loadMasterKey,
  generateDEK,
  secureWipe,
} from '../src/core/key-management';
import { KeyManagementError } from '../src/errors/crypto-errors';

describe('Key Management', () => {
  describe('generateMasterKey', () => {
    it('should generate 32-byte key', () => {
      const key = generateMasterKey();
      expect(key).toHaveLength(32);
      expect(key).toBeInstanceOf(Buffer);
    });

    it('should generate unique keys', () => {
      const key1 = generateMasterKey();
      const key2 = generateMasterKey();
      expect(key1).not.toEqual(key2);
    });
  });

  describe('generateDEK', () => {
    it('should generate 32-byte DEK', () => {
      const dek = generateDEK();
      expect(dek).toHaveLength(32);
      expect(dek).toBeInstanceOf(Buffer);
    });

    it('should generate unique DEKs', () => {
      const dek1 = generateDEK();
      const dek2 = generateDEK();
      expect(dek1).not.toEqual(dek2);
    });
  });

  describe('loadMasterKey', () => {
    it('should load valid master key from hex', () => {
      const hex = '0'.repeat(64); // 32 bytes
      const key = loadMasterKey(hex);
      expect(key).toHaveLength(32);
      expect(key).toBeInstanceOf(Buffer);
    });

    it('should accept lowercase hex', () => {
      const hex = 'abcdef0123456789'.repeat(4); // 64 chars
      const key = loadMasterKey(hex);
      expect(key).toHaveLength(32);
    });

    it('should accept uppercase hex', () => {
      const hex = 'ABCDEF0123456789'.repeat(4); // 64 chars
      const key = loadMasterKey(hex);
      expect(key).toHaveLength(32);
    });

    it('should reject empty string', () => {
      expect(() => loadMasterKey('')).toThrow(KeyManagementError);
    });

    it('should reject wrong length', () => {
      expect(() => loadMasterKey('aa')).toThrow(KeyManagementError);
      expect(() => loadMasterKey('0'.repeat(62))).toThrow(KeyManagementError);
      expect(() => loadMasterKey('0'.repeat(66))).toThrow(KeyManagementError);
    });

    it('should reject invalid hex characters', () => {
      const invalid = 'g'.repeat(64);
      expect(() => loadMasterKey(invalid)).toThrow(KeyManagementError);
    });

    it('should reject hex with spaces', () => {
      const withSpaces = '0'.repeat(32) + ' ' + '0'.repeat(31);
      expect(() => loadMasterKey(withSpaces)).toThrow(KeyManagementError);
    });
  });

  describe('secureWipe', () => {
    it('should zero out buffer contents', () => {
      const buffer = Buffer.from([1, 2, 3, 4, 5]);
      secureWipe(buffer);
      expect(buffer).toEqual(Buffer.from([0, 0, 0, 0, 0]));
    });

    it('should work with large buffers', () => {
      const buffer = Buffer.alloc(1024, 0xff);
      secureWipe(buffer);
      expect(buffer.every((byte) => byte === 0)).toBe(true);
    });

    it('should work with empty buffer', () => {
      const buffer = Buffer.alloc(0);
      expect(() => secureWipe(buffer)).not.toThrow();
    });
  });
});