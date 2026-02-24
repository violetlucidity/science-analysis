/**
 * Hook for managing user annotations with localStorage persistence.
 *
 * Annotations are keyed by paper DOI, or by a SHA-256 hash of the title
 * if no DOI is available.
 */
import { useState, useEffect, useCallback } from 'react';
import type { Annotation } from '../types';

/** Return value from useAnnotations. */
export interface UseAnnotationsReturn {
  /** All stored annotations. */
  annotations: Annotation[];
  /**
   * Adds a new annotation.
   * @param annotation - The annotation to add (without id/createdAt).
   */
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt'>) => void;
  /**
   * Updates an existing annotation by ID.
   * @param id - The annotation ID.
   * @param updates - Partial annotation fields to update.
   */
  updateAnnotation: (id: string, updates: Partial<Omit<Annotation, 'id'>>) => void;
  /**
   * Deletes an annotation by ID.
   * @param id - The annotation ID to remove.
   */
  deleteAnnotation: (id: string) => void;
  /**
   * Returns annotations for a specific paper.
   * @param paperId - The paper DOI or ID.
   * @returns Annotations belonging to that paper.
   */
  getAnnotationsForPaper: (paperId: string) => Annotation[];
}

/**
 * Computes a SHA-256 hash of a string using the Web Crypto API.
 *
 * @param text - The string to hash.
 * @returns A hex string of the SHA-256 hash.
 */
async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Derives a stable storage key for a paper from its DOI or title hash.
 *
 * @param doi - The paper DOI (may be empty string).
 * @param title - The paper title, used as fallback.
 * @returns A Promise resolving to the storage key string.
 */
export async function getPaperStorageKey(doi: string, title: string): Promise<string> {
  if (doi) return `annotations-doi-${doi}`;
  const hash = await sha256(title);
  return `annotations-hash-${hash}`;
}

const ANNOTATIONS_STORAGE_KEY = 'sci-reader-annotations-v1';

/**
 * Loads all annotations from localStorage.
 *
 * @returns The stored annotations array, or empty array if none.
 */
function loadAnnotations(): Annotation[] {
  try {
    const raw = localStorage.getItem(ANNOTATIONS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Annotation[];
  } catch {
    return [];
  }
}

/**
 * Saves annotations to localStorage.
 *
 * @param annotations - The annotations array to persist.
 */
function saveAnnotations(annotations: Annotation[]): void {
  try {
    localStorage.setItem(ANNOTATIONS_STORAGE_KEY, JSON.stringify(annotations));
  } catch {
    // localStorage may be unavailable in some environments
  }
}

/**
 * Hook for managing user annotations with localStorage persistence.
 *
 * Provides CRUD operations for annotations, stored globally and
 * filtered per-paper by paperId.
 *
 * @returns Annotation state and CRUD handlers.
 */
export function useAnnotations(): UseAnnotationsReturn {
  const [annotations, setAnnotations] = useState<Annotation[]>(() => loadAnnotations());

  useEffect(() => {
    saveAnnotations(annotations);
  }, [annotations]);

  const addAnnotation = useCallback((annotation: Omit<Annotation, 'id' | 'createdAt'>) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setAnnotations((prev) => [...prev, newAnnotation]);
  }, []);

  const updateAnnotation = useCallback(
    (id: string, updates: Partial<Omit<Annotation, 'id'>>) => {
      setAnnotations((prev) =>
        prev.map((ann) => (ann.id === id ? { ...ann, ...updates } : ann))
      );
    },
    []
  );

  const deleteAnnotation = useCallback((id: string) => {
    setAnnotations((prev) => prev.filter((ann) => ann.id !== id));
  }, []);

  const getAnnotationsForPaper = useCallback(
    (paperId: string) => annotations.filter((ann) => ann.paperId === paperId),
    [annotations]
  );

  return { annotations, addAnnotation, updateAnnotation, deleteAnnotation, getAnnotationsForPaper };
}
