# Changelog

All notable changes to **SvelteKit Notes Vault** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-07-25

### Added
- Scaffolding of SvelteKit 5 + TypeScript full-stack notes application in `Build_43`.
- Implemented `src/lib/server/notesStore.ts` server-side notes data store and tag repository.
- Added `src/routes/+page.server.ts` server load function and SvelteKit Form Actions (`create`, `update`, `delete`, `togglePin`).
- Added `src/routes/+page.svelte` responsive glassmorphic dashboard with tag filter pills, search input bar, note cards grid, and create/edit modal.
- Added unit tests in `src/lib/server/notesStore.spec.ts`.
