export interface TxSecureRecord {
  /** Unique identifier for this record */
  id: string;
  
  /** Party identifier associated with this transaction */
  partyId: string;
  
  /** ISO 8601 timestamp of when this record was created */
  createdAt: string;
  
  /** Nonce used for payload encryption (12 bytes as hex) */
  payload_nonce: string;
  
  /** Encrypted payload ciphertext (hex encoded) */
  payload_ct: string;
  
  /** Authentication tag for payload (16 bytes as hex) */
  payload_tag: string;
  
  /** Nonce used for DEK wrapping (12 bytes as hex) */
  dek_wrap_nonce: string;
  
  /** Wrapped (encrypted) Data Encryption Key (hex encoded) */
  dek_wrapped: string;
  
  /** Authentication tag for DEK wrapping (16 bytes as hex) */
  dek_wrap_tag: string;
  
  /** Algorithm used for encryption */
  alg: 'AES-256-GCM';
  
  /** Master key version used for DEK wrapping */
  mk_version: number;
}

/**
 * Input for encryption operation
 */
export interface EncryptInput {
  partyId: string;
  payload: Record<string, unknown>;
}

/**
 * Result of decryption operation
 */
export interface DecryptResult {
  payload: Record<string, unknown>;
  partyId: string;
}
