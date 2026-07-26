# Changelog

All notable changes to **SvelteKit Notes Vault** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.10.0] - 2026-07-26

### Added
- Integrated **Custom Visual Themes & Dark Glassmorphic Theme Switcher** in `src/lib/services/themeService.ts`, `src/app.css`, and `src/routes/+page.svelte`.
- Added 5 theme presets (`Cyan Glassmorphic`, `Cyberpunk Neon`, `Emerald Forest`, `Midnight OLED`, `Sunset Amber`).
- Added CSS dataset variable overrides (`[data-theme="..."]`) in `src/app.css` for dynamic theme changes.
- Added `🎨 Theme` selector pill bar in main notebook toolbar and Command Palette theme switching triggers (`⚡ ⌘K -> 🎨 Switch Theme`).
- Added unit tests in `src/lib/services/themeService.spec.ts`.

## [0.9.0] - 2026-07-26

### Added
- Integrated **Pinned Note Quick Access Sidebar & Sticky Notes Scratchpad View** in `src/lib/services/stickyNotesService.ts` and `src/routes/+page.svelte`.
- Added sticky note data model supporting custom color accents (Yellow, Green, Pink, Cyan, Purple), inline real-time editing, 1-click pin toggling (`📌` / `📍`), and instant deletion.
- Added `📌 Sticky Pad ({count})` header action button to toggle the collapsible quick scratchpad drawer.
- Added unit tests in `src/lib/services/stickyNotesService.spec.ts`.

## [0.8.0] - 2026-07-25

### Added
- Integrated **Note Version History & Revision Diff Viewer** in `src/lib/services/revisionService.ts`, `src/routes/+page.server.ts`, and `src/routes/+page.svelte`.
- Added automatic revision snapshot recording on note creation and content updates.
- Added Revision History modal with left-hand timeline list and right-hand line-by-line Diff Viewer (`+` green additions vs `-` red deletions).
- Added `↩️ Revert to this Version` Form Action (`?/revertRevision`).
- Added unit tests in `src/lib/services/revisionService.spec.ts`.

## [0.7.0] - 2026-07-25

### Added
- Integrated **Keyboard Shortcuts & Quick Action Command Palette** in `src/lib/services/commandPaletteService.ts` and `src/routes/+page.svelte`.
- Added global hotkey listener `Ctrl+K` / `Cmd+K` for command palette toggling, `Ctrl+N` for new note creation, and `Esc` for modal dismissal.
- Added header command palette trigger button (`⚡ ⌘K Quick Actions`).
- Added real-time quick jump search for notes, backup export triggers, and folder filter shortcuts.
- Added unit tests in `src/lib/services/commandPaletteService.spec.ts`.

## [0.6.0] - 2026-07-25

### Added
- Integrated **Trash Bin & Soft Delete Recovery System** in `src/lib/server/notesStore.ts`, `src/routes/+page.server.ts`, and `src/routes/+page.svelte`.
- Added Trash Bin tab (`🗑️ Trash Bin ({trashCount})`) in folder bar.
- Added Trash Bin active banner with `🔥 Empty Trash Bin` batch action.
- Added 1-Click `↩️ Restore` and `🔥 Purge` card action forms for soft-deleted notes.
- Added unit tests in `src/lib/server/notesStore.spec.ts`.

## [0.5.0] - 2026-07-25

### Added
- Integrated **Word Count, Reading Time & Sentiment Analytics per Note** in `src/lib/services/noteAnalyticsService.ts` and `src/routes/+page.svelte`.
- Added Live Analytics Badges row on note cards (`⏱️ Reading Time`, `📝 Word Count`, `😊 Sentiment Valence`).
- Added real-time typing analytics bar inside the Note Modal editor (`Words`, `Chars`, `Reading Time`, `Sentiment`).
- Added unit tests in `src/lib/services/noteAnalyticsService.spec.ts`.

## [0.4.0] - 2026-07-25

### Added
- Integrated **Favorite / Starred Notes & Custom Category Folders** in `src/lib/server/notesStore.ts` and `src/routes/+page.svelte`.
- Added Category Folder Tab Bar (`📁 All Notes`, `⭐ Favorites`, `💼 Work`, `👤 Personal`, `💡 Ideas`, `📦 Archive`).
- Added 1-Click `⭐` / `☆` Favorite Star toggle form actions (`?/toggleFavorite`).
- Added folder assignment dropdown selector in the Note Modal editor and folder query filtering.
- Added unit tests in `src/lib/server/notesStore.spec.ts`.

## [0.3.0] - 2026-07-25

### Added
- Integrated **Note Export & Download Engine (PDF, Markdown, JSON Backup)** in `src/lib/services/exportService.ts` and `src/routes/+page.svelte`.
- Added single-note `.md` Markdown export with frontmatter metadata (`title`, `tags`, `createdAt`, `updatedAt`).
- Added single-note standalone `.html` web document exporter.
- Added full notebook vault backup exporter in `.json` format and combined `.md` dump.
- Added unit tests in `src/lib/services/exportService.spec.ts`.

## [0.2.0] - 2026-07-25

### Added
- Integrated **Markdown Formatting & Live Rich Preview Engine** in `src/lib/services/markdownService.ts` and `src/routes/+page.svelte`.
- Added Markdown parser supporting headers (`#`, `##`, `###`), bold (`**text**`), italic (`*text*`), inline code (`` `code` ``), code blocks (```code```), blockquotes (`>`), bullet lists (`-`), and links (`[text](url)`).
- Added Modal tab switcher between `✍️ Raw Editor` and `👁️ Live Markdown Preview`.
- Added 1-Click Markdown Format Toolbar buttons above textarea (`B`, `I`, `H3`, `code`, ```` ``` ````, `”`, `• List`).
- Added unit tests in `src/lib/services/markdownService.spec.ts`.

## [0.1.0] - 2026-07-25

### Added
- Scaffolding of SvelteKit 5 + TypeScript full-stack notes application in `Build_43`.
- Implemented `src/lib/server/notesStore.ts` server-side notes data store and tag repository.
- Added `src/routes/+page.server.ts` server load function and SvelteKit Form Actions (`create`, `update`, `delete`, `togglePin`).
- Added `src/routes/+page.svelte` responsive glassmorphic dashboard with tag filter pills, search input bar, note cards grid, and create/edit modal.
- Added unit tests in `src/lib/server/notesStore.spec.ts`.
