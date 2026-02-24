/**
 * Markdown document parsing service.
 *
 * Uses the remark pipeline to parse Markdown files and map headings
 * to Section objects.
 */
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import type { Root, Heading, Paragraph, Content } from 'mdast';
import type { Paper, Section } from '../types';

/**
 * Extracts plain text from a remark AST node's children.
 *
 * @param children - Array of remark AST content nodes.
 * @returns The concatenated plain text string.
 */
function extractText(children: Content[]): string {
  return children
    .map((node) => {
      if (node.type === 'text') return (node as { value: string }).value;
      if ('children' in node && Array.isArray(node.children)) {
        return extractText(node.children as Content[]);
      }
      return '';
    })
    .join('');
}

/**
 * Parses a Markdown file into a structured Paper object.
 *
 * Uses the remark pipeline to parse headings into Section objects,
 * with body text collected from paragraph nodes under each heading.
 *
 * @param file - The Markdown File object to parse.
 * @returns A Promise resolving to a fully typed Paper object.
 */
export async function parseMarkdown(file: File): Promise<Paper> {
  const text = await file.text();
  const processor = unified().use(remarkParse);
  const ast = processor.parse(text) as Root;

  const sections: Section[] = [];
  let currentSection: Section = {
    id: 'section-0',
    heading: 'Document',
    bodyText: '',
    figures: [],
    tables: [],
  };
  let title = '';

  for (const node of ast.children) {
    if (node.type === 'heading') {
      const headingNode = node as Heading;
      const headingText = extractText(headingNode.children as Content[]);

      // H1 is likely the title
      if (headingNode.depth === 1 && !title) {
        title = headingText;
      }

      // Save current section
      if (currentSection.bodyText.trim()) {
        sections.push(currentSection);
      }

      const newId = `section-${sections.length + 1}`;
      currentSection = {
        id: newId,
        heading: headingText,
        bodyText: '',
        figures: [],
        tables: [],
      };
    } else if (node.type === 'paragraph') {
      const paragraphNode = node as Paragraph;
      const paraText = extractText(paragraphNode.children as Content[]);
      currentSection.bodyText += paraText + '\n\n';
    } else if (node.type === 'list' || node.type === 'blockquote' || node.type === 'code') {
      // Add list/code/blockquote content as text
      if ('children' in node) {
        const childText = extractText(
          (node as { children: Content[] }).children
        );
        currentSection.bodyText += childText + '\n';
      } else if ('value' in node) {
        currentSection.bodyText += (node as { value: string }).value + '\n';
      }
    }
  }

  // Push final section
  if (currentSection.bodyText.trim()) {
    sections.push(currentSection);
  }

  // Find abstract
  const abstractSection = sections.find((s) =>
    s.heading.toLowerCase().includes('abstract')
  );

  return {
    id: crypto.randomUUID(),
    title: title || file.name.replace(/\.md$/i, ''),
    authors: [],
    abstract: abstractSection?.bodyText.trim() || '',
    sections,
    doi: '',
    metadata: {
      journal: '',
      year: new Date().getFullYear(),
      doi: '',
      keywords: [],
      citationCount: 0,
    },
    warnings: [],
  };
}
