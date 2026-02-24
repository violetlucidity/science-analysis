/**
 * Hook for managing term tooltip state with hover debounce and text selection support.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import type { StatisticalTerm } from '../types';

/** Return value from useTermTooltip. */
export interface UseTermTooltipReturn {
  /** The currently displayed term, or null if none. */
  tooltipTerm: StatisticalTerm | null;
  /** Whether the tooltip is currently open. */
  isOpen: boolean;
  /** The HTML element serving as the tooltip's anchor. */
  referenceEl: HTMLElement | null;
  /**
   * Opens the tooltip for the given term after the debounce delay.
   * @param term - The term to display.
   * @param anchor - The element to anchor the tooltip to.
   */
  openTerm: (term: StatisticalTerm, anchor: HTMLElement) => void;
  /** Closes the tooltip immediately. */
  closeTerm: () => void;
}

/**
 * Manages tooltip state, including hover debounce and selection handling.
 *
 * @returns State and handlers for a term tooltip.
 */
export function useTermTooltip(): UseTermTooltipReturn {
  const [tooltipTerm, setTooltipTerm] = useState<StatisticalTerm | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [referenceEl, setReferenceEl] = useState<HTMLElement | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openTerm = useCallback((term: StatisticalTerm, anchor: HTMLElement) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setReferenceEl(anchor);
      setTooltipTerm(term);
      setIsOpen(true);
    }, 300);
  }, []);

  const closeTerm = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setIsOpen(false);
    setTooltipTerm(null);
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  return { tooltipTerm, isOpen, referenceEl, openTerm, closeTerm };
}
