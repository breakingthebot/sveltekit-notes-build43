// src/lib/server/notesStore.ts
// Server-side Notes Store & Data Repository for Build 43 (SvelteKit).
// Connects to: src/routes/+page.server.ts
// Created: 2026-07-25

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  color: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// In-memory server-side seed dataset
let notesDb: Note[] = [
  {
    id: 'note-1',
    title: '🚀 SvelteKit 5 Server-Side Loaders',
    content: 'SvelteKit +page.server.ts load functions allow fetching data on the server before rendering HTML, providing zero-JS initial page loads and seamless SSR SEO.',
    tags: ['sveltekit', 'web-dev', 'architecture'],
    color: '#06b6d4',
    isPinned: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'note-2',
    title: '💡 Atomic Component Design Standards',
    content: 'Break UI down into small, single-responsibility atomic components. Keep UI, state, and business logic separated for maximum reusability and testability.',
    tags: ['design', 'best-practices'],
    color: '#10b981',
    isPinned: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'note-3',
    title: '📝 Weekly Sprint Roadmap & Ideas',
    content: 'Focus on shipping 15-20 iterations per build folder. Validate clean unit test runs and production build compilations before deploying to Vercel.',
    tags: ['productivity', 'notes'],
    color: '#a855f7',
    isPinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function getAllNotes(filterTag?: string, searchQuery?: string): Note[] {
  let list = [...notesDb];

  if (filterTag && filterTag !== 'all') {
    list = list.filter(n => n.tags.includes(filterTag.toLowerCase()));
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(n => 
      n.title.toLowerCase().includes(q) || 
      n.content.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  // Sort: Pinned notes first, then latest updated first
  return list.sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  notesDb.forEach(n => n.tags.forEach(t => tagSet.add(t.toLowerCase())));
  return Array.from(tagSet).sort();
}

export function createNote(title: string, content: string, tagsStr: string, color?: string): Note {
  const tags = tagsStr
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length > 0);

  const newNote: Note = {
    id: 'note-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    title: title.trim() || 'Untitled Note',
    content: content.trim(),
    tags: tags.length > 0 ? tags : ['general'],
    color: color || '#06b6d4',
    isPinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  notesDb.unshift(newNote);
  return newNote;
}

export function updateNote(id: string, title: string, content: string, tagsStr: string, color?: string): Note | null {
  const idx = notesDb.findIndex(n => n.id === id);
  if (idx === -1) return null;

  const tags = tagsStr
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length > 0);

  notesDb[idx] = {
    ...notesDb[idx],
    title: title.trim() || notesDb[idx].title,
    content: content.trim(),
    tags: tags.length > 0 ? tags : notesDb[idx].tags,
    color: color || notesDb[idx].color,
    updatedAt: new Date().toISOString()
  };

  return notesDb[idx];
}

export function deleteNote(id: string): boolean {
  const initialLen = notesDb.length;
  notesDb = notesDb.filter(n => n.id !== id);
  return notesDb.length < initialLen;
}

export function togglePinNote(id: string): Note | null {
  const idx = notesDb.findIndex(n => n.id === id);
  if (idx === -1) return null;

  notesDb[idx].isPinned = !notesDb[idx].isPinned;
  notesDb[idx].updatedAt = new Date().toISOString();
  return notesDb[idx];
}
