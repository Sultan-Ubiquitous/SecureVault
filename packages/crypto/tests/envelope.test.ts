import { describe, it, expect, beforeAll } from 'vitest';
import { encryptPayload, decryptPayload } from '../src/core/envelope';
import { generateMasterKey } from '../src/core/key-management';
import type { TxSecureRecord, EncryptInput } from '../src/types';
import {
  ValidationError,
  AuthenticationError,
  DecryptionError,
} from '../src/errors/crypto-errors';

describe('Envelope Encryption', () => {
  let masterKey: Buffer;

  beforeAll(() => {
    masterKey = generateMasterKey();
  });

  describe('encryptPayload', () => {
    it('should encrypt payload successfully', () => {
      const input: EncryptInput = {
        partyId: 'party_123',
        payload: { amount: 100, currency: 'AED' },
      };

      const record = encryptPayload(input, masterKey);

      expect(record.id).toMatch(/^[0-9a-f-]{36}$/); // UUID format
      expect(record.partyId).toBe('party_123');
      expect(record.alg).toBe('AES-256-GCM');
      expect(record.mk_version).toBe(1);

      // Validate hex string formats
      expect(record.payload_nonce).toMatch(/^[0-9a-f]{24}$/);
      expect(record.payload_tag).toMatch(/^[0-9a-f]{32}$/);
      expect(record.payload_ct).toMatch(/^[0-9a-f]+$/);

      expect(record.dek_wrap_nonce).toMatch(/^[0-9a-f]{24}$/);
      expect(record.dek_wrap_tag).toMatch(/^[0-9a-f]{32}$/);
      expect(record.dek_wrapped).toMatch(/^[0-9a-f]+$/);

      // Validate timestamp
      expect(() => new Date(record.createdAt)).not.toThrow();
    });

    it('should generate unique records for same input', () => {
      const input: EncryptInput = {
        partyId: 'party_123',
        payload: { amount: 100 },
      };

      const record1 = encryptPayload(input, masterKey);
      const record2 = encryptPayload(input, masterKey);

      expect(record1.id).not.toBe(record2.id);
      expect(record1.payload_nonce).not.toBe(record2.payload_nonce);
      expect(record1.payload_ct).not.toBe(record2.payload_ct);
      expect(record1.dek_wrap_nonce).not.toBe(record2.dek_wrap_nonce);
    });

    it('should handle complex nested payload', () => {
      const input: EncryptInput = {
        partyId: 'party_456',
        payload: {
          transaction: {
            items: [
              { id: 1, name: 'Item 1', price: 10.5 },
              { id: 2, name: 'Item 2', price: 20.99 },
            ],
            metadata: {
              timestamp: '2026-02-12T10:00:00Z',
              user: { id: 'user_123', role: 'admin' },
            },
          },
        },
      };

      const record = encryptPayload(input, masterKey);
      expect(record.partyId).toBe('party_456');
    });

    it('should reject invalid partyId', () => {
      const input = {
        partyId: '',
        payload: { amount: 100 },
      };

      expect(() => encryptPayload(input, masterKey)).toThrow(ValidationError);
    });

    it('should reject invalid payload', () => {
      const input = {
        partyId: 'party_123',
        payload: null as any,
      };

      expect(() => encryptPayload(input, masterKey)).toThrow(ValidationError);
    });

    it('should reject invalid master key length', () => {
      const input: EncryptInput = {
        partyId: 'party_123',
        payload: { amount: 100 },
      };
      const wrongKey = Buffer.alloc(16);

      expect(() => encryptPayload(input, wrongKey)).toThrow(ValidationError);
    });
  });

  describe('decryptPayload', () => {
    it('should decrypt payload successfully', () => {
      const input: EncryptInput = {
        partyId: 'party_123',
        payload: { amount: 100, currency: 'AED' },
      };

      const record = encryptPayload(input, masterKey);
      const result = decryptPayload(record, masterKey);

      expect(result.partyId).toBe('party_123');
      expect(result.payload).toEqual({ amount: 100, currency: 'AED' });
    });

    it('should handle large payloads', () => {
      const largePayload: Record<string, unknown> = {};
      for (let i = 0; i < 1000; i++) {
        largePayload[`key_${i}`] = `value_${i}`;
      }

      const input: EncryptInput = {
        partyId: 'party_large',
        payload: largePayload,
      };

      const record = encryptPayload(input, masterKey);
      const result = decryptPayload(record, masterKey);

      expect(result.payload).toEqual(largePayload);
    });

    it('should handle special characters in payload', () => {
      const input: EncryptInput = {
        partyId: 'party_special',
        payload: {
          text: 'Hello 世界 🌍',
          symbols: '!@#$%^&*()',
          quotes: '"quoted" and \'single\'',
        },
      };

      const record = encryptPayload(input, masterKey);
      const result = decryptPayload(record, masterKey);

      expect(result.payload).toEqual(input.payload);
    });

    it('should fail with wrong master key', () => {
      const input: EncryptInput = {
        partyId: 'party_123',
        payload: { amount: 100 },
      };

      const record = encryptPayload(input, masterKey);
      const wrongKey = generateMasterKey();

      expect(() => decryptPayload(record, wrongKey)).toThrow(AuthenticationError);
    });

    it('should fail with tampered payload ciphertext', () => {
      const input: EncryptInput = {
        partyId: 'party_123',
        payload: { amount: 100 },
      };

      const record = encryptPayload(input, masterKey);

      // Tamper with payload ciphertext by flipping a bit
      const ctBuffer = Buffer.from(record.payload_ct, 'hex');
      ctBuffer[0] ^= 0x01; // Flip first bit
      const tamperedCt = ctBuffer.toString('hex');

      const tamperedRecord: TxSecureRecord = {
        ...record,
        payload_ct: tamperedCt,
      };

      expect(() => decryptPayload(tamperedRecord, masterKey)).toThrow(
        AuthenticationError
      );
    });

    it('should fail with tampered payload tag', () => {
      const input: EncryptInput = {
        partyId: 'party_123',
        payload: { amount: 100 },
      };

      const record = encryptPayload(input, masterKey);

      // Tamper with payload tag by flipping a bit
      const tagBuffer = Buffer.from(record.payload_tag, 'hex');
      tagBuffer[0] ^= 0x01; // Flip first bit
      const tamperedTag = tagBuffer.toString('hex');

      const tamperedRecord: TxSecureRecord = {
        ...record,
        payload_tag: tamperedTag,
      };

      expect(() => decryptPayload(tamperedRecord, masterKey)).toThrow(
        AuthenticationError
      );
    });

    it('should fail with tampered DEK wrapper', () => {
      const input: EncryptInput = {
        partyId: 'party_123',
        payload: { amount: 100 },
      };

      const record = encryptPayload(input, masterKey);

      // Tamper with wrapped DEK by flipping a bit
      const dekBuffer = Buffer.from(record.dek_wrapped, 'hex');
      dekBuffer[0] ^= 0x01; // Flip first bit
      const tamperedDek = dekBuffer.toString('hex');

      const tamperedRecord: TxSecureRecord = {
        ...record,
        dek_wrapped: tamperedDek,
      };

      expect(() => decryptPayload(tamperedRecord, masterKey)).toThrow(
        AuthenticationError
      );
    });

    it('should fail with invalid nonce length', () => {
      const input: EncryptInput = {
        partyId: 'party_123',
        payload: { amount: 100 },
      };

      const record = encryptPayload(input, masterKey);

      // Invalid nonce length
      const invalidRecord: TxSecureRecord = {
        ...record,
        payload_nonce: 'aa',
      };

      expect(() => decryptPayload(invalidRecord, masterKey)).toThrow(
        ValidationError
      );
    });

    it('should fail with invalid tag length', () => {
      const input: EncryptInput = {
        partyId: 'party_123',
        payload: { amount: 100 },
      };

      const record = encryptPayload(input, masterKey);

      // Invalid tag length
      const invalidRecord: TxSecureRecord = {
        ...record,
        payload_tag: 'aa',
      };

      expect(() => decryptPayload(invalidRecord, masterKey)).toThrow(
        ValidationError
      );
    });

    it('should fail with invalid hex in ciphertext', () => {
      const input: EncryptInput = {
        partyId: 'party_123',
        payload: { amount: 100 },
      };

      const record = encryptPayload(input, masterKey);

      // Invalid hex
      const invalidRecord: TxSecureRecord = {
        ...record,
        payload_ct: 'gggggggg',
      };

      expect(() => decryptPayload(invalidRecord, masterKey)).toThrow(
        ValidationError
      );
    });

    it('should reject record with missing fields', () => {
      const input: EncryptInput = {
        partyId: 'party_123',
        payload: { amount: 100 },
      };

      const record = encryptPayload(input, masterKey);
      const { payload_nonce, ...incomplete } = record;

      expect(() => decryptPayload(incomplete as any, masterKey)).toThrow(
        ValidationError
      );
    });
  });

  describe('round-trip encryption', () => {
    it('should maintain data integrity across multiple encryptions', () => {
      const payloads = [
        { amount: 100, currency: 'AED' },
        { user: 'john_doe', active: true, score: 99.5 },
        { items: [1, 2, 3], metadata: { timestamp: Date.now() } },
        { empty: {} },
        { nullValue: null, undefinedValue: undefined },
      ];

      for (const payload of payloads) {
        const input: EncryptInput = {
          partyId: 'party_test',
          payload: JSON.parse(JSON.stringify(payload)), // Normalize
        };

        const record = encryptPayload(input, masterKey);
        const result = decryptPayload(record, masterKey);

        expect(result.payload).toEqual(JSON.parse(JSON.stringify(payload)));
      }
    });
  });
});