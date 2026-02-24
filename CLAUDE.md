# CLAUDE.md — Sci-Paper-Reader Build Instructions

## Session Start Instruction (paste this into the Claude Code web task field)

> Read this CLAUDE.md file in full before doing anything else. Then execute
> every phase and prompt in sequence from Phase 1 through Phase 8. After each
> numbered prompt completes, verify the build is clean, commit all changes to
> the current branch with a descriptive commit message, and then proceed to the
> next prompt. Do not skip any step. If a step fails, fix the error before
> moving on. Append a timestamped entry to BUILD_LOG.md after each completed
> prompt.

---

## Project Goal

Build a web application called `sci-paper-reader`: an interactive reader for
scientific papers with PDF/text ingestion, automatic detection and tooltip
explanation of statistical terms, user annotations, AI-powered explanations,
figure/table viewing, full-text search, and reference linking.

---

## Operating Rules

These rules apply for the entire session without exception.

1. **Execute prompts in strict sequence.** Do not begin prompt N+1 until
   prompt N is fully complete.

2. **Build-check after every prompt.** Run `npm run build` and `npm run lint`
   after each numbered prompt. If either fails, fix all errors before
   proceeding.

3. **Commit after every prompt.** Use the format:
   `[PhaseX.Y] <short description of what was built>`
   Example: `[Phase1.1] Scaffold Vite + React + TypeScript project`

4. **Log progress.** Append to `BUILD_LOG.md` in the project root after each
   prompt, using this format:
   ```
   ## [Phase X.Y] — YYYY-MM-DD HH:MM
   - Status: COMPLETE
   - Files created/modified: <list>
   - Packages installed: <list>
   - Notes: <any warnings or decisions made>
   ```

5. **Handle errors autonomously.** Attempt to resolve any error independently.
   If an npm package is unavailable or incompatible, substitute the closest
   equivalent and note the substitution in BUILD_LOG.md.

6. **Do not move to Phase 5.2 without an API key.** If the environment
   variable `ANTHROPIC_API_KEY` is not set, skip prompt 5.2 and log:
   `SKIPPED — ANTHROPIC_API_KEY not set`. Continue with 5.3.

7. **Final verification.** After Phase 8.2, run `npm run build` and
   `npm run test` one final time. Log the results as `BUILD COMPLETE` in
   BUILD_LOG.md.

---

## Phase 1 — Project Scaffolding

### Prompt 1.1 — Initialise the Project

Create a new web application called `sci-paper-reader` using **React**,
**TypeScript**, and **Vite**. Configure:

- **Tailwind CSS** for styling (include `tailwind.config.ts` with a custom
  `term-highlight` colour: `teal-500`)
- **ESLint** with TypeScript rules
- **Prettier** with default settings

Create the following directory structure inside `src/`:

```
src/
  components/
  hooks/
  services/
  types/
  data/
  utils/
server/
public/
```

Generate `README.md` with an architecture overview section (leave it as a
placeholder to be filled in at Phase 8.2). Confirm the dev server starts
without errors (`npm run dev`).

---

### Prompt 1.2 — Define Core Data Types

Create `src/types/index.ts` with the following fully exported, fully JSDoc-
annotated TypeScript interfaces:

```ts
Paper          // id, title, authors, abstract, sections, doi, metadata, warnings
Section        // id, heading, bodyText, figures, tables
StatisticalTerm // term, aliases, shortDefinition, extendedExplanation,
                //  formula, exampleUsage, relatedTerms
DetectedTerm   // term, startIndex, endIndex, dictionaryEntry
Annotation     // id, paperId, startIndex, endIndex, colour, note, createdAt
PaperMetadata  // journal, year, doi, keywords, citationCount
Reference      // index, rawText, doi (optional)
Figure         // id, dataUrl, caption, pageNumber
Table          // id, headers, rows, caption
```

---

## Phase 2 — Document Ingestion

### Prompt 2.1 — PDF Parser

Install `pdfjs-dist`.

Create `src/services/pdfService.ts`. It must:

1. Accept a `File` object.
2. Extract raw text page by page using pdf.js.
3. Identify sections — Abstract, Introduction, Methods, Results, Discussion,
   References — via regex on heading patterns (capitalised lines, lines ending
   in a colon, numbered headings).
4. Flag suspected multi-column layouts in the `warnings` string array on the
   returned `Paper` object.
5. Capture each page as a canvas data URL and attach to the relevant section's
   `figures` array.
6. Return a fully typed `Paper` object.

Export: `parsePdf(file: File): Promise<Paper>`

---

### Prompt 2.2 — Text and Markdown Parsers + Unified Entry Point

