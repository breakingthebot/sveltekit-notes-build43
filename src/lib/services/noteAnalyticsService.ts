// src/lib/services/noteAnalyticsService.ts
// Word Count, Reading Time & Sentiment Analytics service for Build 43 (SvelteKit).
// Connects to: src/routes/+page.svelte
// Created: 2026-07-25

export interface NoteAnalytics {
  charCountWithSpaces: number;
  charCountNoSpaces: number;
  wordCount: number;
  readingTimeMinutes: number;
  readingTimeText: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  sentimentEmoji: '😊' | '😐' | '😟';
  sentimentScore: number;
}

const POSITIVE_WORDS = new Set([
  'great', 'awesome', 'rocket', 'launch', 'success', 'love', 'fast', 'clean', 
  'excellent', 'good', 'best', 'happy', 'cool', 'effortless', 'seamless', 
  'boost', 'innovative', 'smooth', 'bright', 'popular', 'fantastic', 'top'
]);

const NEGATIVE_WORDS = new Set([
  'bug', 'error', 'failed', 'broken', 'slow', 'fix', 'issue', 'bad', 
  'terrible', 'problem', 'crash', 'fail', 'hard', 'stuck', 'warning', 
  'defect', 'worst', 'flaw', 'risk', 'danger'
]);

export function analyzeNoteText(content: string): NoteAnalytics {
  if (!content || !content.trim()) {
    return {
      charCountWithSpaces: 0,
      charCountNoSpaces: 0,
      wordCount: 0,
      readingTimeMinutes: 0,
      readingTimeText: '0 min read',
      sentiment: 'Neutral',
      sentimentEmoji: '😐',
      sentimentScore: 0
    };
  }

  const charCountWithSpaces = content.length;
  const charCountNoSpaces = content.replace(/\s/g, '').length;

  const words = content.trim().match(/\b[a-zA-Z0-9'-]+\b/g) || [];
  const wordCount = words.length;

  // Reading time (assume 200 words per minute average reading speed)
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const readingTimeText = wordCount > 0 ? (wordCount < 100 ? '< 1 min read' : `${readingTimeMinutes} min read`) : '0 min read';

  // Sentiment scoring
  let score = 0;
  words.forEach(w => {
    const lower = w.toLowerCase();
    if (POSITIVE_WORDS.has(lower)) score += 1;
    if (NEGATIVE_WORDS.has(lower)) score -= 1;
  });

  let sentiment: 'Positive' | 'Neutral' | 'Negative' = 'Neutral';
  let sentimentEmoji: '😊' | '😐' | '😟' = '😐';

  if (score > 0) {
    sentiment = 'Positive';
    sentimentEmoji = '😊';
  } else if (score < 0) {
    sentiment = 'Negative';
    sentimentEmoji = '😟';
  }

  return {
    charCountWithSpaces,
    charCountNoSpaces,
    wordCount,
    readingTimeMinutes,
    readingTimeText,
    sentiment,
    sentimentEmoji,
    sentimentScore: score
  };
}
