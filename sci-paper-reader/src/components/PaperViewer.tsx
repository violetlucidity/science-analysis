/**
 * PaperViewer component.
 *
 * The main reading interface for a scientific paper. Renders a sticky sidebar
 * with section navigation, a reading progress bar, paper header, and annotated
 * section text.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Paper, DetectedTerm, Annotation } from '../types';
import { detectTerms } from '../services/termDetectionService';
import AnnotatedText from './AnnotatedText';
import TermTooltip from './TermTooltip';
import { useTermTooltip } from '../hooks/useTermTooltip';

/** Props for the PaperViewer component. */
interface PaperViewerProps {
  /** The paper to display. */
  paper: Paper;
  /** User annotations for this paper. */
  annotations?: Annotation[];
  /** Callback when a text range is selected. */
  onTextSelect?: (start: number, end: number, selectedText: string, sectionId: string) => void;
}

/**
 * PaperViewer renders the full paper reading interface, including:
 * - Sticky left sidebar with section navigation
 * - IntersectionObserver-based active section highlighting in sidebar
 * - Reading progress bar
 * - Paper header with title, authors, DOI, journal, and year
 * - Each section rendered with AnnotatedText and term tooltip support
 *
 * @param props - PaperViewerProps
 * @returns The complete paper viewer layout.
 */
const PaperViewer: React.FC<PaperViewerProps> = ({ paper, annotations = [], onTextSelect }) => {
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [readingProgress, setReadingProgress] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { tooltipTerm, isOpen: tooltipOpen, referenceEl, openTerm, closeTerm } = useTermTooltip();

  // Pre-compute detected terms for each section
  const sectionTerms = React.useMemo(
    () =>
      Object.fromEntries(
        paper.sections.map((sec) => [sec.id, detectTerms(sec.bodyText)])
      ),
    [paper.sections]
  );

  // IntersectionObserver to highlight active section in sidebar
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const sectionEntries = new Map<string, IntersectionObserverEntry>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          sectionEntries.set(entry.target.id, entry);
        });
        // Find the section most visible (highest intersectionRatio)
        let bestId = '';
        let bestRatio = -1;
        sectionEntries.forEach((entry, id) => {
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestId = id;
          }
        });
        if (bestId) setActiveSectionId(bestId);
      },
      { threshold: [0, 0.1, 0.5, 1.0], rootMargin: '-10% 0px -70% 0px' }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    observers.push(observer);
    return () => observers.forEach((o) => o.disconnect());
  }, [paper.sections]);

  // Reading progress bar on scroll
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const total = scrollHeight - clientHeight;
    if (total > 0) setReadingProgress((scrollTop / total) * 100);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToSection = (sectionId: string) => {
    const el = sectionRefs.current[sectionId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setSidebarOpen(false);
  };

  const handleTermClick = useCallback(
    (term: DetectedTerm, anchor: HTMLElement) => {
      openTerm(term.dictionaryEntry, anchor);
    },
    [openTerm]
  );

  const getAnnotationsForSection = (): Annotation[] =>
    annotations.filter((a) => a.paperId === paper.doi || a.paperId === paper.id);

  return (
    <div className="relative flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      {/* Reading progress bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-teal-500 dark:bg-teal-400 z-50 transition-all"
        style={{ width: `${readingProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(readingProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      />

      {/* Mobile sidebar toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 rounded-full bg-teal-500 p-2 text-white shadow-lg"
        onClick={() => setSidebarOpen((o) => !o)}
        aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left sidebar */}
      <nav
        className={`
          fixed md:sticky top-0 left-0 z-30 h-full w-64 flex-shrink-0
          bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          overflow-y-auto transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        aria-label="Section navigation"
      >
        <div className="p-4 pt-8 md:pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
            Sections
          </p>
          <ul className="space-y-1">
            {paper.sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left rounded px-2 py-1.5 text-sm transition-colors ${
                    activeSectionId === section.id
                      ? 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-current={activeSectionId === section.id ? 'location' : undefined}
                >
                  {section.heading}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Main content */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Paper header */}
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {paper.title}
            </h1>
            {paper.authors.length > 0 && (
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {paper.authors.join(', ')}
              </p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              {paper.metadata.journal && (
                <span>
                  <span className="font-medium">Journal:</span> {paper.metadata.journal}
                </span>
              )}
              {paper.metadata.year && (
                <span>
                  <span className="font-medium">Year:</span> {paper.metadata.year}
                </span>
              )}
              {paper.doi && (
                <span>
                  <span className="font-medium">DOI:</span>{' '}
                  <a
                    href={`https://doi.org/${paper.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 dark:text-teal-400 hover:underline"
                    aria-label={`DOI: ${paper.doi}`}
                  >
                    {paper.doi}
                  </a>
                </span>
              )}
            </div>
          </header>

          {/* Warnings */}
          {paper.warnings.length > 0 && (
            <div className="mb-6 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 p-4">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Parsing warnings:
              </p>
              <ul className="mt-1 text-sm text-amber-700 dark:text-amber-400 list-disc pl-5">
                {paper.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Sections */}
          {paper.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              ref={(el) => {
                sectionRefs.current[section.id] = el;
              }}
              className="mb-10"
              aria-labelledby={`heading-${section.id}`}
            >
              <h2
                id={`heading-${section.id}`}
                className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 pb-1 border-b border-gray-200 dark:border-gray-700"
              >
                {section.heading}
              </h2>
              <div className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                <AnnotatedText
                  text={section.bodyText}
                  detectedTerms={sectionTerms[section.id] || []}
                  annotations={getAnnotationsForSection()}
                  onTermClick={(term) => {
                    const target = document.querySelector(
                      `[data-term="${term.term}"]`
                    ) as HTMLElement | null;
                    handleTermClick(term, target || document.body);
                  }}
                  onTextSelect={(start, end, selectedText) => {
                    onTextSelect?.(start, end, selectedText, section.id);
                  }}
                />
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Term tooltip */}
      <TermTooltip
        term={tooltipTerm}
        isOpen={tooltipOpen}
        onClose={closeTerm}
        referenceEl={referenceEl}
      />
    </div>
  );
};

export default PaperViewer;
