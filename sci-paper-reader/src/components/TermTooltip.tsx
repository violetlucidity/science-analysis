/**
 * TermTooltip component.
 *
 * Displays a floating tooltip with a statistical term's definition, formula,
 * extended explanation, and related terms.
 */
import React, { useState, useEffect } from 'react';
import {
  useFloating,
  autoPlacement,
  offset,
  shift,
  FloatingFocusManager,
} from '@floating-ui/react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import type { StatisticalTerm } from '../types';
import { lookupTerm } from '../services/termDetectionService';

/** Props for the TermTooltip component. */
export interface TermTooltipProps {
  /** The term to display. If null, the tooltip is hidden. */
  term: StatisticalTerm | null;
  /** Whether the tooltip is open. */
  isOpen: boolean;
  /** Callback to close the tooltip. */
  onClose: () => void;
  /** The reference element to anchor the tooltip to. */
  referenceEl: HTMLElement | null;
}

/**
 * TermTooltip renders a floating tooltip for a statistical term, with short
 * definition, optional expanded explanation, LaTeX formula, and related term chips.
 *
 * @param props - TermTooltipProps
 * @returns The tooltip floating element, or null if closed.
 */
const TermTooltip: React.FC<TermTooltipProps> = ({ term, isOpen, onClose, referenceEl }) => {
  const [expanded, setExpanded] = useState(false);
  const [currentTerm, setCurrentTerm] = useState<StatisticalTerm | null>(term);

  useEffect(() => {
    if (term) {
      setCurrentTerm(term);
      setExpanded(false);
    }
  }, [term]);

  // Keyboard: close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen && currentTerm !== null,
    onOpenChange: (open) => {
      if (!open) onClose();
    },
    middleware: [
      offset(8),
      autoPlacement({ allowedPlacements: ['top', 'bottom', 'top-start', 'bottom-start'] }),
      shift({ padding: 8 }),
    ],
    elements: {
      reference: referenceEl,
    },
  });

  if (!isOpen || !currentTerm) return null;

  const handleRelatedTermClick = (relatedTermName: string) => {
    const entry = lookupTerm(relatedTermName);
    if (entry) {
      setCurrentTerm(entry);
      setExpanded(false);
    }
  };

  return (
    <FloatingFocusManager context={context} modal={false}>
      <div
        // eslint-disable-next-line react-hooks/refs
        ref={refs.setFloating}
        style={floatingStyles}
        className="z-50 w-80 max-w-xs rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
        aria-live="polite"
        role="tooltip"
        data-testid="term-tooltip"
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              {currentTerm.term}
            </h3>
            <button
              onClick={onClose}
              aria-label="Close tooltip"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0"
            >
              ✕
            </button>
          </div>

          {/* Short definition */}
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            {currentTerm.shortDefinition}
          </p>

          {/* Learn more accordion */}
          <button
            className="mt-3 text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 flex items-center gap-1"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            aria-controls="tooltip-extended"
            data-testid="learn-more-btn"
          >
            {expanded ? '▲ Less' : '▼ Learn more'}
          </button>

          {expanded && (
            <div id="tooltip-extended" className="mt-3 space-y-2" data-testid="extended-explanation">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {currentTerm.extendedExplanation}
              </p>

              {currentTerm.formula && (
                <div className="mt-2 rounded bg-gray-50 dark:bg-gray-900 p-2 text-center text-sm overflow-x-auto">
                  <InlineMath math={currentTerm.formula} />
                </div>
              )}

              {currentTerm.exampleUsage && (
                <p className="mt-1 text-xs italic text-gray-500 dark:text-gray-400">
                  {currentTerm.exampleUsage}
                </p>
              )}
            </div>
          )}

          {/* Related terms chips */}
          {currentTerm.relatedTerms.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Related:
              </p>
              <div className="flex flex-wrap gap-1">
                {currentTerm.relatedTerms.map((rt) => (
                  <button
                    key={rt}
                    onClick={() => handleRelatedTermClick(rt)}
                    className="rounded-full bg-teal-50 dark:bg-teal-900 px-2 py-0.5 text-xs text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-800"
                    aria-label={`View term: ${rt}`}
                  >
                    {rt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </FloatingFocusManager>
  );
};

export default TermTooltip;
