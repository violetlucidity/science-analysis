/**
 * SearchBar component.
 *
 * Provides a keyboard-shortcut-activated search input (Ctrl+F / Cmd+F)
 * with match navigation and Escape-to-clear functionality.
 */
import React, { useRef, useEffect } from 'react';

/** Props for SearchBar. */
interface SearchBarProps {
  /** The current search query. */
  query: string;
  /** Total number of matches. */
  matchCount: number;
  /** Index of the current match (0-based). */
  currentMatchIndex: number;
  /** Called when the query changes. */
  onQueryChange: (q: string) => void;
  /** Called to advance to the next match. */
  onNextMatch: () => void;
  /** Called to go to the previous match. */
  onPrevMatch: () => void;
  /** Called to clear the search. */
  onClear: () => void;
}

/**
 * SearchBar renders a search input with match counter and previous/next navigation.
 * Activated by Ctrl+F or Cmd+F; dismissed by Escape.
 *
 * @param props - SearchBarProps
 * @returns The search bar element.
 */
const SearchBar: React.FC<SearchBarProps> = ({
  query,
  matchCount,
  currentMatchIndex,
  onQueryChange,
  onNextMatch,
  onPrevMatch,
  onClear,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Register Ctrl+F / Cmd+F keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      onClear();
      inputRef.current?.blur();
    } else if (e.key === 'Enter') {
      if (e.shiftKey) {
        onPrevMatch();
      } else {
        onNextMatch();
      }
    }
  };

  return (
    <div
      className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm px-3 py-1.5"
      role="search"
      aria-label="Document search"
    >
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search document… (Ctrl+F)"
        className="flex-1 min-w-0 text-sm bg-transparent text-gray-800 dark:text-gray-200 outline-none placeholder-gray-400"
        aria-label="Search input"
        aria-controls="search-results"
      />

      {/* Match counter */}
      {query && (
        <span
          className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap"
          aria-live="polite"
          aria-atomic="true"
          id="search-results"
        >
          {matchCount === 0
            ? 'No matches'
            : `${currentMatchIndex + 1} of ${matchCount}`}
        </span>
      )}

      {/* Navigation */}
      {matchCount > 0 && (
        <>
          <button
            onClick={onPrevMatch}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-0.5"
            aria-label="Previous match"
          >
            ▲
          </button>
          <button
            onClick={onNextMatch}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-0.5"
            aria-label="Next match"
          >
            ▼
          </button>
        </>
      )}

      {/* Clear button */}
      {query && (
        <button
          onClick={onClear}
          className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-0.5"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;
