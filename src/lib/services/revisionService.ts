// src/lib/services/revisionService.ts
// Note Revision History & Text Diff calculation service for Build 43 (SvelteKit).
// Connects to: src/routes/+page.server.ts, src/routes/+page.svelte
// Created: 2026-07-25

import type { Note } from '$lib/server/notesStore';

export interface NoteRevision {
  id: string;
  noteId: string;
  title: string;
  content: string;
  tags: string[];
  folder: string;
  timestamp: string;
  changeSummary: string;
}

export interface DiffLine {
  type: 'added' | 'deleted' | 'unchanged';
  text: string;
}

// In-memory revision database
let revisionsDb: NoteRevision[] = [];

export function saveRevision(note: Note, summary: string = 'Updated Note'): NoteRevision {
  const rev: NoteRevision = {
    id: 'rev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    noteId: note.id,
    title: note.title,
    content: note.content,
    tags: [...note.tags],
    folder: note.folder,
    timestamp: new Date().toISOString(),
    changeSummary: summary
  };

  revisionsDb.unshift(rev);
  return rev;
}

export function getRevisionsForNote(noteId: string): NoteRevision[] {
  return revisionsDb.filter(r => r.noteId === noteId);
}

export function getRevisionById(revId: string): NoteRevision | undefined {
  return revisionsDb.find(r => r.id === revId);
}

export function computeTextDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText ? oldText.split('\n') : [];
  const newLines = newText ? newText.split('\n') : [];
  const diffs: DiffLine[] = [];

  const maxLen = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLen; i++) {
    const oldL = oldLines[i];
    const newL = newLines[i];

    if (oldL === newL) {
      if (oldL !== undefined) diffs.push({ type: 'unchanged', text: oldL });
    } else {
      if (oldL !== undefined) diffs.push({ type: 'deleted', text: oldL });
      if (newL !== undefined) diffs.push({ type: 'added', text: newL });
    }
  }

  return diffs;
}
