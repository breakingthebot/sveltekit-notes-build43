// src/lib/server/notesStore.spec.ts
// Unit tests for notesStore server repository in Build 43.
// Created: 2026-07-25

import { describe, it, expect } from 'vitest';
import { 
  createNote, 
  getAllNotes, 
  deleteNote, 
  togglePinNote, 
  toggleFavoriteNote, 
  moveNoteToFolder, 
  getAllFolders 
} from './notesStore';

describe('notesStore', () => {
  it('should create a new note with folder and processed tags', () => {
    const note = createNote('Test Note Title', 'Content of test note', 'svelte, test', 'Personal');

    expect(note.title).toBe('Test Note Title');
    expect(note.tags).toContain('svelte');
    expect(note.folder).toBe('Personal');
    expect(note.isFavorite).toBe(false);
  });

  it('should toggle favorite star status on a note', () => {
    const all = getAllNotes();
    const target = all[0];
    const initialFav = target.isFavorite;

    const updated = toggleFavoriteNote(target.id);
    expect(updated?.isFavorite).toBe(!initialFav);
  });

  it('should move note to a new folder and filter by folder', () => {
    const created = createNote('Folder Test', 'Content', 'tag', 'Work');
    moveNoteToFolder(created.id, 'Archive');

    const archiveNotes = getAllNotes('all', '', 'Archive');
    expect(archiveNotes.some(n => n.id === created.id)).toBe(true);
  });

  it('should filter notes by favorites tab', () => {
    const favs = getAllNotes('all', '', 'all', true);
    expect(favs.every(n => n.isFavorite)).toBe(true);
  });

  it('should list all available folders', () => {
    const folders = getAllFolders();
    expect(folders).toContain('Work');
    expect(folders).toContain('Personal');
    expect(folders).toContain('Ideas');
    expect(folders).toContain('Archive');
  });
});
