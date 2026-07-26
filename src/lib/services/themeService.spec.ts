// src/lib/services/themeService.spec.ts
// Unit tests for themeService.
// Connects to: src/lib/services/themeService.ts
// Created: 2026-07-26

import { describe, it, expect } from 'vitest';
import { getAvailableThemes, getThemeByKey, isValidTheme, THEMES } from './themeService';

describe('themeService', () => {
  it('returns all available theme presets', () => {
    const themes = getAvailableThemes();
    expect(themes.length).toBe(5);
    expect(themes[0].key).toBe('default');
    expect(themes[1].key).toBe('cyberpunk');
  });

  it('retrieves theme config by key correctly', () => {
    const cyberpunk = getThemeByKey('cyberpunk');
    expect(cyberpunk.name).toBe('Cyberpunk Neon');
    expect(cyberpunk.accentColor).toBe('#f43f5e');

    const fallback = getThemeByKey('non-existent-theme');
    expect(fallback.key).toBe('default');
  });

  it('validates theme keys correctly', () => {
    expect(isValidTheme('emerald')).toBe(true);
    expect(isValidTheme('midnight')).toBe(true);
    expect(isValidTheme('invalid-key')).toBe(false);
  });
});
