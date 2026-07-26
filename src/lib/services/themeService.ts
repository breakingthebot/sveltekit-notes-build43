// src/lib/services/themeService.ts
// Service module for managing visual dark glassmorphic themes in Build 43.
// Connects to: src/routes/+page.svelte, src/app.css, src/lib/services/themeService.spec.ts
// Created: 2026-07-26

export interface ThemeConfig {
  key: string;
  name: string;
  icon: string;
  accentColor: string;
  bgColor: string;
  cardBg: string;
  description: string;
}

export const THEMES: ThemeConfig[] = [
  {
    key: 'default',
    name: 'Cyan Glassmorphic',
    icon: '💎',
    accentColor: '#06b6d4',
    bgColor: '#0f172a',
    cardBg: 'rgba(30, 41, 59, 0.7)',
    description: 'Default deep cyan dark glass design system.'
  },
  {
    key: 'cyberpunk',
    name: 'Cyberpunk Neon',
    icon: '⚡',
    accentColor: '#f43f5e',
    bgColor: '#0d0221',
    cardBg: 'rgba(26, 16, 60, 0.75)',
    description: 'Neon magenta and violet cyberpunk glow theme.'
  },
  {
    key: 'emerald',
    name: 'Emerald Forest',
    icon: '🌲',
    accentColor: '#10b981',
    bgColor: '#064e3b',
    cardBg: 'rgba(4, 120, 87, 0.4)',
    description: 'Deep forest green and emerald accent palette.'
  },
  {
    key: 'midnight',
    name: 'Midnight OLED',
    icon: '🌌',
    accentColor: '#8b5cf6',
    bgColor: '#000000',
    cardBg: 'rgba(18, 18, 18, 0.85)',
    description: 'Pure OLED black background with electric purple accents.'
  },
  {
    key: 'amber',
    name: 'Sunset Amber',
    icon: '🌅',
    accentColor: '#f59e0b',
    bgColor: '#1c1917',
    cardBg: 'rgba(44, 36, 32, 0.75)',
    description: 'Warm obsidian and amber glow palette.'
  }
];

export function getAvailableThemes(): ThemeConfig[] {
  return [...THEMES];
}

export function getThemeByKey(key: string): ThemeConfig {
  const found = THEMES.find(t => t.key === key);
  return found || THEMES[0];
}

export function isValidTheme(key: string): boolean {
  return THEMES.some(t => t.key === key);
}
