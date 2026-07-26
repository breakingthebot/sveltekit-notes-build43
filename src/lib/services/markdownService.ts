// src/lib/services/markdownService.ts
// Markdown Formatting, Live Rich Preview, Table Parser & Checklist Todo service for Build 43 (SvelteKit).
// Connects to: src/routes/+page.svelte, src/lib/services/markdownService.spec.ts
// Created: 2026-07-25

export function renderMarkdown(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;

  // Escape HTML entities to prevent XSS
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Fenced Code Blocks (```code```)
  html = html.replace(/```([a-z]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="md-code-block"><code>${code.trim()}</code></pre>`;
  });

  // Inline Code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');

  // Markdown Tables (| Header | Header |\n| --- | --- |\n| Cell | Cell |)
  html = html.replace(/^\|(.+)\|\r?\n\|[-:\s|]+\|\r?\n((?:\|.+\|\r?\n?)+)/gm, (match, headerRow, bodyRows) => {
    const headers = headerRow.split('|').map((h: string) => h.trim()).filter((h: string) => h.length > 0);
    const rows = bodyRows.trim().split('\n').map((row: string) => {
      const cells = row.split('|').map(c => c.trim()).filter(c => c.length > 0);
      return `<tr>${cells.map((c: string) => `<td>${c}</td>`).join('')}</tr>`;
    });

    const thead = `<thead><tr>${headers.map((h: string) => `<th>${h}</th>`).join('')}</tr></thead>`;
    const tbody = `<tbody>${rows.join('')}</tbody>`;
    return `<table class="md-table">${thead}${tbody}</table>`;
  });

  // Task list items (- [x] done and - [ ] todo)
  html = html.replace(/^\s*[-*]\s+\[[xX]\]\s+(.*$)/gim, '<li class="md-task-item md-task-done"><input type="checkbox" checked disabled /> <del>$1</del></li>');
  html = html.replace(/^\s*[-*]\s+\[\s\]\s+(.*$)/gim, '<li class="md-task-item md-task-todo"><input type="checkbox" disabled /> <span>$1</span></li>');

  // Headings (# H1, ## H2, ### H3)
  html = html.replace(/^### (.*$)/gim, '<h3 class="md-h3">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="md-h2">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="md-h1">$1</h1>');

  // Bold (**text** or __text__)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Italic (*text* or _text_)
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // Blockquotes (> text)
  html = html.replace(/^>\s?(.*$)/gim, '<blockquote class="md-quote">$1</blockquote>');

  // Unordered Lists (- item or * item)
  html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li class="md-list-item">$1</li>');
  html = html.replace(/(<li class="(?:md-list-item|md-task-item).*<\/li>)/gis, '<ul class="md-list">$1</ul>');
  // Clean nested list tags duplicate wraps
  html = html.replace(/<\/ul>\s*<ul class="md-list">/g, '');

  // Links ([text](url))
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>');

  // Paragraph Line breaks
  html = html.replace(/\n\n/g, '<br/><br/>');

  return html;
}

export function stripMarkdown(markdown: string): string {
  if (!markdown) return '';
  return markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#+\s+/gim, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*[-*]\s+\[[ xX]\]\s+/gim, '')
    .replace(/^\s*[-*]\s+/gim, '')
    .trim();
}
