// src/lib/services/exportService.spec.ts
// Unit tests for exportService in Build 43.
// Created: 2026-07-25

import { describe, it, expect } from 'vitest';
import { slugify, generateNoteMarkdown, generateNoteHtml, generateVaultJson } from './exportService';
import type { Note } from '$lib/server/notesStore';

const dummyNote: Note = {
  id: 'note-100',
  title: 'My Project Notes!',
  content: 'Some notes content here.',
  tags: ['work', 'ideas'],
  color: '#06b6d4',
  isPinned: false,
  createdAt: '2026-07-25T12:00:00.000Z',
  updatedAt: '2026-07-25T12:00:00.000Z'
};

describe('exportService', () => {
  it('should slugify titles properly for filenames', () => {
    expect(slugify('My Project Notes!')).toBe('my-project-notes');
    expect(slugify('  SvelteKit & TypeScript  ')).toBe('sveltekit-typescript');
  });

  it('should generate valid markdown with frontmatter', () => {
    const md = generateNoteMarkdown(dummyNote);

    expect(md).toContain('---');
    expect(md).toContain('title: "My Project Notes!"');
    expect(md).toContain('tags: ["work", "ideas"]');
    expect(md).toContain('# My Project Notes!');
    expect(md).toContain('Some notes content here.');
  });

  it('should generate valid standalone HTML document', () => {
    const html = generateNoteHtml(dummyNote, '<p>Some notes content here.</p>');

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>My Project Notes!</title>');
    expect(html).toContain('<span class="tag">#work</span>');
  });

  it('should serialize vault notes into JSON format', () => {
    const json = generateVaultJson([dummyNote]);
    const parsed = JSON.parse(json);

    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].id).toBe('note-100');
  });
});
