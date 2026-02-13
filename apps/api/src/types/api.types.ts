import type { TxSecureRecord } from '@repo/crypto';

/**
 * Request body for POST /tx/encrypt
 */
export interface EncryptRequest {
  partyId: string;
  payload: Record<string, unknown>;
}

/**
 * Response for POST /tx/encrypt
 */
export type EncryptResponse = TxSecureRecord;

/**
 * Response for GET /tx/:id
 */
export type GetTransactionResponse = TxSecureRecord;

/**
 * Response for POST /tx/:id/decrypt
 */
export interface DecryptResponse {
  id: string;
  partyId: string;
  payload: Record<string, unknown>;
}

/**
 * URL parameters for routes with :id
 */
export interface IdParams {
  id: string;
}

/**
 * Standard error response
 */
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode?: number;
}