/**
 * Root application component for Sci Paper Reader.
 *
 * Provides the top-level layout with dark mode toggle, keyboard shortcut modal,
 * file upload, and document viewer.
 */
import React, { useState, useCallback, useEffect } from 'react';
import './index.css';
import type { Paper } from './types';
import { ingestDocument } from './services/ingestService';
import PaperViewer from './components/PaperViewer';
import SearchBar from './components/SearchBar';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import { useDarkMode } from './hooks/useDarkMode';
import { useAnnotations } from './hooks/useAnnotations';
import { useDocumentSearch } from './hooks/useDocumentSearch';

/**
 * App is the root component, managing global state for paper loading,
 * dark mode, search, and keyboard shortcut modal.
 *
 * @returns The full application layout.
 */
function App() {
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isDark, toggleDark] = useDarkMode();
  const { annotations } = useAnnotations();
  const search = useDocumentSearch(paper);

  // Global '?' key to open keyboard shortcuts modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        setShowShortcuts(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const parsed = await ingestDocument(file);
      setPaper(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse document');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 flex items-center gap-4 flex-wrap">
        <h1 className="text-lg font-bold text-teal-700 dark:text-teal-300 shrink-0">
          {import.meta.env.VITE_APP_TITLE || 'Sci Paper Reader'}
        </h1>

        <div className="flex-1 min-w-0">
          {paper && (
            <SearchBar
              query={search.query}
              matchCount={search.matchCount}
              currentMatchIndex={search.currentMatchIndex}
              onQueryChange={search.setQuery}
              onNextMatch={search.nextMatch}
              onPrevMatch={search.prevMatch}
              onClear={search.clearSearch}
            />
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label className="cursor-pointer rounded border border-teal-500 text-teal-600 dark:text-teal-400 text-xs px-3 py-1.5 hover:bg-teal-50 dark:hover:bg-teal-900 transition-colors">
            <input
              type="file"
              accept=".pdf,.txt,.md"
              className="sr-only"
              onChange={handleFileChange}
              aria-label="Upload document"
            />
            Upload Paper
          </label>

          <button
            onClick={toggleDark}
            className="rounded border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? '☀' : '🌙'}
          </button>

          <button
            onClick={() => setShowShortcuts(true)}
            className="rounded border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700"
            aria-label="Show keyboard shortcuts"
            title="Keyboard shortcuts (?)"
          >
            ?
          </button>
        </div>
      </header>

      {/* Main content */}
      <main>
        {loading && (
          <div className="flex items-center justify-center h-64" aria-live="polite">
            <div className="text-gray-500 dark:text-gray-400 animate-pulse">
              Parsing document…
            </div>
          </div>
        )}

        {error && (
          <div className="m-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-4">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {!loading && !paper && !error && (
          <div className="flex flex-col items-center justify-center h-96 text-center px-4">
            <div className="text-6xl mb-4" aria-hidden="true">📄</div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Upload a scientific paper
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
              Supported formats: PDF, plain text (.txt), and Markdown (.md).
              Statistical terms will be automatically detected and annotated.
            </p>
          </div>
        )}

        {paper && !loading && (
          <PaperViewer
            paper={paper}
            annotations={annotations}
          />
        )}
      </main>

      {/* Keyboard shortcuts modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}

export default App;
