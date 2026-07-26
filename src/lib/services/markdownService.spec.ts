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

  it('should render task list checkboxes correctly', () => {
    const md = '- [ ] Uncompleted task\n- [x] Completed task';
    const html = renderMarkdown(md);

    expect(html).toContain('<li class="md-task-item md-task-todo"><input type="checkbox" disabled /> <span>Uncompleted task</span></li>');
    expect(html).toContain('<li class="md-task-item md-task-done"><input type="checkbox" checked disabled /> <del>Completed task</del></li>');
  });

  it('should render markdown tables correctly', () => {
    const md = '| Task | Status |\n| --- | --- |\n| Build 43 | In Progress |';
    const html = renderMarkdown(md);

    expect(html).toContain('<table class="md-table">');
    expect(html).toContain('<th>Task</th>');
    expect(html).toContain('<td>Build 43</td>');
  });

  it('should strip markdown formatting to plain text', () => {
    const md = '### Title\n**Bold** and `code`\n- [x] Done';
    const plain = stripMarkdown(md);

    expect(plain).toBe('Title\nBold and code\nDone');
  });
});
