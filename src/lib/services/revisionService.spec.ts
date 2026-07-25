// src/lib/services/revisionService.spec.ts
// Unit tests for revisionService in Build 43.
// Created: 2026-07-25

import { describe, it, expect } from 'vitest';
import { saveRevision, getRevisionsForNote, computeTextDiff } from './revisionService';
import type { Note } from '$lib/server/notesStore';

const dummyNote: Note = {
  id: 'note-rev-test',
  title: 'Revision Test Note',
  content: 'Original line 1\nOriginal line 2',
  tags: ['test'],
  folder: 'Work',
  color: '#06b6d4',
  isPinned: false,
  isFavorite: false,
  isDeleted: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

describe('revisionService', () => {
  it('should save and retrieve revisions for a note', () => {
    saveRevision(dummyNote, 'Initial Draft');

    const revs = getRevisionsForNote('note-rev-test');
    expect(revs.length).toBeGreaterThan(0);
    expect(revs[0].title).toBe('Revision Test Note');
  });

  it('should compute text diffs between two strings correctly', () => {
    const oldText = 'Line 1\nLine 2';
    const newText = 'Line 1\nLine 2 modified';

    const diffs = computeTextDiff(oldText, newText);

    expect(diffs).toContainEqual({ type: 'unchanged', text: 'Line 1' });
    expect(diffs).toContainEqual({ type: 'deleted', text: 'Line 2' });
    expect(diffs).toContainEqual({ type: 'added', text: 'Line 2 modified' });
  });
});
