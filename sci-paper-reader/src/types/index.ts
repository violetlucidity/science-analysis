/**
 * Metadata about a scientific paper.
 */
export interface PaperMetadata {
  /** The journal name where the paper was published. */
  journal: string;
  /** The year the paper was published. */
  year: number;
  /** The Digital Object Identifier of the paper. */
  doi: string;
  /** Keywords associated with the paper. */
  keywords: string[];
  /** The number of citations the paper has received. */
  citationCount: number;
}

/**
 * A figure extracted from a scientific paper.
 */
export interface Figure {
  /** Unique identifier for the figure. */
  id: string;
  /** Base64 data URL of the figure image. */
  dataUrl: string;
  /** Caption text describing the figure. */
  caption: string;
  /** The page number on which the figure appears. */
  pageNumber: number;
}

/**
 * A table extracted from a scientific paper.
 */
export interface Table {
  /** Unique identifier for the table. */
  id: string;
  /** Column header labels. */
  headers: string[];
  /** Data rows, each row is an array of cell strings. */
  rows: string[][];
  /** Caption text describing the table. */
  caption: string;
}

/**
 * A section within a scientific paper.
 */
export interface Section {
  /** Unique identifier for the section. */
  id: string;
  /** The section heading text. */
  heading: string;
  /** The full body text of the section. */
  bodyText: string;
  /** Figures found within this section. */
  figures: Figure[];
  /** Tables found within this section. */
  tables: Table[];
}

/**
 * A reference entry from the bibliography of a paper.
 */
export interface Reference {
  /** The numeric index of the reference (1-based). */
  index: number;
  /** The raw reference text as extracted. */
  rawText: string;
  /** Resolved Digital Object Identifier, if available. */
  doi?: string;
}

/**
 * A scientific paper document.
 */
export interface Paper {
  /** Unique identifier for the paper. */
  id: string;
  /** The title of the paper. */
  title: string;
  /** List of authors. */
  authors: string[];
  /** The abstract text. */
  abstract: string;
  /** Ordered list of sections in the paper. */
  sections: Section[];
  /** The Digital Object Identifier. */
  doi: string;
  /** Structured metadata about the paper. */
  metadata: PaperMetadata;
  /** Warnings generated during parsing (e.g., multi-column layout detected). */
  warnings: string[];
}

/**
 * A statistical term from the dictionary.
 */
export interface StatisticalTerm {
  /** The canonical term name. */
  term: string;
  /** Alternative names or abbreviations for the term. */
  aliases: string[];
  /** A one-sentence definition of the term. */
  shortDefinition: string;
  /** A two-to-four sentence explanation of the term. */
  extendedExplanation: string;
  /** LaTeX formula string, or empty string if not applicable. */
  formula: string;
  /** An example sentence showing usage of the term in a study context. */
  exampleUsage: string;
  /** List of related term names. */
  relatedTerms: string[];
}

/**
 * A statistical term detected within paper text.
 */
export interface DetectedTerm {
  /** The canonical term string from the dictionary. */
  term: string;
  /** Start character offset in the source text. */
  startIndex: number;
  /** End character offset (exclusive) in the source text. */
  endIndex: number;
  /** The full dictionary entry for this term. */
  dictionaryEntry: StatisticalTerm;
}

/**
 * A user annotation on a section of paper text.
 */
export interface Annotation {
  /** Unique identifier for the annotation. */
  id: string;
  /** The ID or DOI of the paper this annotation belongs to. */
  paperId: string;
  /** Start character offset in the source text. */
  startIndex: number;
  /** End character offset (exclusive) in the source text. */
  endIndex: number;
  /** Highlight colour (e.g., 'yellow', 'green', 'blue', 'pink'). */
  colour: string;
  /** Optional note text attached to the annotation. */
  note: string;
  /** ISO 8601 timestamp of when the annotation was created. */
  createdAt: string;
}
