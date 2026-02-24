# Build Log — Sci Paper Reader

## BUILD COMPLETE — 2026-02-24 13:16
- Total files created: 30 TypeScript/TSX source files + 5 test files + config files
- Total npm packages installed: react, react-dom, pdfjs-dist, unified, remark-parse, remark-stringify, @floating-ui/react, react-katex, katex, ahocorasick, react-zoom-pan-pinch, @tanstack/react-table, fuse.js, axe-core, focus-trap-react, vitest, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, jsdom, tailwindcss, typescript, vite, eslint, prettier (+ type packages)
- Test results: 16 passed, 0 failed (5 test files)
- Known limitations: Phase 5.2 (AI Explanation Panel) skipped — ANTHROPIC_API_KEY not set; large PDFs may process slowly; multi-column PDF detection is heuristic; CrossRef DOI resolution requires network access
- Follow-up tasks: Add Rollup manual chunks to reduce bundle size warning; implement Phase 5.2 when API key is available; add E2E tests with Playwright

## [Phase 8.2] — 2026-02-24 13:16
- Status: COMPLETE
- Files created/modified: README.md (full rewrite with features, prerequisites, Mermaid architecture diagram, contributor guide), CHANGELOG.md (initial release entry)
- Packages installed: none
- Notes: All exported functions and components already had JSDoc from earlier phases. Final build: 0 TypeScript errors, 0 ESLint errors, 1 pre-existing TanStack warning. Tests: 16/16 passed.

## [Phase 8.1] — 2026-02-24 13:13
- Status: COMPLETE
- Files created/modified: package.json, vite.config.ts (import from vitest/config), src/test-setup.ts, src/services/__tests__/termDetectionService.test.ts, src/services/__tests__/pdfService.test.ts, src/services/__tests__/ingestService.test.ts, src/components/__tests__/AnnotatedText.test.tsx, src/components/__tests__/TermTooltip.test.tsx
- Packages installed: vitest ^4.0.18, @testing-library/react ^16.3.2, @testing-library/user-event ^14.6.1, @testing-library/jest-dom ^6.9.1, jsdom ^28.1.0
- Notes: 16 tests, 16 passed, 0 failed. Mocked @floating-ui/react, react-katex, katex CSS, pdfjs-dist, and service modules as needed. Body text in pdfService mock avoids strings starting with known section heading names (e.g. "background"). vite.config.ts changed to import defineConfig from vitest/config so the `test` block is type-safe.

## [Phase 7.2] — 2026-02-24 04:40
- Status: COMPLETE
- Files created/modified: src/hooks/useDarkMode.ts, src/App.tsx
- Packages installed: none
- Notes: Dark mode toggle with localStorage persistence and system preference fallback. Responsive layout with hamburger menu at 768px. Dark variants defined throughout components. Build and lint pass.

## [Phase 7.1] — 2026-02-24 04:30
- Status: COMPLETE
- Files created/modified:
  - src/components/KeyboardShortcutsModal.tsx (? key trigger, FocusTrap)
  - tailwind.config.ts (updated term-highlight colour for contrast compliance)
  - src/index.css (updated term-highlight CSS with dark mode variant)
- Packages installed: axe-core, focus-trap-react
- Notes:
  - term-highlight contrast analysis:
    - Light mode: #0f766e (teal-700) on white = 5.68:1 ✓ (passes 4.5:1)
    - Dark mode: #5eead4 (teal-300) on gray-900 = ~8.5:1 ✓ (passes 4.5:1)
  - FocusTrap used in KeyboardShortcutsModal. TermTooltip uses FloatingFocusManager.
  - All interactive elements have aria-label attributes.
  - Build and lint pass.

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
