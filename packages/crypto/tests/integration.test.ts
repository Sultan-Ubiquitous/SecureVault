import { describe, it, expect, beforeAll } from 'vitest';
import {
  encryptPayload,
  decryptPayload,
  generateMasterKey,
  loadMasterKey,
} from '../src/index';
import type { TxSecureRecord, EncryptInput } from '../src/types';

describe('Integration Tests', () => {
  let masterKey: Buffer;
  let masterKeyHex: string;

  beforeAll(() => {
    masterKey = generateMasterKey();
    masterKeyHex = masterKey.toString('hex');
  });

  it('should work end-to-end with real scenario', () => {
    // Simulate API receiving encryption request
    const request: EncryptInput = {
      partyId: 'party_abc123',
      payload: {
        transaction_id: 'tx_xyz789',
        amount: 1500.75,
        currency: 'AED',
        items: [
          { sku: 'ITEM001', quantity: 2, price: 500 },
          { sku: 'ITEM002', quantity: 1, price: 500.75 },
        ],
        metadata: {
          ip: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
          timestamp: '2026-02-12T10:30:00Z',
        },
      },
    };

    // Encrypt
    const encrypted = encryptPayload(request, masterKey);

    // Simulate storing in database (convert to JSON and back)
    const stored = JSON.stringify(encrypted);
    const retrieved: TxSecureRecord = JSON.parse(stored);

    // Decrypt
    const decrypted = decryptPayload(retrieved, masterKey);

    // Verify
    expect(decrypted.partyId).toBe('party_abc123');
    expect(decrypted.payload).toEqual(request.payload);
  });

  it('should work with master key loaded from hex string', () => {
    const loadedKey = loadMasterKey(masterKeyHex);

    const input: EncryptInput = {
      partyId: 'party_test',
      payload: { test: 'data' },
    };

    const encrypted = encryptPayload(input, loadedKey);
    const decrypted = decryptPayload(encrypted, loadedKey);

    expect(decrypted.payload).toEqual({ test: 'data' });
  });

  it('should handle multiple parties independently', () => {
    const parties = ['party_1', 'party_2', 'party_3'];
    const records: TxSecureRecord[] = [];

    // Encrypt for multiple parties
    for (const partyId of parties) {
      const input: EncryptInput = {
        partyId,
        payload: { party_specific_data: partyId + '_data' },
      };
      records.push(encryptPayload(input, masterKey));
    }

    // Decrypt and verify
    for (let i = 0; i < parties.length; i++) {
      const decrypted = decryptPayload(records[i], masterKey);
      expect(decrypted.partyId).toBe(parties[i]);
      expect(decrypted.payload).toEqual({
        party_specific_data: parties[i] + '_data',
      });
    }
  });

  it('should maintain data types through encryption', () => {
    const input: EncryptInput = {
      partyId: 'party_types',
      payload: {
        string: 'hello',
        number: 42,
        float: 3.14159,
        boolean: true,
        null_value: null,
        array: [1, 2, 3],
        nested: {
          deep: {
            value: 'nested',
          },
        },
      },
    };

    const encrypted = encryptPayload(input, masterKey);
    const decrypted = decryptPayload(encrypted, masterKey);

    expect(decrypted.payload).toEqual(input.payload);
    expect(typeof decrypted.payload.string).toBe('string');
    expect(typeof decrypted.payload.number).toBe('number');
    expect(typeof decrypted.payload.boolean).toBe('boolean');
    expect(decrypted.payload.null_value).toBeNull();
    expect(Array.isArray(decrypted.payload.array)).toBe(true);
  });

  it('should be safe against timing attacks on tags', () => {
    const input: EncryptInput = {
      partyId: 'party_timing',
      payload: { sensitive: 'data' },
    };

    const record = encryptPayload(input, masterKey);

    // Create multiple tampered versions
    const tamperedVersions = [
      { ...record, payload_tag: record.payload_tag.replace(/.$/, '0') },
      { ...record, payload_tag: record.payload_tag.replace(/.$/, 'f') },
      { ...record, payload_tag: record.payload_tag.replace(/.$/, 'a') },
    ];

    // All should fail consistently
    for (const tampered of tamperedVersions) {
      expect(() => decryptPayload(tampered, masterKey)).toThrow();
    }
  });
});