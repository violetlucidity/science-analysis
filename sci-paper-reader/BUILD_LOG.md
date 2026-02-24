# Build Log — Sci Paper Reader

## [Phase 6.2] — 2026-02-24 04:20
- Status: COMPLETE
- Files created/modified: src/services/referenceService.ts
- Packages installed: none
- Notes: CrossRef API with score threshold, rate-limited queue, citation marker detection. Fixed no-useless-escape lint error. Build and lint pass.

## [Phase 6.1] — 2026-02-24 04:15
- Status: COMPLETE
- Files created/modified: src/hooks/useDocumentSearch.ts, src/components/SearchBar.tsx
- Packages installed: fuse.js@7
- Notes: Fuse.js search index, keyboard shortcut Ctrl+F/Cmd+F, match counter, Escape-to-clear. Build and lint pass.

## [Phase 5.3] — 2026-02-24 04:00
- Status: COMPLETE
- Files created/modified: src/components/FigureViewer.tsx, src/components/TableViewer.tsx, src/utils/tableParser.ts
- Packages installed: react-zoom-pan-pinch@3, @tanstack/react-table@8
- Notes: Moved parseTablesFromText to utils/. TanStack warning is non-blocking. Build and lint pass.

## [Phase 5.2] — 2026-02-24 03:55
- Status: SKIPPED — ANTHROPIC_API_KEY not set

## [Phase 5.1] — 2026-02-24 03:50
- Status: COMPLETE
- Files created/modified: src/hooks/useAnnotations.ts, src/components/AnnotationPopover.tsx
- Packages installed: none
- Notes: SHA-256 hash fallback for paper ID. Fixed setState-in-effect lint error. Build and lint pass.

## [Phase 4.3] — 2026-02-24 03:40
- Status: COMPLETE
- Files created/modified: src/components/PaperViewer.tsx
- Packages installed: none
- Notes: IntersectionObserver for active section, scroll progress bar, responsive sidebar. Build and lint pass.

## [Phase 4.2] — 2026-02-24 03:35
- Status: COMPLETE
- Files created/modified: src/components/TermTooltip.tsx, src/hooks/useTermTooltip.ts, src/types/react-katex.d.ts
- Packages installed: @floating-ui/react, react-katex, katex, @types/katex
- Notes: Moved hook to separate file. Added eslint-disable for Floating UI callback ref pattern. Build and lint pass.

## [Phase 4.1] — 2026-02-24 03:30
- Status: COMPLETE
- Files created/modified: src/components/AnnotatedText.tsx
- Packages installed: none
- Notes: Term and annotation highlight spans, keyboard navigation, mouseup selection. Build and lint pass.

## [Phase 3.2] — 2026-02-24 03:20
- Status: COMPLETE
- Files created/modified:
  - src/services/termDetectionService.ts
  - src/types/ahocorasick.d.ts
- Packages installed: ahocorasick@1.0.2
- Notes: ahocorasick installed (no substitution needed). Manual TypeScript declaration file added. Word boundary checking added. Build and lint pass.

## [Phase 3.1] — 2026-02-24 03:15
- Status: COMPLETE
- Files created/modified:
  - src/data/statisticalTerms.json (89 entries)
- Packages installed: none
- Notes: 89 entries covering all required domains. Build and lint pass.

## [Phase 2.2] — 2026-02-24 03:05
- Status: COMPLETE
- Files created/modified:
  - src/services/textService.ts
  - src/services/markdownService.ts
  - src/services/ingestService.ts
- Packages installed: unified@11, remark-parse@11, remark-stringify@3
- Notes: Build and lint pass. Fixed no-useless-escape lint error in textService.ts.

## [Phase 2.1] — 2026-02-24 02:55
- Status: COMPLETE
- Files created/modified:
  - src/services/pdfService.ts
- Packages installed: pdfjs-dist@4
- Notes: Fixed TypeScript error — RenderParameters requires `canvas` property. Build and lint pass.

## [Phase 1.2] — 2026-02-24 02:50
- Status: COMPLETE
- Files created/modified:
  - src/types/index.ts (all 9 interfaces: Paper, Section, StatisticalTerm, DetectedTerm, Annotation, PaperMetadata, Reference, Figure, Table)
- Packages installed: none
- Notes: All interfaces fully JSDoc-annotated. Build and lint pass.

## [Phase 1.1] — 2026-02-24 02:45
- Status: COMPLETE
- Files created/modified:
  - sci-paper-reader/ (project root, created via Vite)
  - tailwind.config.ts (custom term-highlight colour: teal-500 #14b8a6)
  - postcss.config.js
  - src/index.css (Tailwind directives)
  - src/App.tsx (cleaned up default template)
  - .prettierrc (default Prettier settings)
  - README.md (architecture overview placeholder)
  - src/components/, src/hooks/, src/services/, src/types/, src/data/, src/utils/, server/ (directories created)
- Packages installed:
  - tailwindcss@3.4.19, postcss@8.5.6, autoprefixer@10.4.24
  - prettier@latest
- Notes:
  - Tailwind CSS v4 was initially installed but lacks tailwindcss init CLI; downgraded to v3 to support tailwind.config.ts file format required by spec.
  - `npm run build` passes with no errors.
  - `npm run lint` passes with no errors.
