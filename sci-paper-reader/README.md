# Sci Paper Reader

An interactive reader for scientific papers with PDF/text ingestion, automatic detection and tooltip explanation of statistical terms, user annotations, AI-powered explanations, figure/table viewing, full-text search, and reference linking.

## Architecture Overview

<!-- TODO: Fill in at Phase 8.2 with Mermaid diagram -->

## Features

- PDF, plain text, and Markdown document ingestion
- Automatic statistical term detection with hover tooltips
- User annotations with colour highlights and notes
- AI-powered passage explanations
- Figure lightbox viewer and sortable table viewer
- Full-text search with keyboard shortcuts
- Reference resolution via CrossRef API
- Accessible, responsive, dark-mode-ready UI

## Prerequisites

- Node.js 18+
- npm 9+

## Installation

```bash
npm install
npm run dev
```

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | No | Enables AI explanation feature |
| `VITE_APP_TITLE` | No | Override browser tab title (default: "Sci Paper Reader") |
