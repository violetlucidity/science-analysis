/**
 * KeyboardShortcutsModal component.
 *
 * A modal dialog listing all keyboard shortcuts, triggered by the '?' key.
 * Uses focus-trap-react to trap focus when open.
 */
import React, { useEffect } from 'react';
import { FocusTrap } from 'focus-trap-react';

/** A keyboard shortcut entry. */
interface Shortcut {
  keys: string[];
  description: string;
}

const SHORTCUTS: Shortcut[] = [
  { keys: ['Ctrl+F', 'Cmd+F'], description: 'Focus search input' },
  { keys: ['Escape'], description: 'Clear search / close tooltip or modal' },
  { keys: ['Enter'], description: 'Next search match' },
  { keys: ['Shift+Enter'], description: 'Previous search match' },
  { keys: ['?'], description: 'Show this keyboard shortcuts help' },
  { keys: ['Tab'], description: 'Navigate between interactive elements' },
  { keys: ['Enter', 'Space'], description: 'Activate highlighted statistical term' },
  { keys: ['←', '→'], description: 'Navigate figures (when viewer is open)' },
];

/** Props for KeyboardShortcutsModal. */
interface KeyboardShortcutsModalProps {
  /** Whether the modal is open. */
  isOpen: boolean;
  /** Called to close the modal. */
  onClose: () => void;
}

/**
 * KeyboardShortcutsModal shows a legend of all keyboard shortcuts.
 * Trapped focus is managed by focus-trap-react. Closes on Escape or backdrop click.
 *
 * @param props - KeyboardShortcutsModalProps
 * @returns The modal element, or null when closed.
 */
const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <FocusTrap>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-title"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              id="shortcuts-title"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              Keyboard Shortcuts
            </h2>
            <button
              onClick={onClose}
              aria-label="Close keyboard shortcuts"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <table className="w-full text-sm" aria-label="Keyboard shortcuts list">
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {SHORTCUTS.map((sc, i) => (
                <tr key={i}>
                  <td className="py-2 pr-4 text-right">
                    <div className="flex gap-1 justify-end flex-wrap">
                      {sc.keys.map((k) => (
                        <kbd
                          key={k}
                          className="rounded bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 text-xs font-mono text-gray-700 dark:text-gray-200"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 text-gray-600 dark:text-gray-300">
                    {sc.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
            Press <kbd className="rounded bg-gray-100 dark:bg-gray-700 px-1 py-0.5 font-mono">?</kbd>{' '}
            to open this dialog at any time.
          </p>
        </div>
      </FocusTrap>
    </div>
  );
};

export default KeyboardShortcutsModal;
