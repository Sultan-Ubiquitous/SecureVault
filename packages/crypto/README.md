# @repo/cryptoSecure 
Envelope Encryption UtilitiesA specialized cryptographic library implementing the Envelope Encryption pattern using AES-256-GCM. Designed for high-assurance environments, this package ensures that data encryption keys (DEKs) are cryptographically isolated from the payload and protected by a Master Key (KEK).

# 🛡 Security Architecture
This package implements Authenticated Encryption with Associated Data (AEAD) to guarantee both confidentiality and integrity.Core MechanismsAlgorithm: AES-256-GCM (Galois/Counter Mode).Key Isolation (Envelope Pattern):Payload: Encrypted with a unique, ephemeral Data Encryption Key (DEK).DEK: Encrypted ("wrapped") with a persistent Master Key.Storage: The encrypted payload and the wrapped DEK are stored together; the raw DEK is never persisted.Entropy: Uses crypto.randomBytes for all IVs (96-bit) and DEKs (256-bit).Memory Safety: Implements secureWipe to zero-fill sensitive key buffers immediately after use.📦 InstallationThis package is part of the monorepo workspace.Bashpnpm add @repo/crypto

# 🚀 Usage
1. Key ManagementLoad your Master Key (32-byte hex string) from a secure environment variable.TypeScriptimport { loadMasterKey } from '@repo/crypto';

// Validates 64-char hex string and converts to Buffer
const masterKey = loadMasterKey(process.env.MASTER_KEY_HEX!);
2. Encryption (Write)Generates a fresh DEK, encrypts the payload, wraps the DEK, and returns a storage-ready record.TypeScriptimport { encryptPayload } from '@repo/crypto';

const sensitiveData = {
  amount: 5000,
  currency: 'USD',
  notes: 'Q3 Bonus'
};

const record = encryptPayload(
  {
    partyId: 'user_123',
    payload: sensitiveData
  },
  masterKey
);

// 'record' is ready to be stored in DB (JSON serializable)
await db.transactions.save(record);
3. Decryption (Read)Unwraps the DEK using the Master Key, verifies the authentication tag, and decrypts the payload.TypeScriptimport { decryptPayload } from '@repo/crypto';

try {
  const result = decryptPayload(record, masterKey);
  console.log(result.payload); // { amount: 5000, ... }
} catch (err) {
  // Throws AuthenticationError if data was tampered with
  console.error('Decryption failed:', err);
}
# 📐 Data Model: 
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Unique record identifier. |
| `partyId` | String | Scope/Owner identifier. |
| `payload_ct` | Hex | Encrypted payload ciphertext. |
| `payload_tag` | Hex | **Integrity Check:** AES-GCM Auth Tag (16 bytes). |
| `payload_nonce` | Hex | Unique IV for payload encryption (12 bytes). |
| `dek_wrapped` | Hex | The DEK encrypted by the Master Key. |
| `alg` | Literal | Fixed to `'AES-256-GCM'` for versioning. |

# 🧪 Testing & Validation
The package includes comprehensive validation and a Vitest suite.Input Validation: Strict runtime checks for hex validity, buffer lengths, and JSON serializability.Tamper Resistance: Modifying any byte of ciphertext, nonce, or tag results in an AuthenticationError.Type Safety: Fully typed with TypeScript strict mode enabled.Bash# Run test suite
pnpm test

# Run coverage report
pnpm test:coverage
# ⚠️ Security Best Practices for ConsumersMaster Key Rotation: 
The mk_version field is reserved to support future key rotation strategies.Nonce Reuse: The library automatically generates unique 96-bit nonces for every operation to prevent GCM catastrophic failure.Error Handling: distinguish between AuthenticationError (potential attack) and generic DecryptionError.