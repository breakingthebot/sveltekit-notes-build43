// src/lib/services/commandPaletteService.spec.ts
// Unit tests for commandPaletteService in Build 43.
// Created: 2026-07-25

import { describe, it, expect } from 'vitest';
import { filterPaletteActions, type PaletteAction } from './commandPaletteService';

const mockActions: PaletteAction[] = [
  { id: '1', title: 'Create New Note', category: 'Actions', icon: '➕', actionKey: 'create_note' },
  { id: '2', title: 'Export JSON', category: 'Actions', icon: '📥', actionKey: 'export_json' },
  { id: '3', title: 'Work Folder', category: 'Folders', icon: '💼', actionKey: 'folder_work' }
];

describe('commandPaletteService', () => {
  it('should return all actions when query is empty', () => {
    const results = filterPaletteActions(mockActions, '');
    expect(results.length).toBe(3);
  });

  it('should filter actions by title or category', () => {
    const results = filterPaletteActions(mockActions, 'export');
    expect(results.length).toBe(1);
    expect(results[0].title).toBe('Export JSON');
  });
});
