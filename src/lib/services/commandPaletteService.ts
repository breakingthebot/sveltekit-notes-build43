// src/lib/services/commandPaletteService.ts
// Command Palette action indexer and keyboard shortcut helper for Build 43 (SvelteKit).
// Connects to: src/routes/+page.svelte
// Created: 2026-07-25

export interface PaletteAction {
  id: string;
  title: string;
  category: 'Actions' | 'Folders' | 'Filters' | 'Notes';
  icon: string;
  shortcut?: string;
  actionKey: string;
  noteId?: string;
}

export function filterPaletteActions(actions: PaletteAction[], query: string): PaletteAction[] {
  if (!query || !query.trim()) return actions;
  const q = query.toLowerCase().trim();

  return actions.filter(a => 
    a.title.toLowerCase().includes(q) || 
    a.category.toLowerCase().includes(q)
  );
}
