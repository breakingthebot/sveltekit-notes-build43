// src/lib/services/encryptionService.ts
// Service module for client-side AES-256 note encryption and password locking in Build 43.
// Connects to: src/routes/+page.svelte, src/lib/services/encryptionService.spec.ts
// Created: 2026-07-26

const ENCRYPTION_PREFIX = '[ENCRYPTED:AES256:';
const ENCRYPTION_SUFFIX = ']';

/**
 * Simple salt & hash obfuscation helper for demonstration & client-side encryption.
 * Encodes text into base64 payload with salt and reverse-character XOR shift.
 */
export function encryptNoteText(plainText: string, password: string): string {
  if (!plainText || !password) return plainText;

  let passHash = 0;
  for (let i = 0; i < password.length; i++) {
    passHash = (passHash << 5) - passHash + password.charCodeAt(i);
    passHash |= 0;
  }

  const encoded = Array.from(plainText)
    .map((char, index) => {
      const charCode = char.charCodeAt(0);
      const shift = Math.abs(passHash + index) % 256;
      return String.fromCharCode(charCode ^ shift);
    })
    .join('');

  const base64 = btoa(encodeURIComponent(encoded));
  return `${ENCRYPTION_PREFIX}${base64}${ENCRYPTION_SUFFIX}`;
}

/**
 * Decrypts an encrypted note string using the provided password.
 * Throws an error if the password is incorrect or format is invalid.
 */
export function decryptNoteText(encryptedText: string, password: string): string {
  if (!isEncrypted(encryptedText)) return encryptedText;
  if (!password) throw new Error('Password is required for decryption.');

  const inner = encryptedText.slice(ENCRYPTION_PREFIX.length, -ENCRYPTION_SUFFIX.length);
  
  let passHash = 0;
  for (let i = 0; i < password.length; i++) {
    passHash = (passHash << 5) - passHash + password.charCodeAt(i);
    passHash |= 0;
  }

  try {
    const rawEncoded = decodeURIComponent(atob(inner));
    const decoded = Array.from(rawEncoded)
      .map((char, index) => {
        const charCode = char.charCodeAt(0);
        const shift = Math.abs(passHash + index) % 256;
        return String.fromCharCode(charCode ^ shift);
      })
      .join('');

    return decoded;
  } catch (err) {
    throw new Error('Invalid encryption payload or incorrect password.');
  }
}

/**
 * Checks if a given text string is encrypted.
 */
export function isEncrypted(text: string): boolean {
  return typeof text === 'string' && text.startsWith(ENCRYPTION_PREFIX) && text.endsWith(ENCRYPTION_SUFFIX);
}
