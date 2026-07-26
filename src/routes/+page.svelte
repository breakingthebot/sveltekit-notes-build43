<!-- src/routes/+page.svelte -->
<!-- Main SvelteKit Notes Vault Page component for Build 43 (Svelte 5 Runes + Markdown + Export + Folders + Favorites + Analytics + Trash Bin + Cmd+K + Revision History). -->
<!-- Connects to: src/routes/+page.server.ts, src/lib/server/notesStore.ts, src/lib/services/markdownService.ts, src/lib/services/exportService.ts, src/lib/services/noteAnalyticsService.ts, src/lib/services/commandPaletteService.ts, src/lib/services/revisionService.ts -->
<!-- Created: 2026-07-25 -->

<script lang="ts">
  import type { PageData } from './$types';
  import type { Note } from '$lib/server/notesStore';
  import { renderMarkdown } from '$lib/services/markdownService';
  import { 
    slugify, 
    generateNoteMarkdown, 
    generateNoteHtml, 
    generateVaultJson, 
    generateVaultMarkdownDump, 
    triggerDownload 
  } from '$lib/services/exportService';
  import { analyzeNoteText } from '$lib/services/noteAnalyticsService';
  import { filterPaletteActions, type PaletteAction } from '$lib/services/commandPaletteService';
  import { 
    getRevisionsForNote, 
    computeTextDiff, 
    type NoteRevision 
  } from '$lib/services/revisionService';
  import {
    getStickyNotes,
    createStickyNote,
    deleteStickyNote,
    toggleStickyPin,
    updateStickyNote,
    type StickyNote
  } from '$lib/services/stickyNotesService';
  import {
    getAvailableThemes,
    getThemeByKey,
    THEMES,
    type ThemeConfig
  } from '$lib/services/themeService';
  import {
    sortNotes,
    getSortOptions,
    SORT_OPTIONS,
    type SortCriteria
  } from '$lib/services/sortingService';
  import {
    encryptNoteText,
    decryptNoteText,
    isEncrypted
  } from '$lib/services/encryptionService';
  import {
    generateNoteSummary,
    type AISummaryResult
  } from '$lib/services/aiSummarizerService';
  import {
    parseMarkdownImport,
    parseJsonVaultImport,
    type ImportedNotePayload
  } from '$lib/services/importService';
  import {
    getShortcutsByCategory,
    isShortcutTriggered
  } from '$lib/services/shortcutService';
  import {
    formatAudioDuration,
    createAudioMemoPayload,
    serializeAudioMemoToMarkdown,
    type AudioMemoPayload
  } from '$lib/services/voiceMemoService';

  let { data }: { data: PageData } = $props();

  let isModalOpen = $state(false);
  let isPaletteOpen = $state(false);
  let isRevisionModalOpen = $state(false);
  let isStickyDrawerOpen = $state(false);
  let isEncryptModalOpen = $state(false);
  let isAISummaryModalOpen = $state(false);
  let isImportModalOpen = $state(false);
  let isShortcutsModalOpen = $state(false);
  let isVoiceModalOpen = $state(false);

  let isRecording = $state(false);
  let recordingTimer = $state(0);
  let recordedMemos = $state<AudioMemoPayload[]>([]);
  let recordingInterval: any = null;
  let activeMediaRecorder: MediaRecorder | null = null;
  let activeAudioChunks: Blob[] = [];

  let groupedShortcuts = $derived(getShortcutsByCategory());

  let importRawInput = $state('');
  let importFileName = $state('notebook-import.md');

  let currentThemeKey = $state('default');
  let currentSort = $state<SortCriteria>('pinned');
  let targetEncryptNote: Note | null = $state(null);
  let encryptPasswordInput = $state('');
  let encryptModalMode = $state<'encrypt' | 'decrypt'>('encrypt');
  let encryptionErrorMessage = $state('');

  let aiTargetNote: Note | null = $state(null);
  let aiSummaryResult: AISummaryResult | null = $state(null);

  let availableThemes = $derived(getAvailableThemes());
  let sortOptionsList = $derived(getSortOptions());
  let displayNotes = $derived(sortNotes(data.notes, currentSort));
  let stickies: StickyNote[] = $state(getStickyNotes());
  let newStickyText = $state('');
  let newStickyColor = $state('#fef08a');

  let paletteQuery = $state('');
  let editingNote: Note | null = $state(null);
  let historyNote: Note | null = $state(null);
  let selectedRevision: NoteRevision | null = $state(null);
  let activeTab: 'edit' | 'preview' = $state('edit');

  let formTitle = $state('');
  let formContent = $state('');
  let formTags = $state('');
  let formFolder = $state('Work');
  let formColor = $state('#06b6d4');

  // Derived live analytics for modal editor
  let modalAnalytics = $derived(analyzeNoteText(formContent));

  // Derived revision history list & diff lines
  let historyRevisions = $derived(historyNote ? getRevisionsForNote(historyNote.id) : []);
  let computedDiffs = $derived(
    historyNote && selectedRevision 
      ? computeTextDiff(selectedRevision.content, historyNote.content) 
      : []
  );

  function selectTheme(key: string) {
    currentThemeKey = key;
    if (typeof document !== 'undefined') {
      if (key === 'default') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.dataset.theme = key;
      }
    }
  }

  // Command palette static + dynamic note actions
  let basePaletteActions: PaletteAction[] = $derived([
    { id: 'act-new', title: '➕ Create New Note', category: 'Actions', icon: '➕', shortcut: 'Ctrl+N', actionKey: 'create_note' },
    { id: 'act-voice', title: '🎙️ Record Voice Audio Memo', category: 'Actions', icon: '🎙️', actionKey: 'voice_memo' },
    { id: 'act-import', title: '📤 Batch Import Notes / Notebook', category: 'Actions', icon: '📤', actionKey: 'import_notes' },
    { id: 'act-json', title: '📥 Export Vault JSON Backup', category: 'Actions', icon: '📥', actionKey: 'export_json' },
    { id: 'act-md', title: '📄 Export All Notes Markdown', category: 'Actions', icon: '📄', actionKey: 'export_md' },
    { id: 'act-fav', title: '⭐ View Starred Favorites', category: 'Filters', icon: '⭐', actionKey: 'filter_fav' },
    { id: 'act-trash', title: '🗑️ Open Trash Bin Recovery', category: 'Filters', icon: '🗑️', actionKey: 'filter_trash' },

    // Theme palette actions
    ...availableThemes.map(t => ({
      id: `thm-${t.key}`,
      title: `🎨 Switch Theme: ${t.name}`,
      category: 'Themes',
      icon: t.icon,
      actionKey: `theme_${t.key}`
    })),

    // Sort palette actions
    ...sortOptionsList.map(s => ({
      id: `srt-${s.key}`,
      title: `📊 Sort Notes: ${s.label}`,
      category: 'Sorting',
      icon: s.icon,
      actionKey: `sort_${s.key}`
    })),

    { id: 'fld-work', title: '💼 Filter Work Folder', category: 'Folders', icon: '💼', actionKey: 'folder_work' },
    { id: 'fld-personal', title: '👤 Filter Personal Folder', category: 'Folders', icon: '👤', actionKey: 'folder_personal' },
    { id: 'fld-ideas', title: '💡 Filter Ideas Folder', category: 'Folders', icon: '💡', actionKey: 'folder_ideas' },
    { id: 'fld-archive', title: '📦 Filter Archive Folder', category: 'Folders', icon: '📦', actionKey: 'folder_archive' },

    ...data.notes.map((n): PaletteAction => ({
      id: `note-${n.id}`,
      title: `Jump to: ${n.title}`,
      category: 'Notes',
      icon: '📝',
      actionKey: 'edit_note',
      noteId: n.id
    }))
  ]);

  let filteredPaletteActions = $derived(filterPaletteActions(basePaletteActions, paletteQuery));

  function handleKeydown(e: KeyboardEvent) {
    // Ignore input focus triggers except Esc
    const targetEl = e.target as HTMLElement;
    const isTyping = targetEl && (targetEl.tagName === 'INPUT' || targetEl.tagName === 'TEXTAREA');

    if (isShortcutTriggered(e, 'Ctrl+K')) {
      e.preventDefault();
      isPaletteOpen = !isPaletteOpen;
    } else if (isShortcutTriggered(e, 'Ctrl+N')) {
      e.preventDefault();
      openCreateModal();
    } else if (isShortcutTriggered(e, 'Shift+S') && !isTyping) {
      e.preventDefault();
      isStickyDrawerOpen = !isStickyDrawerOpen;
    } else if (isShortcutTriggered(e, 'Shift+E') && !isTyping) {
      e.preventDefault();
      exportVaultJsonAction();
    } else if (isShortcutTriggered(e, 'Shift+I') && !isTyping) {
      e.preventDefault();
      openImportModal();
    } else if (isShortcutTriggered(e, '?') && !isTyping) {
      e.preventDefault();
      isShortcutsModalOpen = !isShortcutsModalOpen;
    } else if (isShortcutTriggered(e, 'Esc')) {
      isPaletteOpen = false;
      isModalOpen = false;
      isRevisionModalOpen = false;
      isImportModalOpen = false;
      isShortcutsModalOpen = false;
      isAISummaryModalOpen = false;
      isEncryptModalOpen = false;
    }
  }

  function executePaletteAction(action: PaletteAction) {
    isPaletteOpen = false;
    paletteQuery = '';

    if (action.actionKey === 'create_note') {
      openCreateModal();
    } else if (action.actionKey === 'voice_memo') {
      openVoiceModal();
    } else if (action.actionKey === 'import_notes') {
      openImportModal();
    } else if (action.actionKey === 'export_json') {
      exportVaultJsonAction();
    } else if (action.actionKey === 'export_md') {
      exportVaultMarkdownAction();
    } else if (action.actionKey === 'filter_fav') {
      window.location.href = '?fav=true';
    } else if (action.actionKey === 'filter_trash') {
      window.location.href = '?trash=true';
    } else if (action.actionKey.startsWith('theme_')) {
      const thmKey = action.actionKey.replace('theme_', '');
      selectTheme(thmKey);
    } else if (action.actionKey.startsWith('sort_')) {
      const sKey = action.actionKey.replace('sort_', '') as SortCriteria;
      currentSort = sKey;
    } else if (action.actionKey.startsWith('folder_')) {
      const fName = action.actionKey.replace('folder_', '');
      window.location.href = `?folder=${fName}`;
    } else if (action.actionKey === 'edit_note' && action.noteId) {
      const target = data.notes.find(n => n.id === action.noteId);
      if (target) openEditModal(target);
    }
  }

  function openCreateModal() {
    editingNote = null;
    formTitle = '';
    formContent = '';
    formTags = '';
    formFolder = 'Work';
    formColor = '#06b6d4';
    activeTab = 'edit';
    isModalOpen = true;
  }

  function openEditModal(note: Note) {
    editingNote = note;
    formTitle = note.title;
    formContent = note.content;
    formTags = note.tags.join(', ');
    formFolder = note.folder || 'Work';
    formColor = note.color;
    activeTab = 'edit';
    isModalOpen = true;
  }

  function openHistoryModal(note: Note) {
    historyNote = note;
    const revs = getRevisionsForNote(note.id);
    selectedRevision = revs.length > 0 ? revs[0] : null;
    isRevisionModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
    isRevisionModalOpen = false;
    isEncryptModalOpen = false;
    isAISummaryModalOpen = false;
    isImportModalOpen = false;
    isShortcutsModalOpen = false;
    isVoiceModalOpen = false;
    editingNote = null;
    historyNote = null;
    targetEncryptNote = null;
    aiTargetNote = null;
    aiSummaryResult = null;
    encryptPasswordInput = '';
    encryptionErrorMessage = '';
    importRawInput = '';
    if (isRecording) stopRecording();
  }

  function openVoiceModal() {
    isVoiceModalOpen = true;
  }

  async function startRecording() {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeMediaRecorder = new MediaRecorder(stream);
      activeAudioChunks = [];
      recordingTimer = 0;
      isRecording = true;

      recordingInterval = setInterval(() => {
        recordingTimer += 1;
      }, 1000);

      activeMediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) activeAudioChunks.push(e.data);
      };

      activeMediaRecorder.onstop = () => {
        clearInterval(recordingInterval);
        isRecording = false;

        const audioBlob = new Blob(activeAudioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          const memo = createAudioMemoPayload(base64, recordingTimer);
          recordedMemos = [memo, ...recordedMemos];
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      activeMediaRecorder.start();
    } catch (err) {
      console.error('Microphone access error:', err);
    }
  }

  function stopRecording() {
    if (activeMediaRecorder && activeMediaRecorder.state !== 'inactive') {
      activeMediaRecorder.stop();
    }
  }

  function attachMemoToNote(memo: AudioMemoPayload) {
    const serialized = serializeAudioMemoToMarkdown(memo);
    formContent = formContent ? `${formContent}\n${serialized}` : serialized;
  }

  function attachMemoToSticky(memo: AudioMemoPayload) {
    createStickyNote(`🎙️ ${memo.title} (${memo.durationFormatted})`, '#cff4fc');
    stickies = getStickyNotes();
  }

  function openImportModal() {
    importRawInput = '';
    importFileName = 'notebook-import.md';
    isImportModalOpen = true;
  }

  function handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    importFileName = file.name;
    const reader = new FileReader();
    reader.onload = (event) => {
      importRawInput = event.target?.result as string || '';
    };
    reader.readAsText(file);
  }

  async function executeImportNotes() {
    if (!importRawInput.trim()) return;

    let payloads: ImportedNotePayload[] = [];
    if (importRawInput.trim().startsWith('[') || importRawInput.trim().startsWith('{')) {
      payloads = parseJsonVaultImport(importRawInput);
    } else {
      payloads = [parseMarkdownImport(importRawInput, importFileName)];
    }

    if (payloads.length === 0) return;

    const body = new FormData();
    body.append('notesJson', JSON.stringify(payloads));

    await fetch('?/importNotes', { method: 'POST', body });
    closeModal();
    window.location.reload();
  }

  function openAISummaryModal(note: Note) {
    aiTargetNote = note;
    aiSummaryResult = generateNoteSummary(note.content);
    isAISummaryModalOpen = true;
  }

  async function addSuggestedTagToNote(tag: string) {
    if (!aiTargetNote) return;
    const existingTags = aiTargetNote.tags || [];
    if (existingTags.includes(tag)) return;

    const updatedTags = [...existingTags, tag];

    const body = new FormData();
    body.append('id', aiTargetNote.id);
    body.append('title', aiTargetNote.title);
    body.append('content', aiTargetNote.content);
    body.append('tags', updatedTags.join(', '));
    body.append('folder', aiTargetNote.folder);
    body.append('color', aiTargetNote.color);

    await fetch('?/update', { method: 'POST', body });
    closeModal();
    window.location.reload();
  }

  function openEncryptModal(note: Note) {
    targetEncryptNote = note;
    encryptPasswordInput = '';
    encryptionErrorMessage = '';
    encryptModalMode = isEncrypted(note.content) ? 'decrypt' : 'encrypt';
    isEncryptModalOpen = true;
  }

  async function handleEncryptionSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!targetEncryptNote || !encryptPasswordInput.trim()) return;

    try {
      let newContent = '';
      if (encryptModalMode === 'encrypt') {
        newContent = encryptNoteText(targetEncryptNote.content, encryptPasswordInput.trim());
      } else {
        newContent = decryptNoteText(targetEncryptNote.content, encryptPasswordInput.trim());
      }

      // Submit update form to server action
      const body = new FormData();
      body.append('id', targetEncryptNote.id);
      body.append('title', targetEncryptNote.title);
      body.append('content', newContent);
      body.append('tags', targetEncryptNote.tags.join(', '));
      body.append('folder', targetEncryptNote.folder);
      body.append('color', targetEncryptNote.color);

      await fetch('?/update', { method: 'POST', body });
      closeModal();
      window.location.reload();
    } catch (err: any) {
      encryptionErrorMessage = err?.message || 'Encryption/Decryption error occurred.';
    }
  }

  function insertFormat(prefix: string, suffix: string = '') {
    formContent = `${formContent}${prefix}text${suffix}`;
  }

  function downloadNoteMd(note: Note) {
    const md = generateNoteMarkdown(note);
    const filename = `${slugify(note.title)}.md`;
    triggerDownload(md, filename, 'text/markdown');
  }

  function downloadNoteHtml(note: Note) {
    const bodyHtml = renderMarkdown(note.content);
    const html = generateNoteHtml(note, bodyHtml);
    const filename = `${slugify(note.title)}.html`;
    triggerDownload(html, filename, 'text/html');
  }

  function exportVaultJsonAction() {
    const json = generateVaultJson(data.notes);
    const filename = `notes-vault-backup-${Date.now()}.json`;
    triggerDownload(json, filename, 'application/json');
  }

  function exportVaultMarkdownAction() {
    const dump = generateVaultMarkdownDump(data.notes);
    const filename = `notes-vault-dump-${Date.now()}.md`;
    triggerDownload(dump, filename, 'text/markdown');
  }
  function addSticky() {
    if (!newStickyText.trim()) return;
    createStickyNote(newStickyText, newStickyColor);
    stickies = getStickyNotes();
    newStickyText = '';
  }

  function removeSticky(id: string) {
    deleteStickyNote(id);
    stickies = getStickyNotes();
  }

  function pinSticky(id: string) {
    toggleStickyPin(id);
    stickies = getStickyNotes();
  }

  function handleStickyInput(id: string, text: string) {
    updateStickyNote(id, text);
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
  <title>SvelteKit Notes Vault — Full Stack Notes & Sticky Scratchpad</title>
</svelte:head>

<main class="container">
  <!-- Top Navigation & Brand Header -->
  <header class="app-header card">
    <div class="brand-box">
      <span class="logo-icon">🗂️</span>
      <div>
        <h1 class="app-title">SvelteKit Notes Vault</h1>
        <p class="subtitle">Full-stack server-rendered notes app with Revision History & Sticky Scratchpad</p>
      </div>
    </div>

    <div class="header-actions">
      <button type="button" onclick={() => isStickyDrawerOpen = !isStickyDrawerOpen} class="btn btn-secondary sticky-btn" class:active={isStickyDrawerOpen} title="Toggle Quick Scratchpad Sticky Panel">
        📌 Sticky Pad ({stickies.length})
      </button>
      <button type="button" onclick={openVoiceModal} class="btn btn-secondary voice-btn" title="Record Voice Audio Memo">
        🎙️ Voice Memo
      </button>
      <button type="button" onclick={() => isPaletteOpen = true} class="btn btn-secondary palette-btn" title="Open Quick Action Command Palette">
        ⚡ ⌘K Quick Actions
      </button>
      <button type="button" onclick={() => isShortcutsModalOpen = true} class="btn btn-secondary hotkeys-btn" title="Open Keyboard Shortcuts Cheat Sheet (?)">
        ⌨️ Hotkeys (?)
      </button>
      <button type="button" onclick={openImportModal} class="btn btn-secondary" title="Batch Import Notes / Notebook">
        📤 Import Notes
      </button>
      <button type="button" onclick={exportVaultJsonAction} class="btn btn-secondary" title="Export Vault JSON Backup">
        📥 Export JSON
      </button>
      <button type="button" onclick={openCreateModal} class="btn btn-primary">
        ➕ Create New Note
      </button>
    </div>
  </header>

  <!-- Sticky Notes & Quick Scratchpad Collapsible Drawer Panel -->
  {#if isStickyDrawerOpen}
    <section class="sticky-drawer card fade-in">
      <div class="sticky-drawer-header">
        <h2>📌 Quick Scratchpad & Sticky Notes Panel</h2>
        <div class="sticky-controls">
          <div class="color-picker-mini">
            <button type="button" aria-label="Yellow Sticky Color" onclick={() => newStickyColor = '#fef08a'} class="color-dot" class:active={newStickyColor === '#fef08a'} style="background: #fef08a;"></button>
            <button type="button" aria-label="Green Sticky Color" onclick={() => newStickyColor = '#bbf7d0'} class="color-dot" class:active={newStickyColor === '#bbf7d0'} style="background: #bbf7d0;"></button>
            <button type="button" aria-label="Pink Sticky Color" onclick={() => newStickyColor = '#fbcfe8'} class="color-dot" class:active={newStickyColor === '#fbcfe8'} style="background: #fbcfe8;"></button>
            <button type="button" aria-label="Cyan Sticky Color" onclick={() => newStickyColor = '#cff4fc'} class="color-dot" class:active={newStickyColor === '#cff4fc'} style="background: #cff4fc;"></button>
            <button type="button" aria-label="Purple Sticky Color" onclick={() => newStickyColor = '#e9d5ff'} class="color-dot" class:active={newStickyColor === '#e9d5ff'} style="background: #e9d5ff;"></button>
          </div>
          <button type="button" onclick={() => isStickyDrawerOpen = false} class="close-btn">❌</button>
        </div>
      </div>

      <div class="sticky-input-row">
        <input 
          type="text" 
          bind:value={newStickyText} 
          placeholder="Type a quick thought or reminder..." 
          onkeydown={(e) => e.key === 'Enter' && addSticky()}
          class="sticky-text-input"
        />
        <button type="button" onclick={addSticky} class="btn btn-primary">Add Sticky</button>
      </div>

      <div class="sticky-grid">
        {#each stickies as sticky (sticky.id)}
          <div class="sticky-card" style="background: {sticky.color};">
            <div class="sticky-card-head">
              <button type="button" onclick={() => pinSticky(sticky.id)} class="sticky-pin-btn" title="Toggle Pinned Sticky">
                {sticky.isPinned ? '📌' : '📍'}
              </button>
              <button type="button" onclick={() => removeSticky(sticky.id)} class="sticky-close-btn" title="Delete Sticky">
                ✕
              </button>
            </div>
            <textarea 
              value={sticky.content} 
              oninput={(e) => handleStickyInput(sticky.id, (e.target as HTMLTextAreaElement).value)}
              class="sticky-textarea" 
              rows="3"
            ></textarea>
          </div>
        {:else}
          <div class="muted-text">No sticky notes added yet. Type a thought above!</div>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Category Folders & Favorites & Trash Tab Bar -->
  <section class="folder-bar card">
    <div class="folder-tabs">
      <a 
        href="?folder=all{data.selectedTag && data.selectedTag !== 'all' ? `&tag=${data.selectedTag}` : ''}" 
        class="folder-tab"
        class:active={data.selectedFolder === 'all' && !data.favoriteOnly && !data.showTrash}
      >
        📁 All Notes
      </a>

      <a 
        href="?fav=true{data.selectedTag && data.selectedTag !== 'all' ? `&tag=${data.selectedTag}` : ''}" 
        class="folder-tab fav-tab"
        class:active={data.favoriteOnly && !data.showTrash}
      >
        ⭐ Favorites
      </a>

      {#each data.folders as folder}
        <a 
          href="?folder={folder}{data.selectedTag && data.selectedTag !== 'all' ? `&tag=${data.selectedTag}` : ''}" 
          class="folder-tab"
          class:active={data.selectedFolder === folder && !data.favoriteOnly && !data.showTrash}
        >
          {#if folder === 'Work'}💼{:else if folder === 'Personal'}👤{:else if folder === 'Ideas'}💡{:else if folder === 'Archive'}📦{:else}📂{/if} {folder}
        </a>
      {/each}

      <a 
        href="?trash=true" 
        class="folder-tab trash-tab"
        class:active={data.showTrash}
      >
        🗑️ Trash Bin ({data.trashCount})
      </a>
    </div>
  </section>

  {#if data.showTrash}
    <!-- Trash Bin Active Banner -->
    <section class="trash-banner card">
      <div class="banner-text">
        ⚠️ <strong>Trash Bin Active:</strong> Notes here are soft-deleted and can be restored anytime or permanently purged.
      </div>
      <form method="POST" action="?/emptyTrash">
        <button type="submit" class="btn btn-secondary danger" disabled={data.trashCount === 0}>
          🔥 Empty Trash Bin ({data.trashCount})
        </button>
      </form>
    </section>
  {/if}

  <!-- Filter & Search Toolbar -->
  <section class="toolbar-section card">
    <!-- Tag & Theme Filter Pills -->
    <div class="toolbar-left">
      <div class="theme-switcher-pills">
        <span class="theme-label">🎨 Theme:</span>
        {#each availableThemes as theme}
          <button 
            type="button" 
            onclick={() => selectTheme(theme.key)}
            class="theme-pill"
            class:active={currentThemeKey === theme.key}
            title={theme.description}
          >
            {theme.icon} {theme.name}
          </button>
        {/each}
      </div>

      <div class="sort-switcher-pills">
        <span class="sort-label">📊 Sort By:</span>
        {#each sortOptionsList as opt}
          <button 
            type="button" 
            onclick={() => currentSort = opt.key}
            class="sort-pill"
            class:active={currentSort === opt.key}
            title={opt.description}
          >
            {opt.icon} {opt.label}
          </button>
        {/each}
      </div>

      <div class="tag-filter-pills">
        <a 
          href="?tag=all{data.selectedFolder && data.selectedFolder !== 'all' ? `&folder=${data.selectedFolder}` : ''}{data.showTrash ? '&trash=true' : ''}" 
          class="filter-pill"
          class:active={data.selectedTag === 'all'}
        >
          🌟 All Tags ({data.notes.length})
        </a>

        {#each data.tags as tag}
          <a 
            href="?tag={tag}{data.selectedFolder && data.selectedFolder !== 'all' ? `&folder=${data.selectedFolder}` : ''}{data.showTrash ? '&trash=true' : ''}" 
            class="filter-pill"
            class:active={data.selectedTag === tag}
          >
            🏷️ {tag}
          </a>
        {/each}
      </div>
    </div>

    <!-- Search Form -->
    <form method="GET" class="search-form">
      {#if data.selectedTag && data.selectedTag !== 'all'}
        <input type="hidden" name="tag" value={data.selectedTag} />
      {/if}
      {#if data.selectedFolder && data.selectedFolder !== 'all'}
        <input type="hidden" name="folder" value={data.selectedFolder} />
      {/if}
      {#if data.showTrash}
        <input type="hidden" name="trash" value="true" />
      {/if}
      <input 
        type="text" 
        name="q" 
        value={data.searchQuery}
        placeholder="🔍 Search notes, tags, or folders..." 
        class="search-input"
      />
      <button type="submit" class="btn btn-secondary">Search</button>
    </form>
  </section>

  <!-- Notes Grid Section -->
  <section class="notes-grid">
    {#each displayNotes as note (note.id)}
      {@const analytics = analyzeNoteText(note.content)}
      {@const noteIsEncrypted = isEncrypted(note.content)}
      <article class="note-card card fade-in" style="border-top: 4px solid {note.color};">
        <div class="note-head">
          <div class="title-box">
            <h3 class="note-title">{note.title}</h3>
            <span class="folder-badge">📁 {note.folder}</span>
          </div>
          
          <div class="head-badges">
            {#if noteIsEncrypted}
              <span class="encrypted-badge">🔒 ENCRYPTED</span>
            {/if}
            {#if note.isPinned}
              <span class="pinned-badge">📌 PINNED</span>
            {/if}
          </div>
        </div>

        <!-- Formatted Markdown Content or Encrypted Placeholder -->
        <div class="note-content md-rendered">
          {#if noteIsEncrypted}
            <button type="button" class="encrypted-placeholder" onclick={() => openEncryptModal(note)}>
              <span class="lock-big-icon">🔒</span>
              <strong>Encrypted Note Vault</strong>
              <p>This note content is AES-256 encrypted. Click to unlock with Master Password.</p>
            </button>
          {:else}
            {@html renderMarkdown(note.content)}
          {/if}
        </div>

        <!-- Live Analytics Badge Row -->
        <div class="analytics-badges-row">
          <span class="analytics-chip" title="Estimated Reading Time">⏱️ {analytics.readingTimeText}</span>
          <span class="analytics-chip" title="Word Count">📝 {analytics.wordCount} words</span>
          <span class="analytics-chip sentiment-chip sentiment-{analytics.sentiment.toLowerCase()}" title="Sentiment Valence Score">
            {analytics.sentimentEmoji} {analytics.sentiment}
          </span>
        </div>

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
            {#if data.showTrash}
              <!-- Restore Form Action -->
              <form method="POST" action="?/restore">
                <input type="hidden" name="id" value={note.id} />
                <button type="submit" class="icon-btn" title="Restore Note to Active Notebook">
                  ↩️ Restore
                </button>
              </form>

              <!-- Permanent Purge Form Action -->
              <form method="POST" action="?/purge">
                <input type="hidden" name="id" value={note.id} />
                <button type="submit" class="icon-btn danger" title="Permanently Delete Note">
                  🔥 Purge
                </button>
              </form>
            {:else}
              <!-- AI Summarize Button -->
              <button type="button" onclick={() => openAISummaryModal(note)} class="icon-btn ai-btn" title="Generate AI Summary & Smart Tag Suggestions">
                🤖 AI
              </button>

              <!-- Lock / Unlock Encryption Button -->
              <button type="button" onclick={() => openEncryptModal(note)} class="icon-btn lock-btn" title={noteIsEncrypted ? 'Unlock / Decrypt Note' : 'Lock / Encrypt Note'}>
                {noteIsEncrypted ? '🔓 Unlock' : '🔒 Lock'}
              </button>

              <!-- Favorite Star Form Action -->
              <form method="POST" action="?/toggleFavorite">
                <input type="hidden" name="id" value={note.id} />
                <button type="submit" class="icon-btn fav-btn" title={note.isFavorite ? 'Remove Favorite' : 'Star Favorite'}>
                  {note.isFavorite ? '⭐' : '☆'}
                </button>
              </form>

              <!-- Revision History Button -->
              <button type="button" onclick={() => openHistoryModal(note)} class="icon-btn" title="View Note Revision History">
                📜
              </button>

              <!-- Download Single Note Buttons -->
              <button type="button" onclick={() => downloadNoteMd(note)} class="icon-btn" title="Download .md Markdown file">
                📥 .md
              </button>
              <button type="button" onclick={() => downloadNoteHtml(note)} class="icon-btn" title="Download .html webpage">
                📄 .html
              </button>

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

              <!-- Soft Delete Form Action -->
              <form method="POST" action="?/delete">
                <input type="hidden" name="id" value={note.id} />
                <button type="submit" class="icon-btn danger" title="Move to Trash Bin">
                  🗑️
                </button>
              </form>
            {/if}
          </div>
        </div>
      </article>
    {:else}
      <div class="empty-state card">
        📭 <strong>{data.showTrash ? 'Trash Bin is empty' : 'No notes found'}</strong>
        <p>{data.showTrash ? 'There are no soft-deleted notes in the trash bin.' : 'No notes match your current filter or search query. Click ➕ Create New Note above to add one!'}</p>
      </div>
    {/each}
  </section>
</main>

<!-- Revision History & Line Diff Viewer Modal -->
{#if isRevisionModalOpen && historyNote}
  <div class="modal-backdrop fade-in">
    <div class="history-card card">
      <div class="modal-header">
        <h2>📜 Revision History: {historyNote.title}</h2>
        <button type="button" onclick={closeModal} class="close-btn">❌</button>
      </div>

      <div class="history-body">
        <!-- Revisions Timeline List (Left Pane) -->
        <div class="history-timeline">
          <h3>Revisions Snapshots</h3>
          {#each historyRevisions as rev (rev.id)}
            <button 
              type="button" 
              onclick={() => selectedRevision = rev}
              class="timeline-item"
              class:active={selectedRevision?.id === rev.id}
            >
              <span class="rev-summary">{rev.changeSummary}</span>
              <span class="rev-time">{new Date(rev.timestamp).toLocaleTimeString()}</span>
            </button>
          {:else}
            <div class="muted-text">No prior revisions recorded yet. Edit note to create snapshots!</div>
          {/each}
        </div>

        <!-- Diff Viewer (Right Pane) -->
        <div class="history-diff-pane">
          <div class="diff-header">
            <h3>Line-by-Line Diff Viewer</h3>
            {#if selectedRevision}
              <form method="POST" action="?/revertRevision" onsubmit={closeModal}>
                <input type="hidden" name="revId" value={selectedRevision.id} />
                <button type="submit" class="btn btn-secondary">↩️ Revert to this Version</button>
              </form>
            {/if}
          </div>

          <div class="diff-box card">
            {#if selectedRevision}
              {#each computedDiffs as line}
                <div class="diff-line diff-{line.type}">
                  <span class="diff-prefix">{line.type === 'added' ? '+' : line.type === 'deleted' ? '-' : ' '}</span>
                  <span class="diff-text">{line.text}</span>
                </div>
              {/each}
            {:else}
              <div class="muted-text">Select a revision on the left timeline to view line diffs...</div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Cmd+K Quick Action Command Palette Modal -->
{#if isPaletteOpen}
  <div class="modal-backdrop fade-in">
    <div class="palette-card card">
      <div class="palette-header">
        <span class="palette-icon">⚡</span>
        <input 
          type="text" 
          bind:value={paletteQuery} 
          placeholder="Type a command or search notes... (Press Esc to close)"
          class="palette-input"
        />
        <button type="button" onclick={() => isPaletteOpen = false} class="close-btn">❌</button>
      </div>

      <div class="palette-list">
        {#each filteredPaletteActions as action (action.id)}
          <button type="button" onclick={() => executePaletteAction(action)} class="palette-item">
            <span class="item-icon">{action.icon}</span>
            <span class="item-title">{action.title}</span>
            {#if action.shortcut}
              <kbd class="shortcut-kbd">{action.shortcut}</kbd>
            {/if}
          </button>
        {:else}
          <div class="palette-empty">No matching commands found.</div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<!-- Create / Edit Modal with Markdown Live Preview Tabs & Live Analytics Bar -->
{#if isModalOpen}
  <div class="modal-backdrop fade-in">
    <div class="modal-card card">
      <div class="modal-header">
        <h2>{editingNote ? '✏️ Edit Note' : '➕ Create New Note'}</h2>
        <button type="button" onclick={closeModal} class="close-btn">❌</button>
      </div>

      <!-- Mode Tab Selector -->
      <div class="tab-selector">
        <button 
          type="button" 
          onclick={() => activeTab = 'edit'} 
          class="tab-btn" 
          class:active={activeTab === 'edit'}
        >
          ✍️ Raw Editor
        </button>
        <button 
          type="button" 
          onclick={() => activeTab = 'preview'} 
          class="tab-btn" 
          class:active={activeTab === 'preview'}
        >
          👁️ Live Markdown Preview
        </button>
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
          <label for="note-folder-select">Category Folder</label>
          <select id="note-folder-select" name="folder" bind:value={formFolder} class="form-input">
            {#each data.folders as f}
              <option value={f}>{f}</option>
            {/each}
          </select>
        </div>

        {#if activeTab === 'edit'}
          <div class="form-group">
            <div class="editor-label-bar">
              <label for="note-content-input">Content (Markdown Supported)</label>

              <!-- Markdown Format Toolbar Buttons -->
              <div class="md-toolbar">
                <button type="button" onclick={() => insertFormat('**', '**')} class="md-tool-btn" title="Bold"><strong>B</strong></button>
                <button type="button" onclick={() => insertFormat('*', '*')} class="md-tool-btn" title="Italic"><em>I</em></button>
                <button type="button" onclick={() => insertFormat('### ')} class="md-tool-btn" title="Heading 3">H3</button>
                <button type="button" onclick={() => insertFormat('`', '`')} class="md-tool-btn" title="Inline Code"><code>code</code></button>
                <button type="button" onclick={() => insertFormat('```ts\n', '\n```')} class="md-tool-btn" title="Code Block">```</button>
                <button type="button" onclick={() => insertFormat('> ')} class="md-tool-btn" title="Blockquote">”</button>
                <button type="button" onclick={() => insertFormat('- ')} class="md-tool-btn" title="Bullet List">• List</button>
                <button type="button" onclick={() => insertFormat('- [ ] ')} class="md-tool-btn" title="Task Checklist">☑️ Task</button>
                <button type="button" onclick={() => insertFormat('| Task | Status |\n| --- | --- |\n| ', ' | Done |')} class="md-tool-btn" title="Markdown Table">📊 Table</button>
              </div>
            </div>

            <textarea 
              id="note-content-input" 
              name="content" 
              bind:value={formContent} 
              placeholder="Write your note in Markdown..." 
              rows="6" 
              required 
              class="form-textarea"
            ></textarea>
          </div>
        {:else}
          <div class="form-group">
            <span class="preview-label">Live Preview Render:</span>
            <div class="live-preview-box card md-rendered">
              {#if formContent.trim()}
                {@html renderMarkdown(formContent)}
              {:else}
                <span class="muted-text">Type content in Raw Editor tab to preview markdown formatting...</span>
              {/if}
            </div>
            <!-- Hidden Input to preserve content when submitting from Preview tab -->
            <input type="hidden" name="content" value={formContent} />
          </div>
        {/if}

        <!-- Live Typing Analytics Bar inside Modal -->
        <div class="modal-analytics-bar card">
          <span>📝 <strong>{modalAnalytics.wordCount}</strong> words</span>
          <span>🔤 <strong>{modalAnalytics.charCountWithSpaces}</strong> chars</span>
          <span>⏱️ <strong>{modalAnalytics.readingTimeText}</strong></span>
          <span class="sentiment-tag sentiment-{modalAnalytics.sentiment.toLowerCase()}">
            {modalAnalytics.sentimentEmoji} {modalAnalytics.sentiment}
          </span>
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
            <button type="button" aria-label="Cyan Color Accent" onclick={() => formColor = '#06b6d4'} class="color-pill" class:active={formColor === '#06b6d4'} style="background: #06b6d4;"></button>
            <button type="button" aria-label="Emerald Color Accent" onclick={() => formColor = '#10b981'} class="color-pill" class:active={formColor === '#10b981'} style="background: #10b981;"></button>
            <button type="button" aria-label="Purple Color Accent" onclick={() => formColor = '#a855f7'} class="color-pill" class:active={formColor === '#a855f7'} style="background: #a855f7;"></button>
            <button type="button" aria-label="Amber Color Accent" onclick={() => formColor = '#f59e0b'} class="color-pill" class:active={formColor === '#f59e0b'} style="background: #f59e0b;"></button>
            <button type="button" aria-label="Pink Color Accent" onclick={() => formColor = '#ec4899'} class="color-pill" class:active={formColor === '#ec4899'} style="background: #ec4899;"></button>
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

<!-- AES-256 Client-Side Encryption & Decryption Master Password Modal -->
{#if isEncryptModalOpen && targetEncryptNote}
  <div class="modal-backdrop fade-in">
    <div class="modal-card card">
      <div class="modal-header">
        <h2>{encryptModalMode === 'encrypt' ? '🔒 AES-256 Lock Note' : '🔓 Unlock Encrypted Note'}</h2>
        <button type="button" onclick={closeModal} class="close-btn">❌</button>
      </div>

      <form onsubmit={handleEncryptionSubmit} class="modal-form">
        <p class="subtitle">
          {encryptModalMode === 'encrypt'
            ? `Encrypting content for note: "${targetEncryptNote.title}". Enter a Master Password to lock.`
            : `Decrypting content for note: "${targetEncryptNote.title}". Enter Master Password to unlock.`}
        </p>

        {#if encryptionErrorMessage}
          <div class="alert-error-box card">
            ⚠️ <strong>Error:</strong> {encryptionErrorMessage}
          </div>
        {/if}

        <div class="form-group">
          <label for="encrypt-pass-input">Master Password</label>
          <input 
            id="encrypt-pass-input" 
            type="password" 
            bind:value={encryptPasswordInput} 
            placeholder="Enter Master Password..." 
            required 
            class="form-input"
          />
        </div>

        <div class="modal-actions">
          <button type="button" onclick={closeModal} class="btn btn-secondary">Cancel</button>
          <button type="submit" class="btn btn-primary">
            {encryptModalMode === 'encrypt' ? '🔒 Lock Note' : '🔓 Unlock Note'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- AI Note Summarization & Smart Tag Recommendation Modal -->
{#if isAISummaryModalOpen && aiTargetNote && aiSummaryResult}
  <div class="modal-backdrop fade-in">
    <div class="modal-card card ai-summary-card">
      <div class="modal-header">
        <h2>🤖 AI Executive Note Summary</h2>
        <button type="button" onclick={closeModal} class="close-btn">❌</button>
      </div>

      <div class="ai-summary-body">
        <div class="ai-meta-row">
          <span class="ai-target-title">📝 {aiTargetNote.title}</span>
          <span class="complexity-badge complexity-{aiSummaryResult.readingComplexity.toLowerCase()}">
            📊 Complexity: {aiSummaryResult.readingComplexity}
          </span>
        </div>

        <div class="ai-section card">
          <h3>📌 Executive Summary</h3>
          <p>{aiSummaryResult.summary}</p>
        </div>

        <div class="ai-section card">
          <h3>⚡ Key Highlights & Bullet Points</h3>
          <ul class="ai-bullets">
            {#each aiSummaryResult.keyBulletPoints as bullet}
              <li>{bullet}</li>
            {/each}
          </ul>
        </div>

        <div class="ai-section card">
          <h3>🏷️ Smart Recommended Tags (Click to Add)</h3>
          <div class="ai-suggested-tags">
            {#each aiSummaryResult.suggestedTags as tag}
              <button 
                type="button" 
                onclick={() => addSuggestedTagToNote(tag)}
                class="ai-tag-btn"
                title="Click to add #{tag} tag to this note"
              >
                + #{tag}
              </button>
            {/each}
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" onclick={closeModal} class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Batch Notebook & Markdown Import Modal -->
{#if isImportModalOpen}
  <div class="modal-backdrop fade-in">
    <div class="modal-card card import-card">
      <div class="modal-header">
        <h2>📤 Batch Import Notes & Notebook Vault</h2>
        <button type="button" onclick={closeModal} class="close-btn">❌</button>
      </div>

      <div class="import-body">
        <p class="subtitle">
          Import Markdown files (`.md`), Notion/Evernote text exports, or JSON Vault Backups (`.json`).
        </p>

        <div class="form-group">
          <label for="import-file-input">📁 Upload File (.md, .txt, .json)</label>
          <input 
            id="import-file-input"
            type="file" 
            accept=".md,.txt,.json" 
            onchange={handleFileUpload} 
            class="form-input file-input"
          />
        </div>

        <div class="form-group">
          <label for="import-raw-input">📝 Or Paste Raw Markdown / JSON Content</label>
          <textarea 
            id="import-raw-input"
            bind:value={importRawInput} 
            placeholder="Paste your Markdown note with H1 or YAML frontmatter, or JSON vault array..."
            rows="8"
            class="form-textarea"
          ></textarea>
        </div>

        <div class="modal-actions">
          <button type="button" onclick={closeModal} class="btn btn-secondary">Cancel</button>
          <button type="button" onclick={executeImportNotes} class="btn btn-primary" disabled={!importRawInput.trim()}>
            📤 Import to Notebook
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Keyboard Shortcuts Cheat Sheet Modal -->
{#if isShortcutsModalOpen}
  <div class="modal-backdrop fade-in">
    <div class="modal-card card shortcuts-card">
      <div class="modal-header">
        <h2>⌨️ Keyboard Shortcuts Cheat Sheet</h2>
        <button type="button" onclick={closeModal} class="close-btn">❌</button>
      </div>

      <div class="shortcuts-body">
        {#each Object.entries(groupedShortcuts) as [category, items]}
          <div class="shortcuts-group">
            <h3>{category} Shortcuts</h3>
            <div class="shortcuts-list">
              {#each items as item}
                <div class="shortcut-row">
                  <div class="shortcut-info">
                    <strong>{item.label}</strong>
                    <span>{item.description}</span>
                  </div>
                  <kbd class="shortcut-kbd-big">{item.key}</kbd>
                </div>
              {/each}
            </div>
          </div>
        {/each}

        <div class="modal-actions">
          <button type="button" onclick={closeModal} class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Voice Memo Recording Scratchpad Modal -->
{#if isVoiceModalOpen}
  <div class="modal-backdrop fade-in">
    <div class="modal-card card voice-modal-card">
      <div class="modal-header">
        <h2>🎙️ Voice Memo Audio Scratchpad</h2>
        <button type="button" onclick={closeModal} class="close-btn">❌</button>
      </div>

      <div class="voice-modal-body">
        <!-- Live Recording Console -->
        <div class="voice-console card" class:recording-active={isRecording}>
          {#if isRecording}
            <div class="recording-indicator blink-pulse">
              <span class="red-dot">🔴</span>
              <strong>Recording Audio... ({formatAudioDuration(recordingTimer)})</strong>
            </div>
            <button type="button" onclick={stopRecording} class="btn btn-secondary danger">
              ⏹️ Stop Recording
            </button>
          {:else}
            <p class="subtitle">Record hands-free audio notes directly from your microphone.</p>
            <button type="button" onclick={startRecording} class="btn btn-primary record-start-btn">
              🎙️ Start New Voice Recording
            </button>
          {/if}
        </div>

        <!-- Recorded Audio Memos List -->
        <div class="voice-memos-section">
          <h3>📻 Recorded Voice Memos ({recordedMemos.length})</h3>
          <div class="voice-memos-list">
            {#each recordedMemos as memo (memo.id)}
              <div class="voice-memo-card card">
                <div class="memo-head">
                  <strong>🎙️ {memo.title}</strong>
                  <span class="memo-time">⏱️ {memo.durationFormatted}</span>
                </div>
                <audio controls src={memo.audioBase64} class="audio-player"></audio>
                <div class="memo-actions">
                  <button type="button" onclick={() => attachMemoToSticky(memo)} class="btn btn-secondary btn-sm">
                    📌 Attach to Sticky Pad
                  </button>
                  <button type="button" onclick={() => { openCreateModal(); attachMemoToNote(memo); }} class="btn btn-secondary btn-sm">
                    ➕ Create Note from Voice Memo
                  </button>
                </div>
              </div>
            {:else}
              <div class="muted-text">No audio memos recorded yet in this session. Click Start Recording above!</div>
            {/each}
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" onclick={closeModal} class="btn btn-secondary">Close</button>
        </div>
      </div>
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

  .header-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .palette-btn {
    border-color: var(--accent-cyan);
    color: var(--accent-cyan);
  }

  .folder-bar {
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.25);
  }

  .folder-tabs {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .folder-tab {
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 700;
    padding: 6px 14px;
    border-radius: var(--radius-sm);
    text-decoration: none;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border-color);
    transition: all 0.2s ease;
  }

  .folder-tab.active, .folder-tab:hover {
    background: rgba(6, 182, 212, 0.15);
    color: var(--accent-cyan);
    border-color: var(--accent-cyan);
  }

  .folder-tab.fav-tab.active {
    background: rgba(245, 158, 11, 0.15);
    color: var(--accent-amber);
    border-color: var(--accent-amber);
  }

  .folder-tab.trash-tab.active {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border-color: #ef4444;
  }

  .trash-banner {
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
    font-size: 13px;
    color: #fca5a5;
  }

  .btn.danger { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border-color: rgba(239, 68, 68, 0.4); }
  .btn.danger:hover { background: rgba(239, 68, 68, 0.4); }

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

  .title-box {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .note-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .folder-badge {
    font-size: 10px;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .head-badges {
    display: flex;
    gap: 4px;
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
    flex: 1;
  }

  .analytics-badges-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    padding-top: 6px;
  }

  .analytics-chip {
    font-size: 10px;
    font-weight: 700;
    color: var(--text-muted);
    background: rgba(255, 255, 255, 0.04);
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid var(--border-color);
  }

  .sentiment-chip.sentiment-positive { color: var(--accent-emerald); background: rgba(16, 185, 129, 0.1); }
  .sentiment-chip.sentiment-negative { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

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
    gap: 4px;
    flex-wrap: wrap;
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

  .icon-btn.fav-btn:hover {
    color: var(--accent-amber);
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

  .history-card {
    width: 100%;
    max-width: 800px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .history-body {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 20px;
    min-height: 300px;
  }

  .history-timeline {
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-right: 1px solid var(--border-color);
    padding-right: 16px;
  }

  .history-timeline h3, .diff-header h3 {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .timeline-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    cursor: pointer;
    text-align: left;
  }

  .timeline-item.active {
    border-color: var(--accent-cyan);
    background: rgba(6, 182, 212, 0.15);
    color: #fff;
  }

  .rev-summary { font-size: 12px; font-weight: 700; }
  .rev-time { font-size: 10px; color: var(--text-muted); }

  .history-diff-pane {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .diff-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .diff-box {
    padding: 12px;
    background: rgba(0, 0, 0, 0.4);
    font-family: monospace;
    font-size: 13px;
    min-height: 220px;
    max-height: 350px;
    overflow-y: auto;
  }

  .diff-line { display: flex; gap: 8px; padding: 2px 4px; }
  .diff-line.diff-added { background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); }
  .diff-line.diff-deleted { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
  .diff-prefix { width: 12px; font-weight: 800; }

  .palette-card {
    width: 100%;
    max-width: 500px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .palette-header {
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 10px;
  }

  .palette-icon { font-size: 20px; }

  .palette-input {
    flex: 1;
    background: transparent;
    border: none;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    outline: none;
  }

  .palette-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 320px;
    overflow-y: auto;
  }

  .palette-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    font-size: 13px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .palette-item:hover {
    background: rgba(6, 182, 212, 0.15);
    border-color: var(--accent-cyan);
    color: #fff;
  }

  .item-icon { font-size: 16px; }
  .item-title { flex: 1; }

  .shortcut-kbd {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 10px;
    color: var(--text-muted);
  }

  .palette-empty {
    padding: 20px;
    text-align: center;
    color: var(--text-muted);
    font-size: 13px;
  }

  .modal-card {
    width: 100%;
    max-width: 550px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-header h2 { font-size: 18px; font-weight: 800; }
  .close-btn { background: none; border: none; font-size: 16px; cursor: pointer; color: var(--text-muted); }

  .tab-selector {
    display: flex;
    gap: 8px;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 8px;
  }

  .tab-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 13px;
    font-weight: 700;
    padding: 4px 12px;
    cursor: pointer;
    border-radius: var(--radius-sm);
  }

  .tab-btn.active {
    background: rgba(6, 182, 212, 0.15);
    color: var(--accent-cyan);
  }

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

  .editor-label-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .md-toolbar {
    display: flex;
    gap: 4px;
  }

  .md-tool-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    cursor: pointer;
  }

  .md-tool-btn:hover { background: rgba(255, 255, 255, 0.15); }

  .form-group label, .preview-label { font-size: 12px; font-weight: 700; color: var(--text-secondary); }

  .form-input, .form-textarea {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    color: #fff;
    font-size: 14px;
    padding: 8px 12px;
    font-family: var(--font-sans);
  }

  .live-preview-box {
    padding: 14px;
    background: rgba(0, 0, 0, 0.4);
    min-height: 140px;
    max-height: 250px;
    overflow-y: auto;
  }

  .modal-analytics-bar {
    padding: 8px 14px;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: var(--text-secondary);
  }

  .sentiment-tag.sentiment-positive { color: var(--accent-emerald); }
  .sentiment-tag.sentiment-negative { color: #ef4444; }

  .muted-text { font-size: 13px; color: var(--text-muted); font-style: italic; }

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

  /* Sticky Pad Drawer Styles */
  .sticky-btn.active {
    background: rgba(245, 158, 11, 0.2);
    color: var(--accent-amber);
    border-color: var(--accent-amber);
  }

  .sticky-drawer {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: rgba(15, 23, 42, 0.95);
    border-color: rgba(245, 158, 11, 0.4);
  }

  .sticky-drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sticky-drawer-header h2 {
    font-size: 16px;
    font-weight: 800;
    color: var(--text-primary);
  }

  .sticky-controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .color-picker-mini {
    display: flex;
    gap: 6px;
  }

  .color-dot {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
  }

  .color-dot.active {
    border-color: #000;
    transform: scale(1.2);
  }

  .sticky-input-row {
    display: flex;
    gap: 10px;
  }

  .sticky-text-input {
    flex: 1;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    color: #fff;
    font-size: 13px;
    padding: 8px 12px;
  }

  .sticky-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 14px;
    padding-top: 4px;
  }

  .sticky-card {
    padding: 12px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    color: #1e293b;
  }

  .sticky-card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sticky-pin-btn, .sticky-close-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 12px;
    font-weight: 800;
    color: #334155;
  }

  .sticky-close-btn:hover { color: #ef4444; }

  .sticky-textarea {
    background: transparent;
    border: none;
    outline: none;
    resize: none;
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
    line-height: 1.4;
  }

  /* Theme Switcher Styles */
  .toolbar-left {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .theme-switcher-pills {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .theme-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-secondary);
    margin-right: 4px;
  }

  .theme-pill {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .theme-pill.active, .theme-pill:hover {
    background: rgba(6, 182, 212, 0.2);
    color: var(--accent-cyan);
    border-color: var(--accent-cyan);
  }

  /* Sort Switcher Styles */
  .sort-switcher-pills {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .sort-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-secondary);
    margin-right: 4px;
  }

  .sort-pill {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .sort-pill.active, .sort-pill:hover {
    background: rgba(168, 85, 247, 0.2);
    color: var(--accent-purple);
    border-color: var(--accent-purple);
  }

  /* AES-256 Encryption UI Styles */
  .encrypted-badge {
    font-size: 10px;
    font-weight: 800;
    color: #ef4444;
    background: rgba(239, 68, 68, 0.15);
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .encrypted-placeholder {
    padding: 20px;
    background: rgba(239, 68, 68, 0.08);
    border: 1px dashed rgba(239, 68, 68, 0.3);
    border-radius: var(--radius-sm);
    text-align: center;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
  }

  .encrypted-placeholder:hover {
    background: rgba(239, 68, 68, 0.18);
    border-color: rgba(239, 68, 68, 0.6);
  }

  .lock-big-icon {
    font-size: 24px;
  }

  .encrypted-placeholder strong {
    font-size: 13px;
    color: #fca5a5;
  }

  .encrypted-placeholder p {
    font-size: 11px;
    color: var(--text-muted);
  }

  .alert-error-box {
    padding: 10px 14px;
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.4);
    color: #fca5a5;
    font-size: 12px;
  }

  .icon-btn.lock-btn:hover {
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.4);
  }

  /* AI Summarizer UI Styles */
  .icon-btn.ai-btn {
    background: rgba(168, 85, 247, 0.15);
    color: var(--accent-purple);
    border-color: rgba(168, 85, 247, 0.3);
    font-weight: 700;
  }

  .icon-btn.ai-btn:hover {
    background: rgba(168, 85, 247, 0.3);
  }

  .ai-summary-card {
    max-width: 600px;
  }

  .ai-summary-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .ai-meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-color);
  }

  .ai-target-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .complexity-badge {
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 12px;
    border: 1px solid var(--border-color);
  }

  .complexity-simple { color: var(--accent-emerald); background: rgba(16, 185, 129, 0.1); }
  .complexity-moderate { color: var(--accent-amber); background: rgba(245, 158, 11, 0.1); }
  .complexity-advanced { color: var(--accent-purple); background: rgba(168, 85, 247, 0.1); }

  .ai-section {
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    background: rgba(0, 0, 0, 0.3);
  }

  .ai-section h3 {
    font-size: 13px;
    font-weight: 700;
    color: var(--accent-cyan);
  }

  .ai-section p {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .ai-bullets {
    padding-left: 18px;
    font-size: 13px;
    color: var(--text-secondary);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .ai-suggested-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .ai-tag-btn {
    background: rgba(6, 182, 212, 0.15);
    border: 1px solid var(--accent-cyan);
    color: var(--accent-cyan);
    font-size: 12px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .ai-tag-btn:hover {
    background: var(--accent-cyan);
    color: #000;
  }

  /* Notebook Import UI Styles */
  .import-card {
    max-width: 600px;
  }

  .import-body {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .file-input {
    padding: 6px;
    cursor: pointer;
    font-size: 13px;
  }

  /* Keyboard Shortcuts Cheat Sheet UI Styles */
  .shortcuts-card {
    max-width: 650px;
  }

  .shortcuts-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .shortcuts-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .shortcuts-group h3 {
    font-size: 13px;
    font-weight: 700;
    color: var(--accent-cyan);
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 4px;
  }

  .shortcuts-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .shortcut-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
  }

  .shortcut-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .shortcut-info strong {
    font-size: 13px;
    color: var(--text-primary);
  }

  .shortcut-info span {
    font-size: 11px;
    color: var(--text-muted);
  }

  .shortcut-kbd-big {
    background: rgba(6, 182, 212, 0.15);
    border: 1px solid var(--accent-cyan);
    color: var(--accent-cyan);
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 6px;
  }

  /* Voice Memo Modal UI Styles */
  .voice-modal-card {
    max-width: 600px;
  }

  .voice-modal-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .voice-console {
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px dashed var(--border-color);
  }

  .voice-console.recording-active {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.4);
  }

  .recording-indicator {
    font-size: 15px;
    color: #fca5a5;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .blink-pulse {
    animation: blinkPulse 1.2s infinite ease-in-out;
  }

  @keyframes blinkPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .voice-memos-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .voice-memos-section h3 {
    font-size: 14px;
    font-weight: 700;
    color: var(--accent-cyan);
  }

  .voice-memos-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 240px;
    overflow-y: auto;
  }

  .voice-memo-card {
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: rgba(0, 0, 0, 0.4);
  }

  .memo-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
  }

  .memo-time {
    font-size: 11px;
    color: var(--text-muted);
  }

  .audio-player {
    width: 100%;
    height: 36px;
    border-radius: var(--radius-sm);
  }

  .memo-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .btn-sm {
    font-size: 11px;
    padding: 4px 8px;
  }
</style>
