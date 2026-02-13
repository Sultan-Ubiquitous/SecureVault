import { ValidationError } from '../errors/crypto-errors.js';

/**
 * Validates that a string is valid hexadecimal
 */
export function validateHex(value: string, fieldName: string): void {
  if (!/^[0-9a-fA-F]*$/.test(value)) {
    throw new ValidationError(
      `${fieldName} must contain only hexadecimal characters (0-9, a-f, A-F), received: ${value.substring(0, 20)}...`
    );
  }
}

/**
 * Validates that a hex string represents exactly the expected number of bytes
 */
export function validateHexLength(
  hexString: string,
  expectedBytes: number,
  fieldName: string
): void {
  const expectedHexLength = expectedBytes * 2;
  if (hexString.length !== expectedHexLength) {
    throw new ValidationError(
      `${fieldName} must be exactly ${expectedBytes} bytes (${expectedHexLength} hex characters), received ${hexString.length} characters`
    );
  }
}

/**
 * Validates a nonce (must be 12 bytes as hex string)
 */
export function validateNonce(hexString: string, fieldName: string): void {
  validateHex(hexString, fieldName);
  validateHexLength(hexString, 12, fieldName);
}

/**
 * Validates an authentication tag (must be 16 bytes as hex string)
 */
export function validateAuthTag(hexString: string, fieldName: string): void {
  validateHex(hexString, fieldName);
  validateHexLength(hexString, 16, fieldName);
}

/**
 * Validates that a hex string is not empty and contains valid hex
 */
export function validateCiphertext(hexString: string, fieldName: string): void {
  if (hexString.length === 0) {
    throw new ValidationError(`${fieldName} cannot be empty`);
  }
  validateHex(hexString, fieldName);
  if (hexString.length % 2 !== 0) {
    throw new ValidationError(
      `${fieldName} must have an even number of hex characters (${hexString.length} is odd)`
    );
  }
}

/**
 * Converts a hex string to a Buffer with validation
 */
export function hexToBuffer(hexString: string, fieldName: string): Buffer {
  validateHex(hexString, fieldName);
  return Buffer.from(hexString, 'hex');
}

/**
 * Validates a master key buffer (must be 32 bytes)
 */
export function validateMasterKey(key: Buffer): void {
  if (key.length !== 32) {
    throw new ValidationError(
      `Master key must be exactly 32 bytes (256 bits), received ${key.length} bytes`
    );
  }
}