export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  storage: string;
  timestamp: string;
}

export interface EncryptRequest {
  partyId: string;
  payload: Record<string, unknown>;
}

// Mirroring the probable structure of TxSecureRecord from @repo/crypto
// We know it definitely has an ID based on your controller
export interface TxSecureRecord {
  id: string;
  partyId?: string; // Sometimes envelope encryption exposes public metadata
  [key: string]: unknown; // encrypted blob, iv, authTag, etc.
}

export interface DecryptResponse {
  id: string;
  partyId: string;
  payload: Record<string, unknown>;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

export interface TxSummary {
  id: string;
  partyId: string;
  createdAt: string;
}