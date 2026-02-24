/**
 * Plain text document parsing service.
 *
 * Parses .txt files by splitting on blank lines and detecting section headings
 * via fully-capitalised lines or lines ending in a colon.
 */
import type { Paper, Section } from '../types';

/**
 * Determines if a line is a section heading in plain text.
 * A heading is either fully capitalised (e.g., "METHODS") or ends with a colon.
 *
 * @param line - The text line to test.
 * @returns True if the line is considered a section heading.
 */
function isTextHeading(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length < 2 || trimmed.length > 100) return false;

  // Fully capitalised (at least 2 alpha chars)
  if (/^[A-Z][A-Z\s-]+$/.test(trimmed) && /[A-Z]{2}/.test(trimmed)) return true;

  // Ends with colon
  if (/:\s*$/.test(trimmed)) return true;

  // Numbered heading
  if (/^\d+(\.\d+)*\.?\s+[A-Z]/.test(trimmed)) return true;

  return false;
}

/**
 * Parses a plain text file into a structured Paper object.
 *
 * Splits the file on blank lines and identifies section headings via
 * fully-capitalised lines or lines ending with a colon.
 *
 * @param file - The plain text File object to parse.
 * @returns A Promise resolving to a fully typed Paper object.
 */
export async function parseText(file: File): Promise<Paper> {
  const text = await file.text();
  const lines = text.split('\n');

  const sections: Section[] = [];
  let currentSection: Section = {
    id: 'section-0',
    heading: 'Document',
    bodyText: '',
    figures: [],
    tables: [],
  };
  let title = '';
  let abstract = '';
  let firstSection = true;

  for (const line of lines) {
    if (isTextHeading(line)) {
      if (firstSection && currentSection.bodyText.trim()) {
        // Extract title from first block of text
        title = currentSection.bodyText.trim().split('\n')[0] || '';
        sections.push(currentSection);
        firstSection = false;
      } else if (currentSection.bodyText.trim()) {
        sections.push(currentSection);
      }

      const newId = `section-${sections.length + 1}`;
      currentSection = {
        id: newId,
        heading: line.trim(),
        bodyText: '',
        figures: [],
        tables: [],
      };
    } else {
      currentSection.bodyText += line + '\n';
    }
  }

  if (currentSection.bodyText.trim()) {
    sections.push(currentSection);
  }

  // Extract abstract if present
  const abstractSection = sections.find(
    (s) => s.heading.toLowerCase().includes('abstract')
  );
  if (abstractSection) {
    abstract = abstractSection.bodyText.trim();
  }

  // Extract title from first non-empty line if not set
  if (!title && sections.length > 0) {
    title = sections[0].bodyText.trim().split('\n')[0] || file.name;
  }

  return {
    id: crypto.randomUUID(),
    title: title || file.name,
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
    warnings: [],
  };
}
