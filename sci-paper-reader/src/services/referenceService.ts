/**
 * Reference parsing and DOI resolution service.
 *
 * Parses reference entries from the paper's References section and resolves
 * DOIs via the CrossRef API, rate-limited to 5 requests per second.
 */
import type { Reference } from '../types';

/** Minimum CrossRef score to accept a DOI result. */
const CROSSREF_SCORE_THRESHOLD = 50;

/** Maximum requests per second to the CrossRef polite pool. */
const MAX_REQUESTS_PER_SECOND = 5;

/** Interval between batches in milliseconds. */
const RATE_LIMIT_INTERVAL = 1000 / MAX_REQUESTS_PER_SECOND;

/** Queue of pending DOI resolution callbacks. */
const pendingQueue: Array<() => void> = [];
let isProcessing = false;

/**
 * Enqueues a function to be executed with rate limiting.
 *
 * @param fn - The async function to execute.
 */
function enqueue(fn: () => void): void {
  pendingQueue.push(fn);
  if (!isProcessing) processQueue();
}

/**
 * Processes the rate-limited queue, executing one item per interval.
 */
function processQueue(): void {
  if (pendingQueue.length === 0) {
    isProcessing = false;
    return;
  }
  isProcessing = true;
  const fn = pendingQueue.shift();
  if (fn) fn();
  setTimeout(processQueue, RATE_LIMIT_INTERVAL);
}

/**
 * Attempts to resolve the DOI for a reference using the CrossRef API.
 *
 * @param rawText - The raw reference text to query.
 * @returns A Promise resolving to the DOI string, or undefined if not found.
 */
async function resolveDoiFromCrossRef(rawText: string): Promise<string | undefined> {
  return new Promise((resolve) => {
    enqueue(async () => {
      try {
        const query = encodeURIComponent(rawText.slice(0, 200));
        const url = `https://api.crossref.org/works?query=${query}&rows=1`;
        const res = await fetch(url);
        if (!res.ok) {
          resolve(undefined);
          return;
        }
        const json = await res.json();
        const items = json?.message?.items;
        if (!Array.isArray(items) || items.length === 0) {
          resolve(undefined);
          return;
        }
        const firstItem = items[0];
        const score: number = firstItem?.score ?? 0;
        if (score >= CROSSREF_SCORE_THRESHOLD && firstItem?.DOI) {
          resolve(firstItem.DOI as string);
        } else {
          resolve(undefined);
        }
      } catch {
        resolve(undefined);
      }
    });
  });
}

/**
 * Parses raw reference text into a Reference object.
 *
 * Extracts the reference index number from leading brackets or numbers.
 *
 * @param rawText - The raw text of one reference entry.
 * @param index - The ordinal index (1-based) of the reference.
 * @returns A Reference object with rawText and index.
 */
function parseReferenceEntry(rawText: string, index: number): Reference {
  // Try to extract an explicit index from [14] or 14. at the start
  const bracketMatch = rawText.match(/^\[?(\d+)\]?\.?\s/);
  const extractedIndex = bracketMatch ? parseInt(bracketMatch[1], 10) : index;

  return {
    index: extractedIndex,
    rawText: rawText.trim(),
  };
}

/**
 * Parses the References section text into an array of Reference objects.
 *
 * Splits on blank lines or leading index markers and attempts DOI resolution
 * for each entry.
 *
 * @param referencesText - The raw text of the References section.
 * @returns A Promise resolving to an array of Reference objects with resolved DOIs where available.
 */
export async function parseReferences(referencesText: string): Promise<Reference[]> {
  const lines = referencesText.split('\n');
  const rawEntries: string[] = [];
  let current = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current.trim()) rawEntries.push(current.trim());
      current = '';
    } else if (/^\[?\d+\]?[.\s]/.test(trimmed) && current.trim()) {
      // New numbered entry starts
      rawEntries.push(current.trim());
      current = trimmed;
    } else {
      current += ' ' + trimmed;
    }
  }
  if (current.trim()) rawEntries.push(current.trim());

  if (rawEntries.length === 0) return [];

  // Parse and resolve DOIs in parallel (respecting rate limit via queue)
  const references = rawEntries.map((entry, i) => parseReferenceEntry(entry, i + 1));

  const withDois = await Promise.all(
    references.map(async (ref) => {
      const doi = await resolveDoiFromCrossRef(ref.rawText);
      return doi ? { ...ref, doi } : ref;
    })
  );

  return withDois;
}

/**
 * Detects in-text citation markers in a text string.
 *
 * Matches patterns like [14], [1,2,3], (Author, 2020), etc.
 *
 * @param text - The text to scan for citations.
 * @returns Array of citation matches with their text and position.
 */
export function detectCitations(
  text: string
): Array<{ text: string; startIndex: number; endIndex: number }> {
  const results: Array<{ text: string; startIndex: number; endIndex: number }> = [];
  // Numeric: [14] or [1-3] or [1,2,3]
  const numericPattern = /\[\d[\d,\s-]*\]/g;
  // Author-year: (Smith, 2020) or (Smith et al., 2020)
  const authorYearPattern = /\([A-Z][a-z]+(?:\s+et\s+al\.)?(?:,\s*\d{4})?\)/g;

  for (const regex of [numericPattern, authorYearPattern]) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      results.push({
        text: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }
  }

  results.sort((a, b) => a.startIndex - b.startIndex);
  return results;
}
