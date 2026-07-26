// src/lib/services/importService.ts
// Notebook Multi-Source Import Engine for Build 43 (SvelteKit).
// Supports Markdown (.md), Notion/Evernote exports, and JSON Vault Backups.
// Connects to: src/routes/+page.svelte, src/lib/services/importService.spec.ts
// Created: 2026-07-26

export interface ImportedNotePayload {
  title: string;
  content: string;
  tags: string[];
  folder: string;
  color: string;
}

export function parseMarkdownImport(rawText: string, defaultFilename: string = 'Imported Note'): ImportedNotePayload {
  if (!rawText || !rawText.trim()) {
    return {
      title: defaultFilename.replace(/\.(md|txt)$/i, ''),
      content: '',
      tags: ['imported'],
      folder: 'Ideas',
      color: '#06b6d4'
    };
  }

  let title = defaultFilename.replace(/\.(md|txt)$/i, '');
  let content = rawText;
  let tags: string[] = ['imported'];
  let folder = 'Ideas';

  // Extract YAML Frontmatter if present
  const frontmatterMatch = rawText.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (frontmatterMatch) {
    const yamlBlock = frontmatterMatch[1];
    content = frontmatterMatch[2].trim();

    const titleMatch = yamlBlock.match(/title:\s*["']?(.*?)["']?$/m);
    if (titleMatch && titleMatch[1]) title = titleMatch[1];

    const tagsMatch = yamlBlock.match(/tags:\s*\[(.*?)\]/m);
    if (tagsMatch && tagsMatch[1]) {
      tags = tagsMatch[1]
        .split(',')
        .map(t => t.replace(/["'\s]/g, '').toLowerCase())
        .filter(t => t.length > 0);
    }

    const folderMatch = yamlBlock.match(/folder:\s*["']?(.*?)["']?$/m);
    if (folderMatch && folderMatch[1]) folder = folderMatch[1];
  } else {
    // If no frontmatter, extract H1 title if available
    const h1Match = rawText.match(/^#\s+(.*$)/m);
    if (h1Match && h1Match[1].trim()) {
      title = h1Match[1].trim();
    }
  }

  return {
    title,
    content,
    tags: tags.length > 0 ? tags : ['imported'],
    folder: folder || 'Ideas',
    color: '#06b6d4'
  };
}

export function parseJsonVaultImport(jsonStr: string): ImportedNotePayload[] {
  try {
    const parsed = JSON.parse(jsonStr);
    const items = Array.isArray(parsed) ? parsed : [parsed];

    return items.map((item, index) => ({
      title: String(item.title || `Imported Vault Note ${index + 1}`),
      content: String(item.content || ''),
      tags: Array.isArray(item.tags) ? item.tags.map(String) : ['imported-vault'],
      folder: String(item.folder || 'Work'),
      color: String(item.color || '#06b6d4')
    }));
  } catch (err) {
    return [];
  }
}
