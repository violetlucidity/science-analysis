import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AnnotatedText from '../AnnotatedText';
import type { DetectedTerm } from '../../types';

const noopTermClick = vi.fn();
const noopTextSelect = vi.fn();

const mockTerm: DetectedTerm = {
  term: 'p-value',
  startIndex: 4,
  endIndex: 11,
  dictionaryEntry: {
    term: 'p-value',
    aliases: [],
    shortDefinition: 'Probability of observing results at least as extreme as those measured.',
    extendedExplanation: 'Extended explanation here.',
    formula: '',
    exampleUsage: 'The p-value was 0.03.',
    relatedTerms: [],
  },
};

describe('AnnotatedText', () => {
  it('renders plain text without any highlighted spans when no terms are detected', () => {
    render(
      <AnnotatedText
        text="The cat sat on the mat."
        detectedTerms={[]}
        annotations={[]}
        onTermClick={noopTermClick}
        onTextSelect={noopTextSelect}
      />
    );

    expect(screen.getByText('The cat sat on the mat.')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders a detected term as a highlighted, keyboard-focusable span', () => {
    // text: "The p-value was significant."
    // mockTerm covers indices 4–11 ("p-value")
    render(
      <AnnotatedText
        text="The p-value was significant."
        detectedTerms={[mockTerm]}
        annotations={[]}
        onTermClick={noopTermClick}
        onTextSelect={noopTextSelect}
      />
    );

    const termSpan = screen.getByRole('button', { name: /statistical term: p-value/i });
    expect(termSpan).toBeInTheDocument();
    expect(termSpan).toHaveAttribute('tabindex', '0');
    expect(termSpan).toHaveClass('term-highlight');
  });

  it('fires onTermClick when a term span is clicked', () => {
    const handleClick = vi.fn();

    render(
      <AnnotatedText
        text="The p-value was significant."
        detectedTerms={[mockTerm]}
        annotations={[]}
        onTermClick={handleClick}
        onTextSelect={noopTextSelect}
      />
    );

    const termSpan = screen.getByRole('button', { name: /statistical term: p-value/i });
    fireEvent.click(termSpan);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(mockTerm);
  });

  it('fires onTermClick when Enter is pressed on a term span', () => {
    const handleClick = vi.fn();

    render(
      <AnnotatedText
        text="The p-value was significant."
        detectedTerms={[mockTerm]}
        annotations={[]}
        onTermClick={handleClick}
        onTextSelect={noopTextSelect}
      />
    );

    const termSpan = screen.getByRole('button', { name: /statistical term: p-value/i });
    fireEvent.keyDown(termSpan, { key: 'Enter' });

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(mockTerm);
  });
});
