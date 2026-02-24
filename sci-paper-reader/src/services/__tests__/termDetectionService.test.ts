import { describe, it, expect } from 'vitest';
import { detectTerms } from '../termDetectionService';

describe('detectTerms', () => {
  it('detects a term present in the dictionary', () => {
    const results = detectTerms('The p-value was below 0.05 in this study.');
    expect(results.length).toBeGreaterThan(0);
    const found = results.find((r) => r.term.toLowerCase() === 'p-value');
    expect(found).toBeDefined();
    expect(found!.dictionaryEntry.shortDefinition).toBeTruthy();
  });

  it('matches aliases case-insensitively', () => {
    // "SD" is a registered alias for "standard deviation"
    const results = detectTerms('Results are reported as mean ± SD.');
    expect(results.length).toBeGreaterThan(0);
    const sdMatch = results.find(
      (r) => r.dictionaryEntry.term.toLowerCase() === 'standard deviation'
    );
    expect(sdMatch).toBeDefined();
  });

  it('resolves overlapping matches by selecting the longest', () => {
    // "standard deviation" must be detected as a single term, not fragmented.
    // Since "standard" is not itself a dictionary term, this verifies the
    // automaton produces a single coherent match for the longer phrase.
    const results = detectTerms(
      'The standard deviation was reported alongside the mean.'
    );
    const sdMatch = results.find(
      (r) => r.term.toLowerCase() === 'standard deviation'
    );
    expect(sdMatch).toBeDefined();
    // No overlapping spans
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].endIndex).toBeLessThanOrEqual(results[i + 1].startIndex);
    }
  });

  it('returns an empty array for text containing no known terms', () => {
    const results = detectTerms('The cat sat on the mat and slept quietly.');
    expect(results).toEqual([]);
  });
});
