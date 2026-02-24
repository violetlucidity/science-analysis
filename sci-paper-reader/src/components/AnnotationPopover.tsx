/**
 * AnnotationPopover component.
 *
 * Shown when the user selects text in AnnotatedText. Allows creating a new
 * annotation with a colour and optional note, or editing/deleting an existing one.
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Annotation } from '../types';

/** Colour options for annotations. */
const COLOUR_OPTIONS: { name: Annotation['colour']; label: string; bg: string }[] = [
  { name: 'yellow', label: 'Yellow', bg: 'bg-yellow-300' },
  { name: 'green', label: 'Green', bg: 'bg-green-400' },
  { name: 'blue', label: 'Blue', bg: 'bg-blue-400' },
  { name: 'pink', label: 'Pink', bg: 'bg-pink-400' },
];

/** Props for AnnotationPopover. */
interface AnnotationPopoverProps {
  /** Whether the popover is visible. */
  isOpen: boolean;
  /** The currently selected text range. */
  selectedText: string;
  /** Start character offset of the selection. */
  startIndex: number;
  /** End character offset of the selection. */
  endIndex: number;
  /** The paper ID for the annotation. */
  paperId: string;
  /** Existing annotation to edit (if clicking an existing highlight). */
  existingAnnotation?: Annotation | null;
  /** Called to add a new annotation. */
  onAdd: (annotation: Omit<Annotation, 'id' | 'createdAt'>) => void;
  /** Called to update an existing annotation. */
  onUpdate: (id: string, updates: Partial<Omit<Annotation, 'id'>>) => void;
  /** Called to delete an existing annotation. */
  onDelete: (id: string) => void;
  /** Called to close the popover. */
  onClose: () => void;
}

/**
 * AnnotationPopover renders a popover for creating, editing, or deleting text annotations.
 * Shows colour swatches, a note textarea, and action buttons.
 *
 * @param props - AnnotationPopoverProps
 * @returns The popover element, or null if not open.
 */
const AnnotationPopover: React.FC<AnnotationPopoverProps> = ({
  isOpen,
  selectedText,
  startIndex,
  endIndex,
  paperId,
  existingAnnotation,
  onAdd,
  onUpdate,
  onDelete,
  onClose,
}) => {
  // Derive initial values from props — component should be mounted with a key
  // that changes when existingAnnotation changes to force fresh state.
  const initialColour = useMemo(
    () => existingAnnotation?.colour ?? 'yellow',
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const initialNote = useMemo(
    () => existingAnnotation?.note ?? '',
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [colour, setColour] = useState<string>(initialColour);
  const [note, setNote] = useState<string>(initialNote);
  const [showNote, setShowNote] = useState(!!existingAnnotation?.note);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (existingAnnotation) {
      onUpdate(existingAnnotation.id, { colour, note });
    } else {
      onAdd({ paperId, startIndex, endIndex, colour, note });
    }
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedText).catch(() => {});
    onClose();
  };

  const handleDelete = () => {
    if (existingAnnotation) {
      onDelete(existingAnnotation.id);
    }
    onClose();
  };

  return (
    <div
      ref={popoverRef}
      className="fixed z-40 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-3 w-64"
      style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      role="dialog"
      aria-label={existingAnnotation ? 'Edit annotation' : 'Add annotation'}
      aria-modal="true"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {existingAnnotation ? 'Edit annotation' : 'Highlight text'}
        </p>
        <button
          onClick={onClose}
          aria-label="Close annotation popover"
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      {/* Colour swatches */}
      <div className="flex gap-2 mb-3">
        {COLOUR_OPTIONS.map((c) => (
          <button
            key={c.name}
            className={`w-6 h-6 rounded-full ${c.bg} border-2 transition-all ${
              colour === c.name ? 'border-gray-800 dark:border-white scale-110' : 'border-transparent'
            }`}
            onClick={() => setColour(c.name)}
            aria-label={`${c.label} highlight`}
            aria-pressed={colour === c.name}
            title={c.label}
          />
        ))}
      </div>

      {/* Note toggle */}
      {!showNote && (
        <button
          onClick={() => setShowNote(true)}
          className="text-xs text-teal-600 dark:text-teal-400 hover:underline mb-2 block"
          aria-label="Add a note to this annotation"
        >
          + Add note
        </button>
      )}

      {showNote && (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note…"
          className="w-full text-xs rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 mb-2 resize-none"
          rows={3}
          aria-label="Annotation note"
        />
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 rounded bg-teal-500 hover:bg-teal-600 text-white text-xs py-1 font-medium"
          aria-label={existingAnnotation ? 'Save changes' : 'Save annotation'}
        >
          {existingAnnotation ? 'Save' : 'Highlight'}
        </button>
        <button
          onClick={handleCopy}
          className="rounded border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-700"
          aria-label="Copy selected text"
        >
          Copy
        </button>
        {existingAnnotation && (
          <button
            onClick={handleDelete}
            className="rounded border border-red-200 dark:border-red-700 text-red-500 dark:text-red-400 text-xs px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900"
            aria-label="Delete annotation"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default AnnotationPopover;
