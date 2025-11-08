/**
 * Matching functions for different search strategies
 * Extracted from index.ts for better modularity
 */
import type { FuzzyIndex, SearchMatch, FuzzyConfig } from "./types.js";
import type { LanguageProcessor } from "./types.js";
/**
 * Find exact matches
 */
export declare function findExactMatches(query: string, index: FuzzyIndex, matches: Map<string, SearchMatch>, language: string): void;
/**
 * Find prefix matches
 */
export declare function findPrefixMatches(query: string, index: FuzzyIndex, matches: Map<string, SearchMatch>, language: string): void;
/**
 * Find substring matches (exact substring within the word)
 */
export declare function findSubstringMatches(query: string, index: FuzzyIndex, matches: Map<string, SearchMatch>, language: string): void;
/**
 * Find phonetic matches
 */
export declare function findPhoneticMatches(query: string, processor: LanguageProcessor, index: FuzzyIndex, matches: Map<string, SearchMatch>): void;
/**
 * Find synonym matches
 */
export declare function findSynonymMatches(query: string, index: FuzzyIndex, matches: Map<string, SearchMatch>): void;
/**
 * Find n-gram matches
 */
export declare function findNgramMatches(query: string, index: FuzzyIndex, matches: Map<string, SearchMatch>, language: string, ngramSize: number): void;
/**
 * Find fuzzy matches using edit distance
 */
export declare function findFuzzyMatches(query: string, index: FuzzyIndex, matches: Map<string, SearchMatch>, processor: LanguageProcessor, config: FuzzyConfig): void;
//# sourceMappingURL=matchers.d.ts.map