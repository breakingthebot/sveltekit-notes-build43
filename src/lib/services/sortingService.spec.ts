// src/lib/services/sortingService.spec.ts
// Unit tests for sortingService.
// Connects to: src/lib/services/sortingService.ts
// Created: 2026-07-26

import { describe, it, expect } from 'vitest';
import { sortNotes, getSortOptions } from './sortingService';
import type { Note } from '$lib/server/notesStore';

const mockNotes: Note[] = [
  {
    id: 'n1',
    title: 'Zebra Architecture',
    content: 'Short note content',
    tags: ['work'],
    folder: 'Work',
    color: '#06b6d4',
    createdAt: 1000,
    updatedAt: 2000,
    isPinned: false,
    isFavorite: false
  },
  {
    id: 'n2',
    title: 'Alpha SvelteKit',
    content: 'This is a much longer detailed note content with many words for word count testing.',
    tags: ['ideas'],
    folder: 'Ideas',
    color: '#10b981',
    createdAt: 3000,
    updatedAt: 4000,
    isPinned: true,
    isFavorite: true
  },
  {
    id: 'n3',
    title: 'Beta TypeScript',
    content: 'Medium length note content snippet',
    tags: ['dev'],
    folder: 'Work',
    color: '#a855f7',
    createdAt: 2000,
    updatedAt: 3000,
    isPinned: false,
    isFavorite: false
  }
];

describe('sortingService', () => {
  it('retrieves available sort options', () => {
    const options = getSortOptions();
    expect(options.length).toBe(5);
    expect(options[0].key).toBe('pinned');
  });

  it('sorts notes by pinned priority first', () => {
    const sorted = sortNotes(mockNotes, 'pinned');
    expect(sorted[0].id).toBe('n2'); // n2 is pinned
  });

  it('sorts notes alphabetically by title', () => {
    const sorted = sortNotes(mockNotes, 'title');
    expect(sorted[0].title).toBe('Alpha SvelteKit');
    expect(sorted[1].title).toBe('Beta TypeScript');
    expect(sorted[2].title).toBe('Zebra Architecture');
  });

  it('sorts notes by word count descending', () => {
    const sorted = sortNotes(mockNotes, 'words');
    expect(sorted[0].id).toBe('n2'); // n2 has most words
  });

  it('sorts notes by date created descending', () => {
    const sorted = sortNotes(mockNotes, 'created');
    expect(sorted[0].id).toBe('n2'); // createdAt 3000
    expect(sorted[1].id).toBe('n3'); // createdAt 2000
    expect(sorted[2].id).toBe('n1'); // createdAt 1000
  });
});
