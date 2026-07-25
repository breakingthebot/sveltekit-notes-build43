<!-- src/routes/+page.svelte -->
<!-- Main SvelteKit Notes Vault Page component for Build 43 (Svelte 5 Runes). -->
<!-- Connects to: src/routes/+page.server.ts, src/lib/server/notesStore.ts -->
<!-- Created: 2026-07-25 -->

<script lang="ts">
  import type { PageData } from './$types';
  import type { Note } from '$lib/server/notesStore';

  let { data }: { data: PageData } = $props();

  let isModalOpen = $state(false);
  let editingNote: Note | null = $state(null);

  let formTitle = $state('');
  let formContent = $state('');
  let formTags = $state('');
  let formColor = $state('#06b6d4');

  function openCreateModal() {
    editingNote = null;
    formTitle = '';
    formContent = '';
    formTags = '';
    formColor = '#06b6d4';
    isModalOpen = true;
  }

  function openEditModal(note: Note) {
    editingNote = note;
    formTitle = note.title;
    formContent = note.content;
    formTags = note.tags.join(', ');
    formColor = note.color;
    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
    editingNote = null;
  }
</script>

<svelte:head>
  <title>SvelteKit Notes Vault — Full Stack Notes & Tag Manager</title>
</svelte:head>

<main class="container">
  <!-- Top Navigation & Brand Header -->
  <header class="app-header card">
    <div class="brand-box">
      <span class="logo-icon">🗂️</span>
      <div>
        <h1 class="app-title">SvelteKit Notes Vault</h1>
        <p class="subtitle">Full-stack server-rendered notes app with tag filtering & form actions</p>
      </div>
    </div>

    <button type="button" onclick={openCreateModal} class="btn btn-primary">
      ➕ Create New Note
    </button>
  </header>

  <!-- Filter & Search Toolbar -->
  <section class="toolbar-section card">
    <!-- Tag Filter Pills -->
    <div class="tag-filter-pills">
      <a 
        href="?tag=all{data.searchQuery ? `&q=${data.searchQuery}` : ''}" 
        class="filter-pill"
        class:active={data.selectedTag === 'all'}
      >
        🌟 All Notes ({data.notes.length})
      </a>

      {#each data.tags as tag}
        <a 
          href="?tag={tag}{data.searchQuery ? `&q=${data.searchQuery}` : ''}" 
          class="filter-pill"
          class:active={data.selectedTag === tag}
        >
          🏷️ {tag}
        </a>
      {/each}
    </div>

    <!-- Search Form -->
    <form method="GET" class="search-form">
      {#if data.selectedTag && data.selectedTag !== 'all'}
        <input type="hidden" name="tag" value={data.selectedTag} />
      {/if}
      <input 
        type="text" 
        name="q" 
        value={data.searchQuery}
        placeholder="🔍 Search notes or tags..." 
        class="search-input"
      />
      <button type="submit" class="btn btn-secondary">Search</button>
    </form>
  </section>

  <!-- Notes Grid Section -->
  <section class="notes-grid">
    {#each data.notes as note (note.id)}
      <article class="note-card card fade-in" style="border-top: 4px solid {note.color};">
        <div class="note-head">
          <h3 class="note-title">{note.title}</h3>
          
          {#if note.isPinned}
            <span class="pinned-badge">📌 PINNED</span>
          {/if}
        </div>

        <p class="note-content">{note.content}</p>

        <!-- Tag Pills -->
        <div class="note-tags">
          {#each note.tags as t}
            <span class="tag-chip">#{t}</span>
          {/each}
        </div>

        <!-- Note Actions Bar -->
        <div class="note-footer">
          <span class="updated-time">Updated {new Date(note.updatedAt).toLocaleDateString()}</span>

          <div class="card-actions">
            <!-- Pin Form Action -->
            <form method="POST" action="?/togglePin">
              <input type="hidden" name="id" value={note.id} />
              <button type="submit" class="icon-btn" title={note.isPinned ? 'Unpin Note' : 'Pin Note'}>
                {note.isPinned ? '📌' : '📍'}
              </button>
            </form>

            <!-- Edit Button -->
            <button type="button" onclick={() => openEditModal(note)} class="icon-btn" title="Edit Note">
              ✏️
            </button>

            <!-- Delete Form Action -->
            <form method="POST" action="?/delete">
              <input type="hidden" name="id" value={note.id} />
              <button type="submit" class="icon-btn danger" title="Delete Note">
                🗑️
              </button>
            </form>
          </div>
        </div>
      </article>
    {:else}
      <div class="empty-state card">
        📭 <strong>No notes found</strong>
        <p>No notes match your current filter or search query. Click <strong>➕ Create New Note</strong> above to add one!</p>
      </div>
    {/each}
  </section>
</main>

<!-- Create / Edit Modal -->
{#if isModalOpen}
  <div class="modal-backdrop fade-in">
    <div class="modal-card card">
      <div class="modal-header">
        <h2>{editingNote ? '✏️ Edit Note' : '➕ Create New Note'}</h2>
        <button type="button" onclick={closeModal} class="close-btn">❌</button>
      </div>

      <form method="POST" action={editingNote ? '?/update' : '?/create'} onsubmit={closeModal} class="modal-form">
        {#if editingNote}
          <input type="hidden" name="id" value={editingNote.id} />
        {/if}

        <div class="form-group">
          <label for="note-title-input">Title</label>
          <input 
            id="note-title-input" 
            type="text" 
            name="title" 
            bind:value={formTitle} 
            placeholder="Note title..." 
            required 
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="note-content-input">Content</label>
          <textarea 
            id="note-content-input" 
            name="content" 
            bind:value={formContent} 
            placeholder="Write your note thoughts..." 
            rows="5" 
            required 
            class="form-textarea"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="note-tags-input">Tags (comma separated)</label>
          <input 
            id="note-tags-input" 
            type="text" 
            name="tags" 
            bind:value={formTags} 
            placeholder="e.g. sveltekit, work, ideas" 
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="note-color-input">Accent Color</label>
          <div class="color-options">
            <button type="button" onclick={() => formColor = '#06b6d4'} class="color-pill" class:active={formColor === '#06b6d4'} style="background: #06b6d4;"></button>
            <button type="button" onclick={() => formColor = '#10b981'} class="color-pill" class:active={formColor === '#10b981'} style="background: #10b981;"></button>
            <button type="button" onclick={() => formColor = '#a855f7'} class="color-pill" class:active={formColor === '#a855f7'} style="background: #a855f7;"></button>
            <button type="button" onclick={() => formColor = '#f59e0b'} class="color-pill" class:active={formColor === '#f59e0b'} style="background: #f59e0b;"></button>
            <button type="button" onclick={() => formColor = '#ec4899'} class="color-pill" class:active={formColor === '#ec4899'} style="background: #ec4899;"></button>
            <input type="hidden" name="color" value={formColor} />
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" onclick={closeModal} class="btn btn-secondary">Cancel</button>
          <button type="submit" class="btn btn-primary">{editingNote ? 'Save Changes' : 'Create Note'}</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .app-header {
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(15, 23, 42, 0.8));
    border-color: rgba(6, 182, 212, 0.3);
  }

  .brand-box {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo-icon { font-size: 32px; }
  .app-title { font-size: 24px; font-weight: 800; font-family: var(--font-heading); }
  .subtitle { font-size: 13px; color: var(--text-secondary); }

  .toolbar-section {
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }

  .tag-filter-pills {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .filter-pill {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .filter-pill.active, .filter-pill:hover {
    background: var(--accent-cyan);
    color: #000;
    border-color: var(--accent-cyan);
  }

  .search-form {
    display: flex;
    gap: 8px;
  }

  .search-input {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    color: #fff;
    font-size: 13px;
    padding: 6px 12px;
    width: 220px;
  }

  .notes-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;

    @media (min-width: 650px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: 1000px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .note-card {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    justify-content: space-between;
  }

  .note-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
  }

  .note-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .pinned-badge {
    font-size: 10px;
    font-weight: 800;
    color: var(--accent-amber);
    background: rgba(245, 158, 11, 0.15);
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid rgba(245, 158, 11, 0.3);
  }

  .note-content {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
    white-space: pre-wrap;
    flex: 1;
  }

  .note-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .tag-chip {
    font-size: 11px;
    color: var(--accent-cyan);
    background: rgba(6, 182, 212, 0.1);
    padding: 2px 8px;
    border-radius: 12px;
  }

  .note-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
    border-top: 1px solid var(--border-color);
  }

  .updated-time {
    font-size: 11px;
    color: var(--text-muted);
  }

  .card-actions {
    display: flex;
    gap: 6px;
  }

  .icon-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
  }

  .icon-btn:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .icon-btn.danger:hover {
    background: rgba(239, 68, 68, 0.3);
  }

  .empty-state {
    grid-column: 1 / -1;
    padding: 40px;
    text-align: center;
    color: var(--text-secondary);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }

  .modal-card {
    width: 100%;
    max-width: 500px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-header h2 { font-size: 18px; font-weight: 800; }
  .close-btn { background: none; border: none; font-size: 16px; cursor: pointer; color: var(--text-muted); }

  .modal-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-group label { font-size: 12px; font-weight: 700; color: var(--text-secondary); }

  .form-input, .form-textarea {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    color: #fff;
    font-size: 14px;
    padding: 8px 12px;
    font-family: var(--font-sans);
  }

  .color-options {
    display: flex;
    gap: 10px;
  }

  .color-pill {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
  }

  .color-pill.active {
    border-color: #fff;
    transform: scale(1.15);
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 10px;
  }
</style>
