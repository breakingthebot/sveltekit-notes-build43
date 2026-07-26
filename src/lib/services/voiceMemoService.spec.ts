// src/lib/services/voiceMemoService.spec.ts
// Unit tests for voiceMemoService.
// Connects to: src/lib/services/voiceMemoService.ts
// Created: 2026-07-26

import { describe, it, expect } from 'vitest';
import { formatAudioDuration, createAudioMemoPayload, serializeAudioMemoToMarkdown } from './voiceMemoService';

describe('voiceMemoService', () => {
  it('formats seconds into mm:ss duration string', () => {
    expect(formatAudioDuration(5)).toBe('00:05');
    expect(formatAudioDuration(65)).toBe('01:05');
    expect(formatAudioDuration(3600)).toBe('60:00');
  });

  it('creates audio memo payload object', () => {
    const payload = createAudioMemoPayload('data:audio/webm;base64,GkXf...', 12, 'Test Memo');

    expect(payload.title).toBe('Test Memo');
    expect(payload.durationSeconds).toBe(12);
    expect(payload.durationFormatted).toBe('00:12');
    expect(payload.audioBase64).toContain('data:audio/webm');
  });

  it('serializes audio memo into markdown tag format', () => {
    const payload = createAudioMemoPayload('data:audio/webm;base64,...', 5, 'Quick Memo');
    const md = serializeAudioMemoToMarkdown(payload);

    expect(md).toContain('[VOICE_MEMO:');
    expect(md).toContain(':00:05:Quick Memo]');
  });
});
