/**
 * Custom error classes for crypto operations
 */

/**
 * Base error class for all crypto-related errors
 */
export class CryptoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CryptoError';
    Object.setPrototypeOf(this, CryptoError.prototype);
  }
}

/**
 * Thrown when input validation fails
 */
export class ValidationError extends CryptoError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Thrown when authentication tag verification fails (indicates tampering)
 */
export class AuthenticationError extends CryptoError {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Thrown when decryption operations fail
 */
export class DecryptionError extends CryptoError {
  constructor(message: string) {
    super(message);
    this.name = 'DecryptionError';
    Object.setPrototypeOf(this, DecryptionError.prototype);
  }
}

/**
 * Thrown when master key operations fail
 */
export class KeyManagementError extends CryptoError {
  constructor(message: string) {
    super(message);
    this.name = 'KeyManagementError';
    Object.setPrototypeOf(this, KeyManagementError.prototype);
  }
}