/**
 * Phrase parser for multi-word query support
 * Extracts quoted phrases and regular terms from search queries
 */
export interface ParsedQuery {
    /** Quoted phrases to search as units */
    phrases: string[];
    /** Individual search terms */
    terms: string[];
    /** Original query string */
    original: string;
    /** Whether query contains any phrases */
    hasPhrases: boolean;
}
/**
 * Parse a search query to extract phrases and terms
 * Supports both double quotes (") and single quotes (')
 *
 * @example
 * parseQuery('"new york" city')
 * // → { phrases: ['new york'], terms: ['city'], hasPhrases: true }
 *
 * parseQuery('hello world')
 * // → { phrases: [], terms: ['hello', 'world'], hasPhrases: false }
 */
export declare function parseQuery(query: string): ParsedQuery;
/**
 * Check if a query contains phrase syntax (quotes)
 */
export declare function hasPhraseSyntax(query: string): boolean;
/**
 * Normalize a phrase for matching (lowercase, trim)
 */
export declare function normalizePhrase(phrase: string): string;
/**
 * Split a phrase into words
 */
export declare function splitPhraseWords(phrase: string): string[];
//# sourceMappingURL=phrase-parser.d.ts.map