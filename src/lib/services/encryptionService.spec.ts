// src/lib/services/encryptionService.spec.ts
// Unit tests for encryptionService.
// Connects to: src/lib/services/encryptionService.ts
// Created: 2026-07-26

import { describe, it, expect } from 'vitest';
import { encryptNoteText, decryptNoteText, isEncrypted } from './encryptionService';

describe('encryptionService', () => {
  const secretNote = 'Secret Vault Data: API key = 12345-abcde';
  const password = 'MasterPassword99!';

  it('detects encrypted string format', () => {
    const encrypted = encryptNoteText(secretNote, password);
    expect(isEncrypted(encrypted)).toBe(true);
    expect(isEncrypted(secretNote)).toBe(false);
  });

  it('encrypts and decrypts text successfully with valid password', () => {
    const encrypted = encryptNoteText(secretNote, password);
    expect(encrypted).not.toBe(secretNote);

    const decrypted = decryptNoteText(encrypted, password);
    expect(decrypted).toBe(secretNote);
  });

  it('returns original text if text is not encrypted', () => {
    const plain = 'Normal non-encrypted note text';
    expect(decryptNoteText(plain, password)).toBe(plain);
  });

  it('throws error when trying to decrypt with empty password', () => {
    const encrypted = encryptNoteText(secretNote, password);
    expect(() => decryptNoteText(encrypted, '')).toThrow('Password is required for decryption.');
  });
});
