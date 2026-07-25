# Changelog

All notable changes to **SvelteKit Notes Vault** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
