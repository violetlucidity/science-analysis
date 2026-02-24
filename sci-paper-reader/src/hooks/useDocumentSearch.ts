/**
 * Hook for full-text search over paper sections using Fuse.js.
 *
 * Builds a Fuse.js index when the paper loads and returns match results
 * with section IDs and character offset information.
 */
import { useState, useMemo, useCallback } from 'react';
import Fuse, { type FuseResult } from 'fuse.js';
import type { Paper } from '../types';

/** A single search match result. */
export interface SearchMatch {
  /** The section ID where the match was found. */
  sectionId: string;
  /** The section heading. */
  heading: string;
  /** The matched text snippet. */
  snippet: string;
  /** The match score (lower = better). */
  score: number;
}

/** Return value from useDocumentSearch. */
export interface UseDocumentSearchReturn {
  /** The current search query. */
  query: string;
  /** Setter for the query. */
  setQuery: (q: string) => void;
  /** Array of matches for the current query. */
  matches: SearchMatch[];
  /** Total number of matches. */
  matchCount: number;
  /** Index of the currently highlighted match (0-based). */
  currentMatchIndex: number;
  /** Move to the next match. */
  nextMatch: () => void;
  /** Move to the previous match. */
  prevMatch: () => void;
  /** Clear search and reset state. */
  clearSearch: () => void;
}

/** Fuse.js search item structure. */
interface SearchItem {
  sectionId: string;
  heading: string;
  bodyText: string;
}

/**
 * Builds a Fuse.js search index and provides full-text search over paper sections.
 *
 * @param paper - The paper to search, or null if no paper is loaded.
 * @returns Search state and navigation handlers.
 */
export function useDocumentSearch(paper: Paper | null): UseDocumentSearchReturn {
  const [query, setQueryState] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Build Fuse index when paper changes
  const fuse = useMemo(() => {
    if (!paper) return null;
    const items: SearchItem[] = paper.sections.map((sec) => ({
      sectionId: sec.id,
      heading: sec.heading,
      bodyText: sec.bodyText,
    }));
    return new Fuse(items, {
      keys: ['bodyText', 'heading'],
      includeScore: true,
      threshold: 0.3,
      minMatchCharLength: 2,
    });
  }, [paper]);

  // Compute matches whenever query or fuse changes
  const matches = useMemo<SearchMatch[]>(() => {
    if (!fuse || !query.trim()) return [];
    const results: FuseResult<SearchItem>[] = fuse.search(query);
    return results.map((r) => ({
      sectionId: r.item.sectionId,
      heading: r.item.heading,
      snippet: r.item.bodyText.slice(0, 150),
      score: r.score ?? 1,
    }));
  }, [fuse, query]);

  const setQuery = useCallback((q: string) => {
    setQueryState(q);
    setCurrentMatchIndex(0);
  }, []);

  const nextMatch = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((i) => (i + 1) % matches.length);
  }, [matches.length]);

  const prevMatch = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((i) => (i - 1 + matches.length) % matches.length);
  }, [matches.length]);

  const clearSearch = useCallback(() => {
    setQueryState('');
    setCurrentMatchIndex(0);
  }, []);

  return {
    query,
    setQuery,
    matches,
    matchCount: matches.length,
    currentMatchIndex,
    nextMatch,
    prevMatch,
    clearSearch,
  };
}
