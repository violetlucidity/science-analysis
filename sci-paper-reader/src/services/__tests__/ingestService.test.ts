import { describe, it, expect, vi } from 'vitest';

// Mock all three parsers before importing ingestService.
vi.mock('../pdfService', () => ({
  parsePdf: vi.fn().mockResolvedValue({ id: 'pdf-paper', title: 'PDF Paper' }),
}));

vi.mock('../textService', () => ({
  parseText: vi.fn().mockResolvedValue({ id: 'txt-paper', title: 'Text Paper' }),
}));

vi.mock('../markdownService', () => ({
  parseMarkdown: vi.fn().mockResolvedValue({ id: 'md-paper', title: 'Markdown Paper' }),
}));

import { ingestDocument } from '../ingestService';
import { parsePdf } from '../pdfService';
import { parseMarkdown } from '../markdownService';

describe('ingestDocument', () => {
  it('dispatches to pdfService for application/pdf', async () => {
    const file = new File(['%PDF'], 'paper.pdf', { type: 'application/pdf' });
    const paper = await ingestDocument(file);

    expect(parsePdf).toHaveBeenCalledWith(file);
    expect(paper.id).toBe('pdf-paper');
  });

  it('dispatches to markdownService for text/markdown', async () => {
    const file = new File(['# Title'], 'paper.md', { type: 'text/markdown' });
    const paper = await ingestDocument(file);

    expect(parseMarkdown).toHaveBeenCalledWith(file);
    expect(paper.id).toBe('md-paper');
  });
});
