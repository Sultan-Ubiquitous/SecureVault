import { describe, it, expect } from 'vitest';
import {
  validateHex,
  validateHexLength,
  validateNonce,
  validateAuthTag,
  validateCiphertext,
  validateMasterKey,
  hexToBuffer,
} from '../src/validation/crypto-validators';
import {
  validateEncryptInput,
  validateTxSecureRecord,
} from '../src/validation/schema';
import { ValidationError } from '../src/errors/crypto-errors';
import type { TxSecureRecord } from '../src/types';

describe('Crypto Validators', () => {
  describe('validateHex', () => {
    it('should accept valid hex strings', () => {
      expect(() => validateHex('0123456789abcdef', 'test')).not.toThrow();
      expect(() => validateHex('ABCDEF', 'test')).not.toThrow();
      expect(() => validateHex('', 'test')).not.toThrow();
    });

    it('should reject invalid hex strings', () => {
      expect(() => validateHex('xyz', 'test')).toThrow(ValidationError);
      expect(() => validateHex('12g4', 'test')).toThrow(ValidationError);
      expect(() => validateHex('hello', 'test')).toThrow(ValidationError);
    });
  });

  describe('validateHexLength', () => {
    it('should accept correct length', () => {
      expect(() => validateHexLength('aabbccdd', 4, 'test')).not.toThrow();
      expect(() => validateHexLength('aa', 1, 'test')).not.toThrow();
    });

    it('should reject incorrect length', () => {
      expect(() => validateHexLength('aa', 2, 'test')).toThrow(ValidationError);
      expect(() => validateHexLength('aabbcc', 2, 'test')).toThrow(ValidationError);
    });

    it('should provide clear error message', () => {
      expect(() => validateHexLength('aa', 12, 'nonce')).toThrow(
        'nonce must be exactly 12 bytes (24 hex characters), received 2 characters'
      );
    });
  });

  describe('validateNonce', () => {
    it('should accept valid 12-byte nonce', () => {
      const validNonce = '0'.repeat(24); // 12 bytes
      expect(() => validateNonce(validNonce, 'test')).not.toThrow();
    });

    it('should reject nonce with wrong length', () => {
      expect(() => validateNonce('aa', 'test')).toThrow(ValidationError);
      expect(() => validateNonce('0'.repeat(20), 'test')).toThrow(ValidationError);
      expect(() => validateNonce('0'.repeat(26), 'test')).toThrow(ValidationError);
    });

    it('should reject invalid hex in nonce', () => {
      expect(() => validateNonce('x'.repeat(24), 'test')).toThrow(ValidationError);
    });
  });

  describe('validateAuthTag', () => {
    it('should accept valid 16-byte tag', () => {
      const validTag = '0'.repeat(32); // 16 bytes
      expect(() => validateAuthTag(validTag, 'test')).not.toThrow();
    });

    it('should reject tag with wrong length', () => {
      expect(() => validateAuthTag('aa', 'test')).toThrow(ValidationError);
      expect(() => validateAuthTag('0'.repeat(30), 'test')).toThrow(ValidationError);
    });
  });

  describe('validateCiphertext', () => {
    it('should accept valid ciphertext', () => {
      expect(() => validateCiphertext('aabb', 'test')).not.toThrow();
      expect(() => validateCiphertext('0'.repeat(100), 'test')).not.toThrow();
    });

    it('should reject empty ciphertext', () => {
      expect(() => validateCiphertext('', 'test')).toThrow(ValidationError);
    });

    it('should reject odd-length hex', () => {
      expect(() => validateCiphertext('abc', 'test')).toThrow(ValidationError);
    });

    it('should reject invalid hex', () => {
      expect(() => validateCiphertext('gggg', 'test')).toThrow(ValidationError);
    });
  });

  describe('validateMasterKey', () => {
    it('should accept 32-byte key', () => {
      const key = Buffer.alloc(32);
      expect(() => validateMasterKey(key)).not.toThrow();
    });

    it('should reject keys of wrong length', () => {
      expect(() => validateMasterKey(Buffer.alloc(16))).toThrow(ValidationError);
      expect(() => validateMasterKey(Buffer.alloc(64))).toThrow(ValidationError);
      expect(() => validateMasterKey(Buffer.alloc(0))).toThrow(ValidationError);
    });
  });

  describe('hexToBuffer', () => {
    it('should convert valid hex to buffer', () => {
      const buffer = hexToBuffer('aabbcc', 'test');
      expect(buffer).toEqual(Buffer.from([0xaa, 0xbb, 0xcc]));
    });

    it('should reject invalid hex', () => {
      expect(() => hexToBuffer('xyz', 'test')).toThrow(ValidationError);
    });
  });
});

