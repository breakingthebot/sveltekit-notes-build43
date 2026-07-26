// src/lib/services/shortcutService.ts
// Keyboard Shortcuts Registry & Key Combination Matcher for Build 43 (SvelteKit).
// Connects to: src/routes/+page.svelte, src/lib/services/shortcutService.spec.ts
// Created: 2026-07-26

export interface ShortcutItem {
  key: string;
  label: string;
  description: string;
  category: 'Global' | 'Navigation' | 'Actions';
}

export const KEYBOARD_SHORTCUTS: ShortcutItem[] = [
  { key: 'Ctrl+N', label: 'Create New Note', description: 'Opens the note creation modal editor', category: 'Global' },
  { key: 'Ctrl+K', label: 'Command Palette', description: 'Opens the quick command palette search bar', category: 'Global' },
  { key: 'Shift+S', label: 'Toggle Sticky Pad', description: 'Toggles the collapsible sticky notes scratchpad drawer', category: 'Navigation' },
  { key: 'Shift+E', label: 'Export Vault JSON', description: 'Downloads full vault JSON backup', category: 'Actions' },
  { key: 'Shift+I', label: 'Import Notebook', description: 'Opens batch notebook import modal', category: 'Actions' },
  { key: '?', label: 'Shortcuts Reference', description: 'Toggles this keyboard shortcuts cheat sheet', category: 'Global' },
  { key: 'Esc', label: 'Close Active Modal', description: 'Closes any open dialog modal or palette', category: 'Navigation' }
];

export function getShortcutsByCategory(): Record<string, ShortcutItem[]> {
  const categories: Record<string, ShortcutItem[]> = {
    Global: [],
    Navigation: [],
    Actions: []
  };

  for (const item of KEYBOARD_SHORTCUTS) {
    if (!categories[item.category]) categories[item.category] = [];
    categories[item.category].push(item);
  }

  return categories;
}

export function isShortcutTriggered(
  e: { key: string; ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean }, 
  shortcutKey: string
): boolean {
  const isCtrl = Boolean(e.ctrlKey || e.metaKey);
  const isShift = Boolean(e.shiftKey);
  const key = e.key.toLowerCase();

  switch (shortcutKey) {
    case 'Ctrl+N':
      return isCtrl && key === 'n';
    case 'Ctrl+K':
      return isCtrl && key === 'k';
    case 'Shift+S':
      return isShift && key === 's';
    case 'Shift+E':
      return isShift && key === 'e';
    case 'Shift+I':
      return isShift && key === 'i';
    case '?':
      return key === '?' || (isShift && e.key === '/');
    case 'Esc':
      return key === 'escape';
    default:
      return false;
  }
}
