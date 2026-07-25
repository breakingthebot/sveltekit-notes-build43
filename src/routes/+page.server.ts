// src/routes/+page.server.ts
// Server-side data loader and SvelteKit Form Actions for Build 43.
// Connects to: src/lib/server/notesStore.ts, src/lib/services/revisionService.ts, src/routes/+page.svelte
// Created: 2026-07-25

import type { PageServerLoad, Actions } from './$types';
import { 
  getAllNotes, 
  getTrashCount, 
  getAllTags, 
  getAllFolders, 
  createNote, 
  updateNote, 
  softDeleteNote, 
  restoreNote, 
  purgeNote, 
  emptyTrash, 
  togglePinNote, 
  toggleFavoriteNote 
} from '$lib/server/notesStore';
import { saveRevision, getRevisionById } from '$lib/services/revisionService';

export const load: PageServerLoad = async ({ url }) => {
  const selectedTag = url.searchParams.get('tag') || 'all';
  const searchQuery = url.searchParams.get('q') || '';
  const selectedFolder = url.searchParams.get('folder') || 'all';
  const favoriteOnly = url.searchParams.get('fav') === 'true';
  const showTrash = url.searchParams.get('trash') === 'true';

  const notes = getAllNotes(selectedTag, searchQuery, selectedFolder, favoriteOnly, showTrash);
  const trashCount = getTrashCount();
  const tags = getAllTags();
  const folders = getAllFolders();

  return {
    notes,
    trashCount,
    tags,
    folders,
    selectedTag,
    searchQuery,
    selectedFolder,
    favoriteOnly,
    showTrash
  };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const data = await request.formData();
    const title = data.get('title')?.toString() || '';
    const content = data.get('content')?.toString() || '';
    const tags = data.get('tags')?.toString() || '';
    const folder = data.get('folder')?.toString() || 'Work';
    const color = data.get('color')?.toString() || '#06b6d4';

    const note = createNote(title, content, tags, folder, color);
    saveRevision(note, 'Initial Created Note');
    return { success: true };
  },

  update: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id')?.toString() || '';
    const title = data.get('title')?.toString() || '';
    const content = data.get('content')?.toString() || '';
    const tags = data.get('tags')?.toString() || '';
    const folder = data.get('folder')?.toString() || 'Work';
    const color = data.get('color')?.toString() || '#06b6d4';

    if (id) {
      const updated = updateNote(id, title, content, tags, folder, color);
      if (updated) saveRevision(updated, 'Updated Note Content');
    }
    return { success: true };
  },

  revertRevision: async ({ request }) => {
    const data = await request.formData();
    const revId = data.get('revId')?.toString() || '';

    if (revId) {
      const rev = getRevisionById(revId);
      if (rev) {
        const updated = updateNote(
          rev.noteId, 
          rev.title, 
          rev.content, 
          rev.tags.join(', '), 
          rev.folder
        );
        if (updated) saveRevision(updated, `Reverted to Revision (${new Date(rev.timestamp).toLocaleTimeString()})`);
      }
    }
    return { success: true };
  },

  delete: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id')?.toString() || '';

    if (id) {
      softDeleteNote(id);
    }
    return { success: true };
  },

  restore: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id')?.toString() || '';

    if (id) {
      restoreNote(id);
    }
    return { success: true };
  },

  purge: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id')?.toString() || '';

    if (id) {
      purgeNote(id);
    }
    return { success: true };
  },

  emptyTrash: async () => {
    emptyTrash();
    return { success: true };
  },

  togglePin: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id')?.toString() || '';

    if (id) {
      togglePinNote(id);
    }
    return { success: true };
  },

  toggleFavorite: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id')?.toString() || '';

    if (id) {
      toggleFavoriteNote(id);
    }
    return { success: true };
  }
};