describe('Schema Validators', () => {
  describe('validateEncryptInput', () => {
    it('should accept valid input', () => {
      const input = {
        partyId: 'party_123',
        payload: { amount: 100, currency: 'AED' },
      };
      expect(() => validateEncryptInput(input)).not.toThrow();
    });

    it('should reject missing partyId', () => {
      const input = { payload: { amount: 100 } };
      expect(() => validateEncryptInput(input)).toThrow(ValidationError);
    });

    it('should reject empty partyId', () => {
      const input = { partyId: '', payload: { amount: 100 } };
      expect(() => validateEncryptInput(input)).toThrow(ValidationError);
    });

    it('should reject whitespace-only partyId', () => {
      const input = { partyId: '   ', payload: { amount: 100 } };
      expect(() => validateEncryptInput(input)).toThrow(ValidationError);
    });

    it('should reject non-string partyId', () => {
      const input = { partyId: 123, payload: { amount: 100 } };
      expect(() => validateEncryptInput(input)).toThrow(ValidationError);
    });

    it('should reject missing payload', () => {
      const input = { partyId: 'party_123' };
      expect(() => validateEncryptInput(input)).toThrow(ValidationError);
    });

    it('should reject null payload', () => {
      const input = { partyId: 'party_123', payload: null };
      expect(() => validateEncryptInput(input)).toThrow(ValidationError);
    });

    it('should reject array payload', () => {
      const input = { partyId: 'party_123', payload: [1, 2, 3] };
      expect(() => validateEncryptInput(input)).toThrow(ValidationError);
    });

    it('should reject non-serializable payload', () => {
      const circular: any = {};
      circular.self = circular;
      const input = { partyId: 'party_123', payload: circular };
      expect(() => validateEncryptInput(input)).toThrow(ValidationError);
    });

    it('should accept complex nested payload', () => {
      const input = {
        partyId: 'party_123',
        payload: {
          user: { name: 'John', age: 30 },
          items: [{ id: 1 }, { id: 2 }],
          metadata: { timestamp: '2026-02-12' },
        },
      };
      expect(() => validateEncryptInput(input)).not.toThrow();
    });
  });

  describe('validateTxSecureRecord', () => {
    const validRecord: TxSecureRecord = {
      id: 'tx_123',
      partyId: 'party_123',
      createdAt: '2026-02-12T10:00:00Z',
      payload_nonce: '0'.repeat(24),
      payload_ct: 'aabbccdd',
      payload_tag: '0'.repeat(32),
      dek_wrap_nonce: '0'.repeat(24),
      dek_wrapped: 'aabbccdd',
      dek_wrap_tag: '0'.repeat(32),
      alg: 'AES-256-GCM',
      mk_version: 1,
    };

    it('should accept valid record', () => {
      expect(() => validateTxSecureRecord(validRecord)).not.toThrow();
    });

    it('should reject missing id', () => {
      const { id, ...record } = validRecord;
      expect(() => validateTxSecureRecord(record)).toThrow(ValidationError);
    });

    it('should reject missing partyId', () => {
      const { partyId, ...record } = validRecord;
      expect(() => validateTxSecureRecord(record)).toThrow(ValidationError);
    });

    it('should reject wrong algorithm', () => {
      const record = { ...validRecord, alg: 'AES-128-CBC' };
      expect(() => validateTxSecureRecord(record)).toThrow(ValidationError);
    });

    it('should reject invalid mk_version', () => {
      const record = { ...validRecord, mk_version: 0 };
      expect(() => validateTxSecureRecord(record)).toThrow(ValidationError);
    });

    it('should reject invalid payload_nonce length', () => {
      const record = { ...validRecord, payload_nonce: 'aa' };
      expect(() => validateTxSecureRecord(record)).toThrow(ValidationError);
    });

    it('should reject invalid payload_tag length', () => {
      const record = { ...validRecord, payload_tag: 'aa' };
      expect(() => validateTxSecureRecord(record)).toThrow(ValidationError);
    });

    it('should reject invalid hex in payload_ct', () => {
      const record = { ...validRecord, payload_ct: 'gggg' };
      expect(() => validateTxSecureRecord(record)).toThrow(ValidationError);
    });

    it('should reject empty payload_ct', () => {
      const record = { ...validRecord, payload_ct: '' };
      expect(() => validateTxSecureRecord(record)).toThrow(ValidationError);
    });

    it('should reject invalid dek_wrap_nonce', () => {
      const record = { ...validRecord, dek_wrap_nonce: 'invalid' };
      expect(() => validateTxSecureRecord(record)).toThrow(ValidationError);
    });

    it('should reject non-object input', () => {
      expect(() => validateTxSecureRecord(null)).toThrow(ValidationError);
      expect(() => validateTxSecureRecord('string')).toThrow(ValidationError);
      expect(() => validateTxSecureRecord(123)).toThrow(ValidationError);
    });
  });
});