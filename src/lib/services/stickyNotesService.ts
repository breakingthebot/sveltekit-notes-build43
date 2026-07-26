// src/lib/services/stickyNotesService.ts
// Service logic for sticky notes scratchpad & pinned sidebar management.
// Connects to: src/routes/+page.svelte, src/lib/services/stickyNotesService.spec.ts
// Created: 2026-07-26

export interface StickyNote {
  id: string;
  content: string;
  color: string;
  createdAt: number;
  isPinned: boolean;
}

const DEFAULT_STICKIES: StickyNote[] = [
  {
    id: 'sticky-1',
    content: '🚀 Quick reminder: Review Svelte 5 Rune documentation for $state and $derived!',
    color: '#fef08a', // Yellow sticky
    createdAt: Date.now() - 3600000,
    isPinned: true
  },
  {
    id: 'sticky-2',
    content: '💡 Next sprint: Add AI note summary & auto-tagging API integration.',
    color: '#bbf7d0', // Light green sticky
    createdAt: Date.now() - 1800000,
    isPinned: false
  }
];

let stickiesMemoryStore: StickyNote[] = [...DEFAULT_STICKIES];

export function getStickyNotes(): StickyNote[] {
  return [...stickiesMemoryStore];
}

export function createStickyNote(content: string, color: string = '#fef08a'): StickyNote {
  const newSticky: StickyNote = {
    id: 'sticky-' + Math.random().toString(36).substring(2, 9),
    content: content.trim() || 'New scratchpad note...',
    color,
    createdAt: Date.now(),
    isPinned: false
  };
  stickiesMemoryStore.unshift(newSticky);
  return newSticky;
}

export function updateStickyNote(id: string, content: string): StickyNote | null {
  const index = stickiesMemoryStore.findIndex(s => s.id === id);
  if (index !== -1) {
    stickiesMemoryStore[index].content = content;
    return stickiesMemoryStore[index];
  }
  return null;
}

export function deleteStickyNote(id: string): boolean {
  const initialLen = stickiesMemoryStore.length;
  stickiesMemoryStore = stickiesMemoryStore.filter(s => s.id !== id);
  return stickiesMemoryStore.length < initialLen;
}

export function toggleStickyPin(id: string): boolean {
  const index = stickiesMemoryStore.findIndex(s => s.id === id);
  if (index !== -1) {
    stickiesMemoryStore[index].isPinned = !stickiesMemoryStore[index].isPinned;
    return stickiesMemoryStore[index].isPinned;
  }
  return false;
}

export function resetStickyNotes(): void {
  stickiesMemoryStore = [...DEFAULT_STICKIES];
}
