import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react';

// --- Mock @floating-ui/react -----------------------------------------------
vi.mock('@floating-ui/react', () => ({
  useFloating: vi.fn(() => ({
    refs: { setFloating: vi.fn() },
    floatingStyles: {},
    context: {},
  })),
  autoPlacement: vi.fn(() => ({})),
  offset: vi.fn(() => ({})),
  shift: vi.fn(() => ({})),
  FloatingFocusManager: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="floating-focus-manager">{children}</div>
  ),
}));

// --- Mock react-katex -------------------------------------------------------
vi.mock('react-katex', () => ({
  InlineMath: ({ math }: { math: string }) => <span data-testid="inline-math">{math}</span>,
  BlockMath: ({ math }: { math: string }) => <div data-testid="block-math">{math}</div>,
}));

// --- Mock katex CSS ---------------------------------------------------------
vi.mock('katex/dist/katex.min.css', () => ({}));

// --- Mock termDetectionService so lookupTerm works in tests -----------------
vi.mock('../../services/termDetectionService', () => ({
  lookupTerm: vi.fn((name: string) => {
    if (name === 'confidence interval') {
      return {
        term: 'confidence interval',
        aliases: ['CI'],
        shortDefinition: 'A range of values likely to contain the true population parameter.',
        extendedExplanation: 'Extended explanation for CI.',
        formula: '',
        exampleUsage: 'The 95% CI was 1.2–3.4.',
        relatedTerms: ['p-value'],
      };
    }
    return undefined;
  }),
  detectTerms: vi.fn(() => []),
  getAllTerms: vi.fn(() => []),
}));

import TermTooltip from '../TermTooltip';
import { useTermTooltip } from '../../hooks/useTermTooltip';
import type { StatisticalTerm } from '../../types';

const mockTerm: StatisticalTerm = {
  term: 'p-value',
  aliases: ['p value'],
  shortDefinition: 'Probability of observing results at least as extreme as those measured.',
  extendedExplanation: 'A smaller p-value indicates stronger evidence against the null hypothesis.',
  formula: 'p = P(T \\geq t \\mid H_0)',
  exampleUsage: 'The p-value was 0.03, below the threshold of 0.05.',
  relatedTerms: ['confidence interval', 'null hypothesis'],
};

// --------------------------------------------------------------------------
// Helper: render TermTooltip in an open state.
// --------------------------------------------------------------------------
function renderOpen(overrides: Partial<Parameters<typeof TermTooltip>[0]> = {}) {
  const onClose = vi.fn();
  const utils = render(
    <TermTooltip
      term={mockTerm}
      isOpen={true}
      onClose={onClose}
      referenceEl={null}
      {...overrides}
    />
  );
  return { ...utils, onClose };
}

// --------------------------------------------------------------------------

describe('TermTooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not show tooltip before the 300 ms hover delay elapses', () => {
    const { result } = renderHook(() => useTermTooltip());

    const fakeAnchor = document.createElement('span');
    act(() => {
      result.current.openTerm(mockTerm, fakeAnchor);
    });

    // Advance only 200 ms — tooltip should still be closed.
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('shows tooltip (and short definition) after the 300 ms hover delay elapses', () => {
    const { result } = renderHook(() => useTermTooltip());

    const fakeAnchor = document.createElement('span');
    act(() => {
      result.current.openTerm(mockTerm, fakeAnchor);
    });

    // Advance the full 300 ms.
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.tooltipTerm).toEqual(mockTerm);

    // Render the tooltip and verify short definition is visible.
    render(
      <TermTooltip
        term={result.current.tooltipTerm}
        isOpen={result.current.isOpen}
        onClose={result.current.closeTerm}
        referenceEl={result.current.referenceEl}
      />
    );

    expect(
      screen.getByText('Probability of observing results at least as extreme as those measured.')
    ).toBeInTheDocument();
  });

  it('expands extended explanation on "Learn more" click', () => {
    renderOpen();

    // Extended explanation should not be visible yet.
    expect(screen.queryByTestId('extended-explanation')).toBeNull();

    // Click the "Learn more" button.
    fireEvent.click(screen.getByTestId('learn-more-btn'));

    expect(screen.getByTestId('extended-explanation')).toBeInTheDocument();
    expect(
      screen.getByText(
        'A smaller p-value indicates stronger evidence against the null hypothesis.'
      )
    ).toBeInTheDocument();
  });

  it('dismisses tooltip on Escape key', () => {
    const { onClose } = renderOpen();

    expect(screen.getByTestId('term-tooltip')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
