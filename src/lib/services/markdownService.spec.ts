// src/lib/services/markdownService.spec.ts
// Unit tests for markdownService in Build 43.
// Created: 2026-07-25

import { describe, it, expect } from 'vitest';
import { renderMarkdown, stripMarkdown } from './markdownService';

describe('markdownService', () => {
  it('should render bold text, headers, and code blocks correctly', () => {
    const md = '# Header 1\n**Bold Text** and `inline code`';
    const html = renderMarkdown(md);

    expect(html).toContain('<h1 class="md-h1">Header 1</h1>');
    expect(html).toContain('<strong>Bold Text</strong>');
    expect(html).toContain('<code class="md-inline-code">inline code</code>');
  });

  it('should render fenced code blocks correctly', () => {
    const md = '```ts\nconst x = 42;\n```';
    const html = renderMarkdown(md);

    expect(html).toContain('<pre class="md-code-block"><code>const x = 42;</code></pre>');
  });

  it('should strip markdown formatting to plain text', () => {
    const md = '### Title\n**Bold** and `code`';
    const plain = stripMarkdown(md);

    expect(plain).toBe('Title\nBold and code');
  });
});
