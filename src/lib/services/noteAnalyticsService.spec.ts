// src/lib/services/noteAnalyticsService.spec.ts
// Unit tests for noteAnalyticsService in Build 43.
// Created: 2026-07-25

import { describe, it, expect } from 'vitest';
import { analyzeNoteText } from './noteAnalyticsService';

describe('noteAnalyticsService', () => {
  it('should calculate word count and estimated reading time', () => {
    const text = 'SvelteKit makes building web applications fast, clean, and seamless.';
    const analytics = analyzeNoteText(text);

    expect(analytics.wordCount).toBe(9);
    expect(analytics.readingTimeText).toBe('< 1 min read');
  });

  it('should detect positive sentiment correctly', () => {
    const text = 'This feature is awesome, clean, and great!';
    const analytics = analyzeNoteText(text);

    expect(analytics.sentiment).toBe('Positive');
    expect(analytics.sentimentEmoji).toBe('😊');
    expect(analytics.sentimentScore).toBeGreaterThan(0);
  });

  it('should detect negative sentiment correctly', () => {
    const text = 'There is a terrible bug and broken crash issue.';
    const analytics = analyzeNoteText(text);

    expect(analytics.sentiment).toBe('Negative');
    expect(analytics.sentimentEmoji).toBe('😟');
    expect(analytics.sentimentScore).toBeLessThan(0);
  });
});