Install `unified`, `remark-parse`, `remark-stringify`.

Create:
- `src/services/textService.ts` — parse `.txt` by splitting on blank lines;
  detect section headings via fully-capitalised lines or lines ending in `:`.
- `src/services/markdownService.ts` — use the remark pipeline to map headings
  to `Section` objects.
- `src/services/ingestService.ts` — export a single function:

```ts
ingestDocument(file: File): Promise<Paper>
```

Dispatch to the correct parser based on MIME type:
- `application/pdf` → pdfService
- `text/plain` → textService
- `text/markdown` → markdownService

---

## Phase 3 — Statistical Term Detection

### Prompt 3.1 — Statistical Term Dictionary

Create `src/data/statisticalTerms.json`.

Each entry must conform exactly to this schema:

```json
{
  "term": "string",
  "aliases": ["string"],
  "shortDefinition": "string (one sentence)",
  "extendedExplanation": "string (two to four sentences)",
  "formula": "string (LaTeX or empty string)",
  "exampleUsage": "string (one sentence from a plausible study context)",
  "relatedTerms": ["string"]
}
```

Include **at minimum 80 entries** spanning:

| Domain | Terms to include |
|---|---|
| Descriptive statistics | mean, median, mode, standard deviation, variance, standard error, interquartile range, skewness, kurtosis, coefficient of variation |
| Inferential statistics | p-value, null hypothesis, alternative hypothesis, Type I error, Type II error, statistical power, confidence interval, t-test, paired t-test, ANOVA, MANOVA, chi-squared test, Fisher's exact test, Mann-Whitney U test, Wilcoxon signed-rank test, Kruskal-Wallis test, Bonferroni correction, false discovery rate, Benjamini-Hochberg procedure, multiple comparisons |
| Effect sizes | Cohen's d, Cohen's f, eta-squared, partial eta-squared, omega-squared, odds ratio, relative risk, risk difference, number needed to treat, Pearson's r, Spearman's rho |
| Regression & modelling | linear regression, logistic regression, Poisson regression, mixed-effects model, random effects, fixed effects, multicollinearity, heteroscedasticity, R-squared, adjusted R-squared, AIC, BIC, residuals, overfitting, cross-validation, LASSO, ridge regression |
| Bayesian methods | Bayesian inference, prior distribution, posterior distribution, likelihood, Bayes factor, credible interval, Markov chain Monte Carlo, Bayesian Information Criterion |
| Survival analysis | Kaplan-Meier estimator, log-rank test, Cox proportional hazards model, hazard ratio, censoring, survival function, median survival time |
| Methodological | randomisation, blinding, double-blind, placebo, intention-to-treat, per-protocol analysis, crossover design, factorial design, power calculation, sample size, attrition bias, selection bias, confounding variable, internal validity, external validity, replication |

---

### Prompt 3.2 — Term Detection Engine

Install `ahocorasick` (substitute `aho-corasick-node` or implement a trie
manually if incompatible; log any substitution).

Create `src/services/termDetectionService.ts`. It must:

1. Build an Aho-Corasick automaton over all terms **and** all aliases at module
   initialisation. Cache the automaton — do not rebuild on every call.
2. Accept a body text string and return `DetectedTerm[]` with correct character
   offsets.
3. Be case-insensitive in matching; preserve original casing in results.
4. Resolve overlapping matches by preferring the **longest** match.

Export: `detectTerms(text: string): DetectedTerm[]`

---

## Phase 4 — Rendering Engine

### Prompt 4.1 — Annotated Text Renderer

Create `src/components/AnnotatedText.tsx`. Props:

```ts
{
  text: string
  detectedTerms: DetectedTerm[]
  annotations: Annotation[]
  onTermClick: (term: DetectedTerm) => void
  onTextSelect: (start: number, end: number, selectedText: string) => void
}
```

Requirements:
- Split text into interleaved plain and highlighted spans using character offsets.
- Statistical term highlights: `className="term-highlight"` (teal underline).
- User annotation highlights: use the stored colour from `Annotation.colour`.
- Each term span: `tabIndex={0}`, `role="button"`,
  `aria-label={\`Statistical term: ${term}\`}`.
- Fire `onTermClick` on click or `Enter`/`Space` keypress.
- Fire `onTextSelect` on `mouseup` if a selection range exists.

---

### Prompt 4.2 — Hover and Selection Tooltip

Install `@floating-ui/react`, `react-katex`, `katex`.

Create `src/components/TermTooltip.tsx`. Requirements:

- Activates on **hover** with a 300 ms debounce delay.
- Activates on **text selection** when the selected text exactly matches a
  known term or alias.
