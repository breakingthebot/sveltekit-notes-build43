// src/lib/server/notesStore.spec.ts
// Unit tests for notesStore server repository in Build 43.
// Created: 2026-07-25

import { describe, it, expect } from 'vitest';
import { 
  createNote, 
  getAllNotes, 
  softDeleteNote, 
  restoreNote, 
  purgeNote, 
  emptyTrash, 
  getTrashCount, 
  toggleFavoriteNote 
} from './notesStore';

describe('notesStore', () => {
  it('should soft delete a note and move it to trash', () => {
    const note = createNote('Soft Delete Test', 'Content for soft delete', 'test');
    softDeleteNote(note.id);

    const activeNotes = getAllNotes();
    expect(activeNotes.some(n => n.id === note.id)).toBe(false);

    const trashNotes = getAllNotes('all', '', 'all', false, true);
    expect(trashNotes.some(n => n.id === note.id)).toBe(true);
  });

  it('should restore a soft deleted note', () => {
    const note = createNote('Restore Test', 'Content for restore', 'test');
    softDeleteNote(note.id);
    restoreNote(note.id);

    const activeNotes = getAllNotes();
    expect(activeNotes.some(n => n.id === note.id)).toBe(true);
  });

  it('should purge a single note permanently', () => {
    const note = createNote('Purge Test', 'Content to purge', 'test');
    softDeleteNote(note.id);
    purgeNote(note.id);

    const trashNotes = getAllNotes('all', '', 'all', false, true);
    expect(trashNotes.some(n => n.id === note.id)).toBe(false);
  });

  it('should empty trash bin completely', () => {
    const note1 = createNote('Trash 1', 'C1', 't');
    const note2 = createNote('Trash 2', 'C2', 't');
    softDeleteNote(note1.id);
    softDeleteNote(note2.id);

    expect(getTrashCount()).toBeGreaterThanOrEqual(2);
    emptyTrash();
    expect(getTrashCount()).toBe(0);
  });
});
