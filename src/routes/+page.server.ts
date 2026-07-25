// src/routes/+page.server.ts
// Server-side data loader and SvelteKit Form Actions for Build 43.
// Connects to: src/lib/server/notesStore.ts, src/routes/+page.svelte
// Created: 2026-07-25

import type { PageServerLoad, Actions } from './$types';
import { getAllNotes, getAllTags, createNote, updateNote, deleteNote, togglePinNote } from '$lib/server/notesStore';

export const load: PageServerLoad = async ({ url }) => {
  const selectedTag = url.searchParams.get('tag') || 'all';
  const searchQuery = url.searchParams.get('q') || '';

  const notes = getAllNotes(selectedTag, searchQuery);
  const tags = getAllTags();

  return {
    notes,
    tags,
    selectedTag,
    searchQuery
  };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const data = await request.formData();
    const title = data.get('title')?.toString() || '';
    const content = data.get('content')?.toString() || '';
    const tags = data.get('tags')?.toString() || '';
    const color = data.get('color')?.toString() || '#06b6d4';

    createNote(title, content, tags, color);
    return { success: true };
  },

  update: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id')?.toString() || '';
    const title = data.get('title')?.toString() || '';
    const content = data.get('content')?.toString() || '';
    const tags = data.get('tags')?.toString() || '';
    const color = data.get('color')?.toString() || '#06b6d4';

    if (id) {
      updateNote(id, title, content, tags, color);
    }
    return { success: true };
  },

  delete: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id')?.toString() || '';

    if (id) {
      deleteNote(id);
    }
    return { success: true };
  },

  togglePin: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id')?.toString() || '';

    if (id) {
      togglePinNote(id);
    }
    return { success: true };
  }
};