- Tooltip content:
  - Term name (bold heading)
  - Short definition
  - "Learn more" accordion → extended explanation + formula via
    `<InlineMath>` from `react-katex` (omit if formula is empty string)
  - Related terms as clickable chips; clicking a chip loads that term's entry
    in the same tooltip
- Dismissed by `Escape` key or click-outside.
- Positioned via Floating UI `autoPlacement` middleware to avoid viewport
  overflow.
- Accessibility: trap focus when open; announce content via
  `aria-live="polite"`.

---

### Prompt 4.3 — Paper Viewer Layout

Create `src/components/PaperViewer.tsx` as the main reading interface. Requirements:

- Accept a `Paper` object as a prop.
- Sticky left sidebar listing all sections as navigation links. Smooth-scroll
  on click.
- Highlight the active section in the sidebar via `IntersectionObserver`.
- Pass each section's `bodyText` through `detectTerms` and render via
  `<AnnotatedText>`.
- Fixed reading progress bar at top of viewport, updated on scroll.
- Paper header: title, authors, DOI (hyperlinked), journal, year.

---

## Phase 5 — Interactive Features

### Prompt 5.1 — User Annotation Layer

Create `src/hooks/useAnnotations.ts`. Requirements:

- Store annotations in `localStorage` keyed by `paper.doi` or, if absent, a
  SHA-256 hash of the title via the Web Crypto API.
- Expose:
  `{ annotations, addAnnotation, updateAnnotation, deleteAnnotation, getAnnotationsForPaper }`

Create `src/components/AnnotationPopover.tsx`. Requirements:

- Triggered when the user selects any text in `AnnotatedText`.
- Contains: four colour swatches (yellow, green, blue, pink), an "Add Note"
  button opening a `<textarea>`, and a "Copy" button.
- Clicking an existing annotation highlight opens the popover in edit/delete
  mode.
- Highlights must be re-applied correctly on page reload.

---

### Prompt 5.2 — AI Explanation Panel (skip if ANTHROPIC_API_KEY is not set)

Create `server/proxy.ts` — a minimal Express + TypeScript server. Requirements:

- `POST /api/explain` — accepts
  `{ selectedText: string; surroundingParagraph: string }`.
- Forwards to the Anthropic Messages API using `ANTHROPIC_API_KEY` from
  environment variables. **Never expose this key to the client.**
- System prompt: *"Explain the following passage in clear language for a
  researcher unfamiliar with this methodology. Respond in three to five
  sentences. Do not restate the passage verbatim."*
- Streams the response back via Server-Sent Events.

Configure `vite.config.ts` to proxy `/api` to `http://localhost:3001`.

Create `src/components/ExplanationPanel.tsx` — a slide-in right panel:
- Triggered by selecting text and clicking "Explain".
- Renders streamed response progressively.
- Loading skeleton while stream initialises.
- "Copy explanation" and "Close" buttons.

---

### Prompt 5.3 — Figure and Table Viewer

Install `react-zoom-pan-pinch`, `@tanstack/react-table`.

**Figures:**
- `src/components/FigureViewer.tsx` — renders figures in a zoomable lightbox
  using `react-zoom-pan-pinch`. Shows caption and page number label.

**Tables:**
- During parsing (update relevant service files), detect tab-delimited or
  pipe-delimited lines and parse into `{ headers, rows }` objects stored in
  `Section.tables`.
- `src/components/TableViewer.tsx` — renders tables via `@tanstack/react-table`
  with sortable columns (click header → ascending/descending). Include a
  "Download as CSV" button.

---

## Phase 6 — Search and Navigation

### Prompt 6.1 — Full-Text Search

Install `fuse.js`.

Create `src/hooks/useDocumentSearch.ts` — builds a Fuse.js index over all
section texts when a `Paper` loads.

Create `src/components/SearchBar.tsx`:
- Keyboard shortcut `Ctrl+F` / `Cmd+F` focuses the search input.
- All matches highlighted in `AnnotatedText` with an orange background.
- Match counter: "3 of 12 matches".
- Previous / Next navigation buttons.
- `Escape` clears search and removes highlights.

---

### Prompt 6.2 — Reference Resolution and Linking

Create `src/services/referenceService.ts`. Requirements:

- Parse each entry in the References section into a `Reference` object:
  `{ index, rawText, doi? }`.
- Attempt DOI resolution via the CrossRef API:
  `https://api.crossref.org/works?query=<encoded rawText>&rows=1`
  Accept the first result's DOI only if the score exceeds a threshold of 50.
