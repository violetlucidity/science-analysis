# Build Log — Sci Paper Reader

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
