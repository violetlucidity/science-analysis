import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- pdf.js mock ---------------------------------------------------------
// Must be hoisted before the service import so the module initialiser picks
// up the mock rather than the real library.
vi.mock('pdfjs-dist', () => {
  return {
    GlobalWorkerOptions: { workerSrc: '' },
    getDocument: vi.fn(),
  };
});

import * as pdfjsLib from 'pdfjs-dist';
import { parsePdf } from '../pdfService';

// Helper: create a minimal mock page given text items and x-positions.
function makePage(
  lines: string[],
  xPositions?: number[]
) {
  // Append newline so the service's `pageText.split('\n')` sees each entry
  // as a separate line when items are joined.
  const items = lines.map((str, i) => ({
    str: str + '\n',
    transform: [1, 0, 0, 1, xPositions ? xPositions[i] ?? 50 : 50, 700],
  }));

  return {
    getTextContent: vi.fn().mockResolvedValue({ items }),
    getViewport: vi.fn().mockReturnValue({ width: 600, height: 800 }),
    render: vi.fn().mockReturnValue({ promise: Promise.resolve() }),
  };
}

// Helper: create a minimal mock PDF document.
function makePdf(pages: ReturnType<typeof makePage>[]) {
  return {
    numPages: pages.length,
    getPage: vi.fn().mockImplementation((n: number) =>
      Promise.resolve(pages[n - 1])
    ),
  };
}

// Stub canvas so pageToDataUrl does not crash in jsdom.
beforeEach(() => {
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'canvas') {
      return {
        getContext: () => ({}),
        toDataURL: () => 'data:image/png;base64,stub',
        width: 0,
        height: 0,
      } as unknown as HTMLCanvasElement;
    }
    // Fall back to real createElement for other tags.
    return document.createElement.call(document, tag);
  });
});

describe('parsePdf', () => {
  it('correctly maps extracted text to expected section headings', async () => {
    // Body text is chosen so it does NOT start with any of the SECTION_HEADINGS
    // strings (e.g. "background"), which would wrongly be detected as headings.
    const page = makePage([
      'ABSTRACT',
      'We examine the effect of a novel treatment on patient outcomes.',
      'INTRODUCTION',
      'Prior research has shown conflicting findings in this domain.',
      'METHODS',
      'Participants were recruited from three clinical sites.',
    ]);

    (pdfjsLib.getDocument as ReturnType<typeof vi.fn>).mockReturnValue({
      promise: Promise.resolve(makePdf([page])),
    });

    const file = new File([''], 'test.pdf', { type: 'application/pdf' });
    const paper = await parsePdf(file);

    const headings = paper.sections.map((s) => s.heading.toUpperCase());
    expect(headings).toContain('ABSTRACT');
    expect(headings).toContain('INTRODUCTION');
    expect(headings).toContain('METHODS');
  });

  it('populates warnings when a multi-column layout is suspected', async () => {
    // Generate 20 items: 10 on the left (x ~50) and 10 on the right (x ~400).
    const leftXs = Array.from({ length: 10 }, () => 50);
    const rightXs = Array.from({ length: 10 }, () => 400);
    const allXs = [...leftXs, ...rightXs];
    const lines = allXs.map((_, i) => `Word${i}`);

    const page = makePage(lines, allXs);

    (pdfjsLib.getDocument as ReturnType<typeof vi.fn>).mockReturnValue({
      promise: Promise.resolve(makePdf([page])),
    });

    const file = new File([''], 'multicolumn.pdf', { type: 'application/pdf' });
    const paper = await parsePdf(file);

    expect(paper.warnings.length).toBeGreaterThan(0);
    expect(paper.warnings[0]).toMatch(/multi-column/i);
  });
});
