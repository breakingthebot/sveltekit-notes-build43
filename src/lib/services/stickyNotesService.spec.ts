// src/lib/services/stickyNotesService.spec.ts
// Unit tests for stickyNotesService.
// Connects to: src/lib/services/stickyNotesService.ts
// Created: 2026-07-26

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getStickyNotes, 
  createStickyNote, 
  updateStickyNote, 
  deleteStickyNote, 
  toggleStickyPin, 
  resetStickyNotes 
} from './stickyNotesService';

describe('stickyNotesService', () => {
  beforeEach(() => {
    resetStickyNotes();
  });

  it('retrieves default sticky notes', () => {
    const stickies = getStickyNotes();
    expect(stickies.length).toBeGreaterThanOrEqual(2);
    expect(stickies[0].content).toContain('Quick reminder');
  });

  it('creates a new sticky note', () => {
    const created = createStickyNote('Meeting action items: review PR #43', '#e9d5ff');
    expect(created.content).toBe('Meeting action items: review PR #43');
    expect(created.color).toBe('#e9d5ff');
    expect(getStickyNotes()[0].id).toBe(created.id);
  });

  it('updates existing sticky note content', () => {
    const stickies = getStickyNotes();
    const updated = updateStickyNote(stickies[0].id, 'Updated content text');
    expect(updated?.content).toBe('Updated content text');
  });

  it('deletes a sticky note and toggles pin', () => {
    const stickies = getStickyNotes();
    const targetId = stickies[0].id;
    const initialPin = stickies[0].isPinned;

    const newPinStatus = toggleStickyPin(targetId);
    expect(newPinStatus).toBe(!initialPin);

    const deleted = deleteStickyNote(targetId);
    expect(deleted).toBe(true);
    expect(getStickyNotes().find(s => s.id === targetId)).toBeUndefined();
  });
});
