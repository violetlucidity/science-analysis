# Changelog

All notable changes to Sci Paper Reader are documented here.

## [1.0.0] — 2026-02-24

Initial release.

### Added

**Phase 1 — Project Scaffolding**
- Vite + React 19 + TypeScript project with Tailwind CSS v3, ESLint, and Prettier
- Custom `term-highlight` colour (`#0f766e` / teal-700) with WCAG 4.5:1-compliant dark-mode variant (`#5eead4` / teal-300)
- Core TypeScript interfaces: `Paper`, `Section`, `StatisticalTerm`, `DetectedTerm`, `Annotation`, `PaperMetadata`, `Reference`, `Figure`, `Table`

**Phase 2 — Document Ingestion**
- `pdfService` — PDF parsing with pdfjs-dist: text extraction, section detection, page image capture, multi-column detection
- `textService` — Plain text parser with blank-line splitting and heading detection
- `markdownService` — Markdown parser using unified/remark pipeline
- `ingestService` — Unified entry point dispatching by MIME type

**Phase 3 — Statistical Term Detection**
- 89-entry `statisticalTerms.json` dictionary spanning descriptive statistics, inferential statistics, effect sizes, regression/modelling, Bayesian methods, survival analysis, and methodological terms
- `termDetectionService` — Aho-Corasick automaton with word-boundary checking and longest-match overlap resolution

**Phase 4 — Rendering Engine**
- `AnnotatedText` — Interleaved plain/highlighted text spans; keyboard-accessible term buttons
- `TermTooltip` — Floating tooltip (Floating UI) with 300 ms hover debounce, InlineMath formula rendering, related-term chips, focus trapping
- `PaperViewer` — Main reading layout with sticky sidebar, IntersectionObserver active-section tracking, reading progress bar, and DOI hyperlink

**Phase 5 — Interactive Features**
- `useAnnotations` hook — CRUD with localStorage persistence; SHA-256 hash fallback for papers without DOI
- `AnnotationPopover` — Colour swatch selector, note textarea, copy, edit/delete modes
- Phase 5.2 (AI Explanation Panel) — Skipped: `ANTHROPIC_API_KEY` not set in build environment
- `FigureViewer` — Zoomable/pannable lightbox using react-zoom-pan-pinch
- `TableViewer` — Sortable columns via @tanstack/react-table, CSV download
- `tableParser` utility — Detects tab-delimited and pipe-delimited table blocks

**Phase 6 — Search and Navigation**
- `useDocumentSearch` hook — Fuse.js full-text index over all sections
- `SearchBar` — `Ctrl+F`/`Cmd+F` shortcut, match counter, prev/next navigation, Escape-to-clear
- `referenceService` — Reference parsing, CrossRef DOI resolution (score ≥ 50), 5 req/sec rate limiting
- In-text citation buttons with smooth-scroll and PubMed search link

**Phase 7 — Accessibility and Polish**
- axe-core and focus-trap-react integration; all critical/serious violations resolved
- WCAG 4.5:1 contrast verified for term highlights in both colour modes
- `KeyboardShortcutsModal` — `?` key opens shortcut legend; focus-trapped
- `useDarkMode` hook — `dark` class toggling with localStorage persistence and `prefers-color-scheme` fallback
- Responsive layout: sidebar collapses to hamburger at 768 px; dark Tailwind variants throughout
- Explicit `dark:` colours for tooltips, annotations, progress bar, and explanation panel

**Phase 8 — Testing and Documentation**
- 16-test suite (vitest + @testing-library/react): term detection, PDF parsing, ingestion dispatch, AnnotatedText rendering, TermTooltip behaviour
- Full JSDoc coverage on all exported functions and React components
- This README with architecture Mermaid diagram and contributor guide
- BUILD_LOG.md tracking all phases

### Known Limitations

- Phase 5.2 (AI Explanation Panel) requires `ANTHROPIC_API_KEY` and the Express proxy server; skipped in this build
- Large PDFs (100+ pages) may take several seconds to process in the browser
- Multi-column PDF layout detection is heuristic; column order may not always be correct
- CrossRef DOI resolution depends on network availability; unresolved references fall back to PubMed search only
