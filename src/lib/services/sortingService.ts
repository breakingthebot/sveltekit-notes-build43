// src/lib/services/sortingService.ts
// Service module for multi-criteria note sorting and priority ordering in Build 43.
// Connects to: src/routes/+page.svelte, src/routes/+page.server.ts, src/lib/services/sortingService.spec.ts
// Created: 2026-07-26

import type { Note } from '$lib/server/notesStore';
import { analyzeNoteText } from '$lib/services/noteAnalyticsService';

export type SortCriteria = 'updated' | 'created' | 'title' | 'words' | 'pinned';

export interface SortOption {
  key: SortCriteria;
  label: string;
  icon: string;
  description: string;
}

export const SORT_OPTIONS: SortOption[] = [
  {
    key: 'pinned',
    label: 'Pinned First',
    icon: '📌',
    description: 'Pinned notes locked at top, sorted by update time.'
  },
  {
    key: 'updated',
    label: 'Recently Updated',
    icon: '🕒',
    description: 'Sort by newest modification timestamp.'
  },
  {
    key: 'created',
    label: 'Date Created',
    icon: '📅',
    description: 'Sort by newest creation timestamp.'
  },
  {
    key: 'title',
    label: 'Title (A-Z)',
    icon: '🔤',
    description: 'Alphabetical sorting by note title.'
  },
  {
    key: 'words',
    label: 'Word Count (High-Low)',
    icon: '📝',
    description: 'Sort by longest note content length.'
  }
];

export function getSortOptions(): SortOption[] {
  return [...SORT_OPTIONS];
}

export function sortNotes(notes: Note[], criteria: SortCriteria = 'pinned'): Note[] {
  const sorted = [...notes];

  switch (criteria) {
    case 'pinned':
      return sorted.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return b.updatedAt - a.updatedAt;
      });

    case 'updated':
      return sorted.sort((a, b) => b.updatedAt - a.updatedAt);

    case 'created':
      return sorted.sort((a, b) => b.createdAt - a.createdAt);

    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));

    case 'words':
      return sorted.sort((a, b) => {
        const countA = analyzeNoteText(a.content).wordCount;
        const countB = analyzeNoteText(b.content).wordCount;
        return countB - countA;
      });

    default:
      return sorted;
  }
}
