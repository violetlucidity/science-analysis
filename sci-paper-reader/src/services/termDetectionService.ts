/**
 * Statistical term detection service.
 *
 * Uses an Aho-Corasick automaton to efficiently find all statistical terms
 * and their aliases within a body of text.
 */
import AhoCorasick from 'ahocorasick';
import type { DetectedTerm, StatisticalTerm } from '../types';
import termsData from '../data/statisticalTerms.json';

/** Cast the imported JSON to the correct type. */
const allTerms = termsData as StatisticalTerm[];

/**
 * Mapping from lowercase form of a term/alias to its canonical StatisticalTerm entry.
 * Built once at module initialisation.
 */
const termByLower = new Map<string, StatisticalTerm>();

for (const entry of allTerms) {
  termByLower.set(entry.term.toLowerCase(), entry);
  for (const alias of entry.aliases) {
    if (!termByLower.has(alias.toLowerCase())) {
      termByLower.set(alias.toLowerCase(), entry);
    }
  }
}

/** All lowercase keyword strings for the Aho-Corasick automaton. */
const keywords = Array.from(termByLower.keys());

/** Cached Aho-Corasick automaton built over all terms and aliases. */
const automaton = new AhoCorasick(keywords);

/**
 * Detects all statistical terms in the provided text.
 *
 * The matching is case-insensitive. Overlapping matches are resolved by
 * preferring the longest match at any given start position.
 *
 * @param text - The body text to search.
 * @returns An array of DetectedTerm objects with character offsets.
 */
export function detectTerms(text: string): DetectedTerm[] {
  if (!text) return [];

  const lowerText = text.toLowerCase();

  // ahocorasick returns [endIndex, matchedStrings[]] — endIndex is the last char of the match
  const rawMatches = automaton.search(lowerText);

  // Collect all candidate matches with start/end offsets
  interface Candidate {
    startIndex: number;
    endIndex: number;
    keyword: string;
    entry: StatisticalTerm;
  }

  const candidates: Candidate[] = [];

  for (const [endIdx, matchedKeywords] of rawMatches) {
    for (const keyword of matchedKeywords) {
      const startIdx = endIdx - keyword.length + 1;
      // Ensure the match is at a word boundary
      const beforeChar = startIdx > 0 ? lowerText[startIdx - 1] : ' ';
      const afterChar = endIdx + 1 < lowerText.length ? lowerText[endIdx + 1] : ' ';
      if (/\w/.test(beforeChar) || /\w/.test(afterChar)) {
        // Not at word boundary — skip
        continue;
      }
      const entry = termByLower.get(keyword);
      if (!entry) continue;
      candidates.push({ startIndex: startIdx, endIndex: endIdx + 1, keyword, entry });
    }
  }

  if (candidates.length === 0) return [];

  // Resolve overlapping matches: prefer longest match at any given start position,
  // then remove overlaps with a greedy interval-covering approach.

  // Sort by start index, then by length descending
  candidates.sort((a, b) => {
    if (a.startIndex !== b.startIndex) return a.startIndex - b.startIndex;
    return (b.endIndex - b.startIndex) - (a.endIndex - a.startIndex);
  });

  const resolved: DetectedTerm[] = [];
  let lastEnd = -1;

  for (const cand of candidates) {
    // Skip if overlaps with already-selected match
    if (cand.startIndex < lastEnd) continue;

    resolved.push({
      term: cand.entry.term,
      startIndex: cand.startIndex,
      endIndex: cand.endIndex,
      dictionaryEntry: cand.entry,
    });
    lastEnd = cand.endIndex;
  }

  return resolved;
}

/**
 * Returns the full list of all statistical terms in the dictionary.
 *
 * @returns Array of all StatisticalTerm entries.
 */
export function getAllTerms(): StatisticalTerm[] {
  return allTerms;
}

/**
 * Looks up a term by its exact name or alias (case-insensitive).
 *
 * @param termName - The term name or alias to look up.
 * @returns The matching StatisticalTerm entry, or undefined if not found.
 */
export function lookupTerm(termName: string): StatisticalTerm | undefined {
  return termByLower.get(termName.toLowerCase());
}
