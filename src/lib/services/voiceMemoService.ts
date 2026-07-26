// src/lib/services/voiceMemoService.ts
// Voice Memo Recording & Audio Playback Engine for Build 43 (SvelteKit).
// Connects to: src/routes/+page.svelte, src/lib/services/voiceMemoService.spec.ts
// Created: 2026-07-26

export interface AudioMemoPayload {
  id: string;
  title: string;
  durationSeconds: number;
  durationFormatted: string;
  audioBase64: string;
  createdAt: string;
}

export function formatAudioDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const padSecs = secs < 10 ? `0${secs}` : `${secs}`;
  const padMins = mins < 10 ? `0${mins}` : `${mins}`;
  return `${padMins}:${padSecs}`;
}

export function createAudioMemoPayload(audioBase64: string, durationSeconds: number, title?: string): AudioMemoPayload {
  return {
    id: 'audio-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    title: title || `Voice Memo (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
    durationSeconds: Math.max(1, Math.round(durationSeconds)),
    durationFormatted: formatAudioDuration(Math.max(1, Math.round(durationSeconds))),
    audioBase64,
    createdAt: new Date().toISOString()
  };
}

export function serializeAudioMemoToMarkdown(memo: AudioMemoPayload): string {
  return `\n[VOICE_MEMO:${memo.id}:${memo.durationFormatted}:${memo.title}]\n`;
}
