/**
 * Centralized tokenization utilities for consistent word boundary handling
 *
 * This module provides a single source of truth for how text is split into tokens,
 * ensuring consistent behavior across indexing, search, and phrase matching.
 */
/**
 * Word boundary characters - these separate tokens
 * Includes: whitespace, hyphens, underscores, punctuation, brackets, quotes, slashes
 */
export declare const WORD_BOUNDARY_CHARS: RegExp;
/**
 * Word boundary pattern for splitting text into tokens
 */
export declare const WORD_BOUNDARY_PATTERN: RegExp;
/**
 * Tokenize text into words by splitting on word boundaries
 *
 * This is the core tokenization function used throughout the library.
 * It splits on common delimiters while preserving alphanumeric content.
 *
 * @param text - Text to tokenize
 * @param options - Tokenization options
 * @returns Array of tokens
 *
 * @example
 * ```typescript
 * tokenize("api_manager_3254") // ["api", "manager", "3254"]
 * tokenize("hello-world") // ["hello", "world"]
 * tokenize("user@email.com") // ["user", "email", "com"]
 * tokenize("snake_case_var") // ["snake", "case", "var"]
 * ```
 */
export declare function tokenize(text: string, options?: {
    /** Keep empty tokens (default: false) */
    keepEmpty?: boolean;
    /** Minimum token length (default: 0) */
    minLength?: number;
    /** Convert to lowercase (default: false) */
    lowercase?: boolean;
}): string[];
/**
 * Check if a character is a word boundary
 *
 * @param char - Character to check
 * @returns True if the character is a word boundary
 */
export declare function isWordBoundaryChar(char: string): boolean;
/**
 * Tokenize and also return the original text with tokens
 * Useful for highlighting and position tracking
 *
 * @param text - Text to tokenize
 * @returns Object with tokens and original text
 */
export declare function tokenizeWithPositions(text: string): {
    tokens: string[];
    positions: {
        token: string;
        start: number;
        end: number;
    }[];
};
/**
 * Join tokens back into text with a separator
 *
 * @param tokens - Tokens to join
 * @param separator - Separator to use (default: space)
 * @returns Joined text
 */
export declare function joinTokens(tokens: string[], separator?: string): string;
/**
 * Normalize text for search by tokenizing and rejoining
 * This ensures consistent handling of special characters
 *
 * @param text - Text to normalize
 * @param options - Normalization options
 * @returns Normalized text
 */
export declare function normalizeForSearch(text: string, options?: {
    lowercase?: boolean;
    separator?: string;
}): string;
//# sourceMappingURL=tokenizer.d.ts.map