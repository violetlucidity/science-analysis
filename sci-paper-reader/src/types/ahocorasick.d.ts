/**
 * Type declarations for the ahocorasick package.
 */
declare module 'ahocorasick' {
  class AhoCorasick {
    constructor(keywords: string[]);
    /**
     * Searches the string for all keyword occurrences.
     * Returns an array of [endCharIndex, matchedKeywords[]] tuples.
     * endCharIndex is the index of the last character of the match.
     */
    search(text: string): Array<[number, string[]]>;
  }
  export = AhoCorasick;
}
