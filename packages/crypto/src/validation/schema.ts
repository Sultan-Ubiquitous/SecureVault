import { ValidationError } from '../errors/crypto-errors.js';
import type { TxSecureRecord, EncryptInput } from '../types/index.js';
import {
  validateNonce,
  validateAuthTag,
  validateCiphertext,
} from './crypto-validators.js';

/**
 * Validates encryption input
 */
export function validateEncryptInput(input: unknown): asserts input is EncryptInput {
  if (!input || typeof input !== 'object') {
    throw new ValidationError('Input must be an object');
  }

  const { partyId, payload } = input as Partial<EncryptInput>;

  if (!partyId || typeof partyId !== 'string' || partyId.trim().length === 0) {
    throw new ValidationError('partyId must be a non-empty string');
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ValidationError('payload must be a non-null object (not an array)');
  }

  // Validate that payload can be serialized to JSON
  try {
    JSON.stringify(payload);
  } catch (error) {
    throw new ValidationError(
      `payload must be JSON serializable: ${error instanceof Error ? error.message : 'unknown error'}`
    );
  }
}

/**
 * Validates a TxSecureRecord structure and all cryptographic fields
 */
export function validateTxSecureRecord(record: unknown): asserts record is TxSecureRecord {
  if (!record || typeof record !== 'object') {
    throw new ValidationError('Record must be an object');
  }

  const r = record as Partial<TxSecureRecord>;

  // Validate required string fields
  if (!r.id || typeof r.id !== 'string') {
    throw new ValidationError('id must be a non-empty string');
  }

  if (!r.partyId || typeof r.partyId !== 'string') {
    throw new ValidationError('partyId must be a non-empty string');
  }

  if (!r.createdAt || typeof r.createdAt !== 'string') {
    throw new ValidationError('createdAt must be a non-empty string');
  }

  // Validate algorithm
  if (r.alg !== 'AES-256-GCM') {
    throw new ValidationError(`alg must be 'AES-256-GCM', received: ${r.alg}`);
  }

  // Validate master key version
  if (typeof r.mk_version !== 'number' || r.mk_version < 1) {
    throw new ValidationError('mk_version must be a positive number');
  }

  // Validate payload encryption fields
  if (typeof r.payload_nonce !== 'string') {
    throw new ValidationError('payload_nonce must be a string');
  }
  validateNonce(r.payload_nonce, 'payload_nonce');

  if (typeof r.payload_ct !== 'string') {
    throw new ValidationError('payload_ct must be a string');
  }
  validateCiphertext(r.payload_ct, 'payload_ct');

  if (typeof r.payload_tag !== 'string') {
    throw new ValidationError('payload_tag must be a string');
  }
  validateAuthTag(r.payload_tag, 'payload_tag');

  // Validate DEK wrapping fields
  if (typeof r.dek_wrap_nonce !== 'string') {
    throw new ValidationError('dek_wrap_nonce must be a string');
  }
  validateNonce(r.dek_wrap_nonce, 'dek_wrap_nonce');

  if (typeof r.dek_wrapped !== 'string') {
    throw new ValidationError('dek_wrapped must be a string');
  }
  validateCiphertext(r.dek_wrapped, 'dek_wrapped');

  if (typeof r.dek_wrap_tag !== 'string') {
    throw new ValidationError('dek_wrap_tag must be a string');
  }
  validateAuthTag(r.dek_wrap_tag, 'dek_wrap_tag');
}