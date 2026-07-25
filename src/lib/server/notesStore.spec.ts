// src/lib/server/notesStore.spec.ts
// Unit tests for notesStore server repository in Build 43.
// Created: 2026-07-25

import { describe, it, expect } from 'vitest';
import { createNote, getAllNotes, deleteNote, togglePinNote, getAllTags } from './notesStore';

describe('notesStore', () => {
  it('should create a new note with processed tags', () => {
    const note = createNote('Test Note Title', 'Content of test note', 'svelte, test, SvelteKit');

    expect(note.title).toBe('Test Note Title');
    expect(note.tags).toContain('svelte');
    expect(note.tags).toContain('test');
    expect(note.tags).toContain('sveltekit');
    expect(note.isPinned).toBe(false);
  });

  it('should filter notes by tag and search query', () => {
    const all = getAllNotes();
    expect(all.length).toBeGreaterThan(0);

    const svelteNotes = getAllNotes('sveltekit');
    expect(svelteNotes.length).toBeGreaterThan(0);
  });

  it('should toggle pin status on a note', () => {
    const all = getAllNotes();
    const target = all[0];
    const initialPin = target.isPinned;

    const updated = togglePinNote(target.id);
    expect(updated?.isPinned).toBe(!initialPin);
  });

  it('should delete a note by id', () => {
    const created = createNote('Delete Me', 'Temporary note', 'temp');
    const success = deleteNote(created.id);

    expect(success).toBe(true);
    const found = getAllNotes().find(n => n.id === created.id);
    expect(found).toBeUndefined();
  });
});
