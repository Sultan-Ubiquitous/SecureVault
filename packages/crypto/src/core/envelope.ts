import { randomUUID } from 'crypto';
import type { TxSecureRecord, EncryptInput, DecryptResult } from '../types/index.js';
import { encryptAesGcm, decryptAesGcm } from './aes-gcm.js';
import { generateDEK, secureWipe } from './key-management.js';
import { validateEncryptInput, validateTxSecureRecord } from '../validation/schema.js';
import { validateMasterKey } from '../validation/crypto-validators.js';
import { hexToBuffer } from '../validation/crypto-validators.js';

const MASTER_KEY_VERSION = 1;

/**
 * Encrypts a payload using envelope encryption
 * 
 * Process:
 * 1. Generate random DEK
 * 2. Encrypt payload with DEK (AES-256-GCM)
 * 3. Wrap DEK with Master Key (AES-256-GCM)
 * 4. Store encrypted payload + wrapped DEK
 * 
 * @param input - Party ID and payload to encrypt
 * @param masterKey - 32-byte master key for DEK wrapping
 * @returns Encrypted record ready for storage
 */
export function encryptPayload(
  input: EncryptInput,
  masterKey: Buffer
): TxSecureRecord {
  // Validate inputs
  validateEncryptInput(input);
  validateMasterKey(masterKey);

  // Generate Data Encryption Key
  const dek = generateDEK();

  try {
    // Serialize payload to JSON
    const payloadJson = JSON.stringify(input.payload);
    const payloadBuffer = Buffer.from(payloadJson, 'utf-8');

    // Encrypt payload with DEK
    const payloadEncrypted = encryptAesGcm(payloadBuffer, dek);

    // Wrap DEK with Master Key
    const dekWrapped = encryptAesGcm(dek, masterKey);

    // Construct secure record
    const record: TxSecureRecord = {
      id: randomUUID(),
      partyId: input.partyId,
      createdAt: new Date().toISOString(),

      // Encrypted payload fields
      payload_nonce: payloadEncrypted.nonce.toString('hex'),
      payload_ct: payloadEncrypted.ciphertext.toString('hex'),
      payload_tag: payloadEncrypted.tag.toString('hex'),

      // Wrapped DEK fields
      dek_wrap_nonce: dekWrapped.nonce.toString('hex'),
      dek_wrapped: dekWrapped.ciphertext.toString('hex'),
      dek_wrap_tag: dekWrapped.tag.toString('hex'),

      alg: 'AES-256-GCM',
      mk_version: MASTER_KEY_VERSION,
    };

    return record;
  } finally {
    // Securely wipe DEK from memory
    secureWipe(dek);
  }
}

/**
 * Decrypts a secure record back to original payload
 * 
 * Process:
 * 1. Validate record structure
 * 2. Unwrap DEK using Master Key
 * 3. Decrypt payload using DEK
 * 4. Parse JSON and return
 * 
 * @param record - Encrypted record to decrypt
 * @param masterKey - 32-byte master key for DEK unwrapping
 * @returns Decrypted payload and party ID
 */
export function decryptPayload(
  record: TxSecureRecord,
  masterKey: Buffer
): DecryptResult {
  // Validate inputs
  validateTxSecureRecord(record);
  validateMasterKey(masterKey);

  // Convert hex strings to buffers
  const dekWrappedBuffer = hexToBuffer(record.dek_wrapped, 'dek_wrapped');
  const dekWrapNonce = hexToBuffer(record.dek_wrap_nonce, 'dek_wrap_nonce');
  const dekWrapTag = hexToBuffer(record.dek_wrap_tag, 'dek_wrap_tag');

  // Unwrap DEK using Master Key
  const dek = decryptAesGcm(
    dekWrappedBuffer,
    masterKey,
    dekWrapNonce,
    dekWrapTag
  );

  try {
    // Convert payload hex strings to buffers
    const payloadCt = hexToBuffer(record.payload_ct, 'payload_ct');
    const payloadNonce = hexToBuffer(record.payload_nonce, 'payload_nonce');
    const payloadTag = hexToBuffer(record.payload_tag, 'payload_tag');

    // Decrypt payload using DEK
    const payloadBuffer = decryptAesGcm(
      payloadCt,
      dek,
      payloadNonce,
      payloadTag
    );

    // Parse JSON
    const payloadJson = payloadBuffer.toString('utf-8');
    const payload = JSON.parse(payloadJson) as Record<string, unknown>;

    return {
      payload,
      partyId: record.partyId,
    };
  } finally {
    // Securely wipe DEK from memory
    secureWipe(dek);
  }
}