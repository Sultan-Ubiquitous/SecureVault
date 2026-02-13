# 🚀 API Reference
1. Encrypt & Store Transaction
Initializes the envelope encryption process. The API generates the DEK, encrypts the payload, wraps the DEK, and persists the record.

Endpoint: POST /tx/encrypt

Request:

JSON
{
  "partyId": "merchant_01",
  "payload": {
    "amount": 1500,
    "currency": "EUR",
    "meta": "invoice_99"
  }
}
Response (201 Created): Returns the TxSecureRecord (ciphertext and wrapped keys).

2. Retrieve Encrypted Record
Fetches the raw encrypted record. No decryption occurs here. This is safe to expose to semi-trusted clients for verification.

Endpoint: GET /tx/:id

Response (200 OK):

JSON
{
  "id": "550e8400-e29b-...",
  "partyId": "merchant_01",
  "payload_ct": "a1b2...",
  "dek_wrapped": "c3d4...",
  ...
}
3. Decrypt Transaction
Retrieves the record, unwraps the DEK using the Master Key, validates the authentication tag, and returns the original plaintext.

Endpoint: POST /tx/:id/decrypt

Response (200 OK):

JSON
{
  "id": "550e8400-e29b-...",
  "partyId": "merchant_01",
  "payload": {
    "amount": 1500,
    "currency": "EUR",
    "meta": "invoice_99"
  }
}
4. System Health
Checks the connectivity of the underlying storage backend.

Endpoint: GET /health

Response:

JSON
{
  "status": "healthy",
  "storage": "prisma",
  "timestamp": "2024-02-12T10:00:00Z"
}


pnpm run dev
pnpm run build
pnpm run start