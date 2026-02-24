# Sci Paper Reader

An interactive reader for scientific papers with PDF/text ingestion, automatic
detection and tooltip explanation of statistical terms, user annotations,
AI-powered explanations, figure/table viewing, full-text search, and reference
linking.

---

## Features

**Document Ingestion** — Upload PDF, plain text (.txt), or Markdown (.md) files.
PDFs are processed with pdf.js: text is extracted page-by-page, section headings
are identified via regex patterns, each page is captured as an image, and
suspected multi-column layouts are flagged. Plain text and Markdown files are
parsed with custom parsers and the unified/remark pipeline respectively.

**Statistical Term Detection** — An Aho-Corasick automaton scans section body
text against an 89-entry dictionary spanning descriptive statistics, inferential
statistics, effect sizes, regression/modelling, Bayesian methods, survival
analysis, and methodological terms. Terms and their aliases are matched
case-insensitively; overlapping matches are resolved by preferring the longest
match. Detected terms appear with a teal underline highlight.

**Interactive Tooltips** — Hovering over a highlighted term for 300 ms (or
selecting text that matches a known term) opens a floating tooltip showing the
term's short definition. A "Learn more" accordion reveals the extended
explanation, a LaTeX-rendered formula (where applicable), and example usage.
Related terms are displayed as clickable chips that navigate within the tooltip.
Focus is trapped inside the tooltip; Escape closes it.

**User Annotations** — Selecting any span of text triggers an annotation
popover with four colour swatches (yellow, green, blue, pink), a note textarea,
and a Copy button. Annotations are persisted to `localStorage` keyed by the
paper's DOI or a SHA-256 hash of its title. On reload, highlights are
re-applied and clicking an existing highlight opens it in edit/delete mode.

**AI Explanations** — When `ANTHROPIC_API_KEY` is set and the Express proxy
server is running, selecting text and clicking "Explain" sends the passage to
the Anthropic Messages API. The streamed response is rendered progressively in
a slide-in panel. The API key is never exposed to the client.

**Figure & Table Viewer** — Page images extracted during PDF parsing are
displayed in a zoomable/pannable lightbox (`react-zoom-pan-pinch`). Tab- and
pipe-delimited data blocks found in section text are parsed into structured
tables and rendered with `@tanstack/react-table`, with sortable columns and a
"Download as CSV" button.

**Full-Text Search** — Press `Ctrl+F` / `Cmd+F` to focus the search bar.
Matches are highlighted with an orange background across all sections; a
counter shows the current match position; Previous/Next buttons navigate
between them. Escape clears the search.

**Reference Linking** — In-text citation markers (`[14]`, `(Author, Year)`)
are rendered as superscript buttons. Clicking one smooth-scrolls to the
reference list and opens a tooltip with the raw reference text, a resolved DOI
hyperlink (via CrossRef API, score threshold 50), and a "Search on PubMed"
button. Outbound CrossRef requests are rate-limited to 5 per second.

---

## Prerequisites

- Node.js 18+
- npm 9+

---

## Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# (Optional) Start the AI proxy server — requires ANTHROPIC_API_KEY
cd server && npx ts-node proxy.ts
```

### Available scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and produce production bundle |
| `npm run lint` | Run ESLint |
| `npm test` | Run vitest test suite |
| `npm run preview` | Preview production build locally |

---

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | No — skip Phase 5.2 if absent | Server-side key for the Anthropic Messages API (AI explanation feature) |
| `VITE_APP_TITLE` | No | Override the browser tab title (default: `"Sci Paper Reader"`) |

Set variables in a `.env` file at the project root (never commit this file):

```
ANTHROPIC_API_KEY=sk-ant-...
VITE_APP_TITLE=My Paper Reader
```

---

## Architecture

```mermaid
flowchart TD
    A[User uploads file] --> B{MIME type}
    B -->|application/pdf| C[pdfService\npdfjs-dist]
    B -->|text/plain| D[textService]
    B -->|text/markdown| E[markdownService\nunified/remark]
    C --> F[Paper object\nsections · figures · warnings]
    D --> F
    E --> F
    F --> G[termDetectionService\nAho-Corasick automaton]
    G --> H[DetectedTerm[]\nstart · end offsets]
    F --> I[PaperViewer]
    H --> I
    I --> J[AnnotatedText\nhighlighted spans]
    J --> K{User interaction}
    K -->|hover / select term| L[TermTooltip\nfloating-ui]
    K -->|text selection| M[AnnotationPopover\nlocalStorage]
    K -->|Ctrl+F| N[SearchBar\nFuse.js]
    K -->|citation click| O[referenceService\nCrossRef API]
    K -->|Explain click| P[ExplanationPanel\nAnthropic SSE stream]
    F --> Q[FigureViewer\nreact-zoom-pan-pinch]
    F --> R[TableViewer\n@tanstack/react-table]
```

---

## Contributor Guide

### Branching strategy

- `main` — stable releases only
- `claude/<feature>-<id>` — automated feature branches (this project)
- `feature/<name>` — human contributor feature branches

Open a pull request against `main`; CI must pass before merging.

### Commit conventions

Use the format `[PhaseX.Y] <short imperative description>`, e.g.:

```
[Phase3.1] Add 89-entry statistical terms dictionary
[Phase4.2] Hover and selection tooltip with floating-ui
```

For ad-hoc fixes use conventional commits: `fix:`, `feat:`, `refactor:`,
`docs:`, `test:`, `chore:`.

### Adding entries to `statisticalTerms.json`

Each entry in `src/data/statisticalTerms.json` must conform to the
`StatisticalTerm` interface:

```jsonc
{
  "term": "exact canonical name",          // used for display and matching
  "aliases": ["SD", "σ"],                  // additional match strings
  "shortDefinition": "One sentence.",      // shown in collapsed tooltip
  "extendedExplanation": "Two to four sentences.", // shown after Learn more
  "formula": "s = \\sqrt{\\frac{...}{n-1}}", // LaTeX string, or "" if none
  "exampleUsage": "One sentence from a plausible study context.",
  "relatedTerms": ["variance", "mean"]     // must match existing term names
}
```

After adding entries, run `npm test` to verify detection still works and
`npm run build` to confirm no TypeScript errors.
