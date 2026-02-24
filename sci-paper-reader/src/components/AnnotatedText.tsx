/**
 * AnnotatedText component.
 *
 * Renders body text with overlapping highlights for detected statistical terms
 * and user annotations. Term spans are keyboard-accessible.
 */
import React, { useCallback } from 'react';
import type { DetectedTerm, Annotation } from '../types';

/** Props for the AnnotatedText component. */
interface AnnotatedTextProps {
  /** The full text to render. */
  text: string;
  /** Statistical terms detected in the text. */
  detectedTerms: DetectedTerm[];
  /** User annotations on the text. */
  annotations: Annotation[];
  /** Called when a statistical term span is clicked. */
  onTermClick: (term: DetectedTerm) => void;
  /** Called when the user selects a range of text. */
  onTextSelect: (start: number, end: number, selectedText: string) => void;
}

/** A segment of text with optional highlight metadata. */
interface TextSegment {
  text: string;
  startIndex: number;
  endIndex: number;
  termMatch?: DetectedTerm;
  annotationMatch?: Annotation;
}

/**
 * Splits text into interleaved plain and highlighted segments based on
 * detected terms and annotations.
 *
 * @param text - The full text string.
 * @param detectedTerms - Array of detected statistical terms with offsets.
 * @param annotations - Array of user annotations with offsets.
 * @returns Ordered array of text segments.
 */
function buildSegments(
  text: string,
  detectedTerms: DetectedTerm[],
  annotations: Annotation[]
): TextSegment[] {
  // Build a set of all highlight spans sorted by start index
  interface Span {
    start: number;
    end: number;
    termMatch?: DetectedTerm;
    annotationMatch?: Annotation;
  }

  const spans: Span[] = [];

  for (const term of detectedTerms) {
    spans.push({ start: term.startIndex, end: term.endIndex, termMatch: term });
  }
  for (const ann of annotations) {
    spans.push({ start: ann.startIndex, end: ann.endIndex, annotationMatch: ann });
  }

  // Sort by start, then by length descending
  spans.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return (b.end - b.start) - (a.end - a.start);
  });

  // Remove overlaps
  const resolved: Span[] = [];
  let cursor = 0;
  for (const span of spans) {
    if (span.start < cursor) continue;
    resolved.push(span);
    cursor = span.end;
  }

  const segments: TextSegment[] = [];
  let pos = 0;

  for (const span of resolved) {
    if (span.start > pos) {
      segments.push({
        text: text.slice(pos, span.start),
        startIndex: pos,
        endIndex: span.start,
      });
    }
    segments.push({
      text: text.slice(span.start, span.end),
      startIndex: span.start,
      endIndex: span.end,
      termMatch: span.termMatch,
      annotationMatch: span.annotationMatch,
    });
    pos = span.end;
  }

  if (pos < text.length) {
    segments.push({
      text: text.slice(pos),
      startIndex: pos,
      endIndex: text.length,
    });
  }

  return segments;
}

/**
 * AnnotatedText renders a string of text with highlighted spans for detected
 * statistical terms and user annotations. Term spans support keyboard interaction.
 *
 * @param props - AnnotatedTextProps
 * @returns The rendered annotated text as a React element.
 */
const AnnotatedText: React.FC<AnnotatedTextProps> = ({
  text,
  detectedTerms,
  annotations,
  onTermClick,
  onTextSelect,
}) => {
  const segments = buildSegments(text, detectedTerms, annotations);

  /**
   * Handles mouseup events to fire onTextSelect with selected text offsets.
   */
  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      const range = selection.getRangeAt(0);
      const container = e.currentTarget;

      // Use selection toString for text
      const selectedText = selection.toString();
      if (!selectedText) return;

      // Calculate character offsets relative to the container
      const preRange = document.createRange();
      preRange.selectNodeContents(container);
      preRange.setEnd(range.startContainer, range.startOffset);
      const start = preRange.toString().length;
      const end = start + selectedText.length;

      onTextSelect(start, end, selectedText);
    },
    [onTextSelect]
  );

  return (
    <span
      className="whitespace-pre-wrap leading-relaxed"
      onMouseUp={handleMouseUp}
      data-testid="annotated-text"
    >
      {segments.map((seg, idx) => {
        if (seg.termMatch) {
          const term = seg.termMatch;
          return (
            <span
              key={idx}
              className="term-highlight cursor-pointer"
              tabIndex={0}
              role="button"
              aria-label={`Statistical term: ${term.dictionaryEntry.term}`}
              onClick={() => onTermClick(term)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onTermClick(term);
                }
              }}
              data-term={term.term}
              data-testid={`term-span-${term.term}`}
            >
              {seg.text}
            </span>
          );
        }

        if (seg.annotationMatch) {
          const ann = seg.annotationMatch;
          const bgColour = annotationColourClass(ann.colour);
          return (
            <span
              key={idx}
              className={`${bgColour} cursor-pointer rounded`}
              title={ann.note || 'Annotation'}
              data-annotation-id={ann.id}
            >
              {seg.text}
            </span>
          );
        }

        return <span key={idx}>{seg.text}</span>;
      })}
    </span>
  );
};

/**
 * Maps an annotation colour name to a Tailwind CSS background class.
 *
 * @param colour - The colour name stored on the annotation.
 * @returns The corresponding Tailwind class string.
 */
function annotationColourClass(colour: string): string {
  const map: Record<string, string> = {
    yellow: 'bg-yellow-200 dark:bg-yellow-800',
    green: 'bg-green-200 dark:bg-green-900',
    blue: 'bg-blue-200 dark:bg-blue-900',
    pink: 'bg-pink-200 dark:bg-pink-900',
  };
  return map[colour] ?? 'bg-yellow-200 dark:bg-yellow-800';
}

export default AnnotatedText;
