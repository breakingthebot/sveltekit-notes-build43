// src/lib/services/aiSummarizerService.spec.ts
// Unit tests for aiSummarizerService.
// Connects to: src/lib/services/aiSummarizerService.ts
// Created: 2026-07-26

import { describe, it, expect } from 'vitest';
import { generateNoteSummary } from './aiSummarizerService';

describe('aiSummarizerService', () => {
  const sampleNoteContent = `
    # SvelteKit Architecture Overview
    SvelteKit is a powerful modern web framework built on top of Svelte 5 runes.
    It provides server-side rendering, API routes, and client-side navigation out of the box.
    Building web applications with SvelteKit ensures ultra-fast page load speeds and clean code maintainability.
  `;

  it('handles short content gracefully', () => {
    const res = generateNoteSummary('Too short');
    expect(res.summary).toContain('too short');
    expect(res.suggestedTags).toContain('general');
  });

  it('generates summary, key bullet points, and smart tag suggestions', () => {
    const res = generateNoteSummary(sampleNoteContent);

    expect(res.summary.length).toBeGreaterThan(15);
    expect(res.keyBulletPoints.length).toBeGreaterThan(0);
    expect(res.suggestedTags.length).toBeGreaterThan(0);
    expect(res.suggestedTags).toContain('sveltekit');
  });

  it('calculates reading complexity level', () => {
    const res = generateNoteSummary(sampleNoteContent);
    expect(['Simple', 'Moderate', 'Advanced']).toContain(res.readingComplexity);
  });
});
