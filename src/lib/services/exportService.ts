// src/lib/services/exportService.ts
// Note Export & Download Engine for Build 43 (SvelteKit).
// Connects to: src/routes/+page.svelte
// Created: 2026-07-25

import type { Note } from '$lib/server/notesStore';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'note';
}

export function generateNoteMarkdown(note: Note): string {
  const frontmatter = [
    '---',
    `title: "${note.title.replace(/"/g, '\\"')}"`,
    `tags: [${note.tags.map(t => `"${t}"`).join(', ')}]`,
    `created_at: "${note.createdAt}"`,
    `updated_at: "${note.updatedAt}"`,
    '---',
    '',
    `# ${note.title}`,
    '',
    note.content
  ].join('\n');

  return frontmatter;
}

export function generateNoteHtml(note: Note, renderedBodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${note.title}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #1e293b; }
    h1 { color: #0f172a; border-bottom: 2px solid #cbd5e1; padding-bottom: 8px; }
    .tags { margin-top: 20px; }
    .tag { display: inline-block; background: #e2e8f0; color: #475569; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-right: 6px; }
    pre { background: #0f172a; color: #38bdf8; padding: 12px; border-radius: 8px; overflow-x: auto; }
    blockquote { border-left: 4px solid #a855f7; padding-left: 12px; color: #64748b; font-style: italic; }
  </style>
</head>
<body>
  <h1>${note.title}</h1>
  <div>${renderedBodyHtml}</div>
  <div class="tags">
    ${note.tags.map(t => `<span class="tag">#${t}</span>`).join('')}
  </div>
</body>
</html>`;
}

export function generateVaultJson(notes: Note[]): string {
  return JSON.stringify(notes, null, 2);
}

export function generateVaultMarkdownDump(notes: Note[]): string {
  return notes
    .map(n => generateNoteMarkdown(n))
    .join('\n\n========================================\n\n');
}

export function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
