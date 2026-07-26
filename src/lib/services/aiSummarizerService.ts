// src/lib/services/aiSummarizerService.ts
// AI Note Summarization & Smart Tag Recommendation Service for Build 43 (SvelteKit).
// Connects to: src/routes/+page.svelte, src/lib/services/aiSummarizerService.spec.ts
// Created: 2026-07-26

import { stripMarkdown } from './markdownService';

export interface AISummaryResult {
  summary: string;
  keyBulletPoints: string[];
  suggestedTags: string[];
  readingComplexity: 'Simple' | 'Moderate' | 'Advanced';
}

const COMMON_STOP_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with',
  'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if',
  'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just',
  'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see',
  'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back',
  'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because'
]);

export function generateNoteSummary(content: string): AISummaryResult {
  const plainText = stripMarkdown(content);
  if (!plainText || plainText.length < 10) {
    return {
      summary: 'Note content is too short for AI summarization.',
      keyBulletPoints: ['Add more descriptive text to generate bullet points.'],
      suggestedTags: ['general'],
      readingComplexity: 'Simple'
    };
  }

  // 1. Sentences extraction & executive summary
  const sentences = plainText
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 5);

  let summary = '';
  if (sentences.length <= 2) {
    summary = plainText;
  } else {
    // Pick first sentence + highest scoring middle/last sentence
    summary = `${sentences[0]} ${sentences[Math.floor(sentences.length / 2)]}`;
  }

  // 2. Key Bullet Points (top 3 sentences or phrases)
  const keyBulletPoints: string[] = [];
  if (sentences.length > 0) keyBulletPoints.push(sentences[0]);
  if (sentences.length > 1) keyBulletPoints.push(sentences[Math.floor(sentences.length / 2)]);
  if (sentences.length > 2) keyBulletPoints.push(sentences[sentences.length - 1]);

  // 3. Keyword frequency analysis for smart tag recommendations
  const words = plainText
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !COMMON_STOP_WORDS.has(w));

  const frequencyMap = new Map<string, number>();
  for (const word of words) {
    frequencyMap.set(word, (frequencyMap.get(word) || 0) + 1);
  }

  const sortedKeywords = Array.from(frequencyMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);

  const suggestedTags = Array.from(new Set(sortedKeywords.slice(0, 4)));
  if (suggestedTags.length === 0) suggestedTags.push('note');

  // 4. Complexity score calculation
  const avgWordLength = words.reduce((acc, w) => acc + w.length, 0) / (words.length || 1);
  let readingComplexity: 'Simple' | 'Moderate' | 'Advanced' = 'Simple';
  if (avgWordLength > 6) readingComplexity = 'Advanced';
  else if (avgWordLength > 5) readingComplexity = 'Moderate';

  return {
    summary,
    keyBulletPoints,
    suggestedTags,
    readingComplexity
  };
}