- Rate-limit outbound requests to a maximum of 5 per second (use a queue with
  `setTimeout`) to comply with CrossRef's polite pool policy.

Render in-text citation markers (e.g. `[14]`, `(Author, Year)`) as `<button>`
superscript elements. On click:
- Smooth-scroll to the reference list entry.
- Open a tooltip showing: resolved DOI as a hyperlink, a "Search on PubMed"
  button (`https://pubmed.ncbi.nlm.nih.gov/?term=<rawText>`), and the full
  reference text.

---

## Phase 7 — Accessibility and Polish

### Prompt 7.1 — Accessibility Audit and Remediation

Install `axe-core`, `focus-trap-react`.

Requirements:
- Run an automated axe audit; fix all **critical** and **serious** violations.
- Every interactive element must have a descriptive `aria-label` or
  `aria-labelledby`.
- Verify colour contrast: `term-highlight` teal must meet **4.5:1** ratio on
  both white and dark-mode backgrounds. Adjust `tailwind.config.ts` if needed
  and document the chosen hex values in BUILD_LOG.md.
- `TermTooltip` and `ExplanationPanel` must correctly trap focus using
  `focus-trap-react`.
- Add a keyboard shortcut legend modal triggered by the `?` key listing all
  shortcuts.

---

### Prompt 7.2 — Responsive Layout and Dark Mode

Requirements:
- Fully responsive to **768 px** viewport width. At tablet width, the section
  navigation sidebar collapses to a hamburger menu overlay.
- Dark mode toggle button in the header. Use Tailwind `dark:` variant throughout.
  Persist preference to `localStorage`.
- Define explicit `dark:` colours for: tooltip backgrounds and borders,
  term-highlight underlines, annotation highlight colours (desaturated for dark
  mode), explanation panel background, and reading progress bar.
- Verify layout at 768 px, 1024 px, and 1440 px breakpoints.

---

## Phase 8 — Testing and Documentation

### Prompt 8.1 — Unit and Integration Tests

Install `vitest`, `@testing-library/react`, `@testing-library/user-event`,
`@testing-library/jest-dom`.

Write the following tests:

**Unit tests — `src/services/__tests__/`**

`termDetectionService.test.ts`:
- Detects a term present in the dictionary.
- Matches aliases case-insensitively.
- Resolves overlapping matches by selecting the longest.
- Returns an empty array for text containing no known terms.

`pdfService.test.ts` (mock pdf.js):
- Correctly maps extracted text to expected section headings.
- Populates `warnings` when a multi-column layout is suspected.

`ingestService.test.ts`:
- Dispatches to `pdfService` for `application/pdf`.
- Dispatches to `markdownService` for `text/markdown`.

**Integration tests — `src/components/__tests__/`**

`AnnotatedText.test.tsx`:
- Renders plain text without any highlighted spans when no terms are detected.
- Renders a detected term as a highlighted, keyboard-focusable span.
- Fires `onTermClick` when a term span is clicked or `Enter` is pressed.

`TermTooltip.test.tsx`:
- Does not show tooltip before the 300 ms hover delay elapses.
- Shows short definition after hovering a term span.
- Expands extended explanation on "Learn more" click.
- Dismisses tooltip on `Escape` key.

**All tests must pass. No skipped assertions.**

---

### Prompt 8.2 — Final Documentation

1. Add JSDoc comments to every exported function and React component, covering
   all props, parameters, and return values.

2. Update `README.md` with:
   - Feature overview (one paragraph per major capability)
   - Prerequisites and installation instructions
   - Environment variable reference (`ANTHROPIC_API_KEY`, `VITE_APP_TITLE`)
   - Architecture diagram in Mermaid syntax showing data flow from upload
     through ingestion → term detection → rendering → user interaction
   - Contributor guide: branching strategy, commit conventions, and
     instructions for adding new entries to `statisticalTerms.json`

3. Create `CHANGELOG.md` with an initial entry dated today summarising all
   features built.

4. Run `npm run build` one final time. Confirm: no TypeScript errors, no ESLint
   warnings, all tests passing.

5. Append a `BUILD COMPLETE` entry to `BUILD_LOG.md`:
   ```
   ## BUILD COMPLETE — YYYY-MM-DD HH:MM
   - Total files created: <n>
   - Total npm packages installed: <list>
   - Test results: <X passed, Y failed>
   - Known limitations: <list any>
   - Follow-up tasks: <list any>
   ```

---

## Appendix — Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | No (skip 5.2 if absent) | Anthropic API access for explanation feature |
| `VITE_APP_TITLE` | No | Override the browser tab title (default: "Sci Paper Reader") |

---

*End of CLAUDE.md*
