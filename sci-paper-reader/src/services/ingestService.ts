/**
 * Document ingestion service — unified entry point for all document formats.
 *
 * Dispatches to the appropriate parser based on the file's MIME type.
 */
import type { Paper } from '../types';
import { parsePdf } from './pdfService';
import { parseText } from './textService';
import { parseMarkdown } from './markdownService';

/**
 * Ingests a document file and returns a structured Paper object.
 *
 * Dispatches to:
 * - pdfService for `application/pdf`
 * - textService for `text/plain`
 * - markdownService for `text/markdown`
 *
 * @param file - The File object to ingest.
 * @returns A Promise resolving to a fully typed Paper object.
 * @throws Error if the file type is not supported.
 */
export async function ingestDocument(file: File): Promise<Paper> {
  const mimeType = file.type.toLowerCase();

  if (mimeType === 'application/pdf') {
    return parsePdf(file);
  }

  if (mimeType === 'text/plain') {
    return parseText(file);
  }

  if (mimeType === 'text/markdown' || file.name.endsWith('.md')) {
    return parseMarkdown(file);
  }

  throw new Error(
    `Unsupported file type: "${file.type}". Supported types: application/pdf, text/plain, text/markdown.`
  );
}
