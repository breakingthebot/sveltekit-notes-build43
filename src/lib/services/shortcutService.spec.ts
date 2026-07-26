// src/lib/services/shortcutService.spec.ts
// Unit tests for shortcutService.
// Connects to: src/lib/services/shortcutService.ts
// Created: 2026-07-26

import { describe, it, expect } from 'vitest';
import { getShortcutsByCategory, isShortcutTriggered, KEYBOARD_SHORTCUTS } from './shortcutService';

describe('shortcutService', () => {
  it('returns all keyboard shortcuts grouped by category', () => {
    const grouped = getShortcutsByCategory();
    expect(grouped.Global.length).toBeGreaterThan(0);
    expect(grouped.Navigation.length).toBeGreaterThan(0);
    expect(grouped.Actions.length).toBeGreaterThan(0);
  });

  it('correctly matches keyboard combination events', () => {
    const fakeCtrlN = { key: 'n', ctrlKey: true };
    expect(isShortcutTriggered(fakeCtrlN, 'Ctrl+N')).toBe(true);

    const fakeShiftS = { key: 'S', shiftKey: true };
    expect(isShortcutTriggered(fakeShiftS, 'Shift+S')).toBe(true);

    const fakeQuestion = { key: '?' };
    expect(isShortcutTriggered(fakeQuestion, '?')).toBe(true);
  });

  it('contains expected shortcut items in registry', () => {
    const keys = KEYBOARD_SHORTCUTS.map(s => s.key);
    expect(keys).toContain('Ctrl+N');
    expect(keys).toContain('Ctrl+K');
    expect(keys).toContain('?');
  });
});
