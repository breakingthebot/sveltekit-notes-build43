// src/lib/services/importService.spec.ts
// Unit tests for importService.
// Connects to: src/lib/services/importService.ts
// Created: 2026-07-26

import { describe, it, expect } from 'vitest';
import { parseMarkdownImport, parseJsonVaultImport } from './importService';

describe('importService', () => {
  it('parses raw markdown file with H1 title header', () => {
    const raw = '# SvelteKit Migration Guide\nMigrating notes to Build 43 vault...';
    const result = parseMarkdownImport(raw, 'file.md');

    expect(result.title).toBe('SvelteKit Migration Guide');
    expect(result.content).toContain('Migrating notes');
    expect(result.tags).toContain('imported');
  });

  it('parses markdown with YAML frontmatter tags and folder', () => {
    const raw = `---
title: "Notion Architecture Note"
tags: ["notion", "sync"]
folder: "Work"
---

# Notion Note
Content from Notion export...`;

    const result = parseMarkdownImport(raw, 'notion-export.md');

    expect(result.title).toBe('Notion Architecture Note');
    expect(result.tags).toEqual(['notion', 'sync']);
    expect(result.folder).toBe('Work');
  });

  it('parses JSON vault backup files', () => {
    const json = JSON.stringify([
      { title: 'Note 1', content: 'Content 1', tags: ['backup'], folder: 'Archive' },
      { title: 'Note 2', content: 'Content 2', tags: ['backup'], folder: 'Personal' }
    ]);

    const results = parseJsonVaultImport(json);

    expect(results).toHaveLength(2);
    expect(results[0].title).toBe('Note 1');
    expect(results[1].folder).toBe('Personal');
  });

  it('handles invalid JSON gracefully', () => {
    const results = parseJsonVaultImport('invalid json string');
    expect(results).toHaveLength(0);
  });
});
