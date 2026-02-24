/**
 * PDF parsing service using pdf.js.
 *
 * Extracts text, sections, figures, and metadata from PDF files.
 */
import * as pdfjsLib from 'pdfjs-dist';
import type { Paper, Section, Figure } from '../types';

// Configure the worker using the bundled worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

/** Known section heading patterns for scientific papers. */
const SECTION_HEADINGS = [
  'abstract',
  'introduction',
  'background',
  'methods',
  'methodology',
  'materials and methods',
  'results',
  'discussion',
  'conclusion',
  'conclusions',
  'references',
  'bibliography',
  'acknowledgements',
  'acknowledgments',
  'supplementary',
  'appendix',
  'related work',
  'literature review',
];

/**
 * Determines whether a text line is a section heading.
 * Matches: all-caps lines, numbered headings, lines ending in colon,
 * or known scientific section names.
 *
 * @param line - The text line to test.
 * @returns True if the line appears to be a section heading.
 */
function isSectionHeading(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 120) return false;

  // Numbered heading: "1. Introduction" or "1.1 Methods"
  if (/^\d+(\.\d+)*\.?\s+[A-Z]/.test(trimmed)) return true;

  // All-caps heading (at least 3 chars, not just punctuation)
  if (/^[A-Z][A-Z\s]{2,}$/.test(trimmed)) return true;

  // Line ending in colon
  if (/:\s*$/.test(trimmed)) return true;

  // Known heading names (case-insensitive)
  const lower = trimmed.toLowerCase();
  if (SECTION_HEADINGS.some((h) => lower === h || lower.startsWith(h + ' '))) return true;

  return false;
}

/**
 * Determines whether a line looks like part of a multi-column layout.
 * Heuristic: multiple short text fragments separated by large whitespace gaps.
 *
 * @param items - Text items from a pdf.js page.
 * @returns True if multi-column layout is suspected.
 */
function isMultiColumn(items: Array<{ str: string; transform: number[] }>): boolean {
  // Collect x-positions of text items
  const xPositions = items
    .filter((item) => item.str.trim().length > 0)
    .map((item) => item.transform[4]);

  if (xPositions.length < 10) return false;

  // Check if there are two distinct clusters of x positions
  const sorted = [...xPositions].sort((a, b) => a - b);
  const mid = (sorted[0] + sorted[sorted.length - 1]) / 2;
  const leftCluster = sorted.filter((x) => x < mid);
  const rightCluster = sorted.filter((x) => x >= mid);

  // Multi-column if both clusters are substantial
  return leftCluster.length > 5 && rightCluster.length > 5;
}

/**
 * Renders a PDF page to a canvas and returns a data URL.
 *
 * @param page - The pdf.js page object.
 * @returns A base64 data URL string of the rendered page image.
 */
async function pageToDataUrl(page: pdfjsLib.PDFPageProxy): Promise<string> {
  const viewport = page.getViewport({ scale: 1.0 });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext('2d');
  if (!context) return '';

  await page.render({ canvasContext: context as CanvasRenderingContext2D, canvas, viewport }).promise;
  return canvas.toDataURL('image/png');
}

/**
 * Parses a PDF file and returns a structured Paper object.
 *
 * Extracts text page-by-page, identifies sections via heading patterns,
 * captures page images as figures, and flags suspected multi-column layouts.
 *
 * @param file - The PDF File object to parse.
 * @returns A Promise resolving to a fully typed Paper object.
 */
export async function parsePdf(file: File): Promise<Paper> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const warnings: string[] = [];
  const sections: Section[] = [];
  let currentSection: Section = {
    id: 'section-0',
    heading: 'Preamble',
    bodyText: '',
    figures: [],
    tables: [],
  };

  let title = '';
  let abstract = '';
  const pageCount = pdf.numPages;

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items as Array<{ str: string; transform: number[] }>;

    // Check for multi-column layout
    if (isMultiColumn(items)) {
      warnings.push(`Page ${pageNum}: suspected multi-column layout detected.`);
    }

    // Render page as image
    const dataUrl = await pageToDataUrl(page);
    const figure: Figure = {
      id: `page-${pageNum}`,
      dataUrl,
      caption: `Page ${pageNum}`,
      pageNumber: pageNum,
    };

    // Build page text
    const pageText = items.map((item) => item.str).join('');
    const lines = pageText.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (isSectionHeading(trimmed)) {
        // Save current section
        if (currentSection.bodyText.trim() || currentSection.figures.length) {
          sections.push(currentSection);
        }

        const newId = `section-${sections.length + 1}`;
        currentSection = {
          id: newId,
          heading: trimmed,
          bodyText: '',
          figures: [],
          tables: [],
        };

        // Extract abstract text after "Abstract" heading
        if (trimmed.toLowerCase() === 'abstract') {
          // Will be filled below
        }
      } else {
        currentSection.bodyText += line + '\n';
      }
    }

    // Attach page figure to current section
    currentSection.figures.push(figure);
  }

  // Push final section
  if (currentSection.bodyText.trim() || currentSection.figures.length) {
    sections.push(currentSection);
  }

  // Extract title from first section's text if no heading
  if (sections.length > 0) {
    const firstSection = sections[0];
    const firstLine = firstSection.bodyText.trim().split('\n')[0] || '';
    title = firstLine.slice(0, 200);
  }

  // Find abstract section
  const abstractSection = sections.find(
    (s) => s.heading.toLowerCase() === 'abstract'
  );
  if (abstractSection) {
    abstract = abstractSection.bodyText.trim();
    title = title || file.name.replace(/\.pdf$/i, '');
  }

  return {
    id: crypto.randomUUID(),
    title: title || file.name.replace(/\.pdf$/i, ''),
    authors: [],
    abstract,
    sections,
    doi: '',
    metadata: {
      journal: '',
      year: new Date().getFullYear(),
      doi: '',
      keywords: [],
      citationCount: 0,
    },
    warnings,
  };
}
