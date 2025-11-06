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
export const WORD_BOUNDARY_CHARS = /[\s\-_.,;:!?()[\]{}'"\/\\#@$%^&*+=<>|~`]/;

/**
 * Word boundary pattern for splitting text into tokens
 */
export const WORD_BOUNDARY_PATTERN = /[\s\-_.,;:!?()[\]{}'"\/\\#@$%^&*+=<>|~`]+/;

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
export function tokenize(
  text: string,
  options: {
    /** Keep empty tokens (default: false) */
    keepEmpty?: boolean;
    /** Minimum token length (default: 0) */
    minLength?: number;
    /** Convert to lowercase (default: false) */
    lowercase?: boolean;
  } = {}
): string[] {
  const { keepEmpty = false, minLength = 0, lowercase = false } = options;

  // Split on word boundaries
  let tokens = text.split(WORD_BOUNDARY_PATTERN);

  // Filter empty tokens unless explicitly kept
  if (!keepEmpty) {
    tokens = tokens.filter((token) => token.length > 0);
  }

  // Apply minimum length filter
  if (minLength > 0) {
    tokens = tokens.filter((token) => token.length >= minLength);
  }

  // Apply lowercase transformation
  if (lowercase) {
    tokens = tokens.map((token) => token.toLowerCase());
  }

  return tokens;
}

/**
 * Check if a character is a word boundary
 * 
 * @param char - Character to check
 * @returns True if the character is a word boundary
 */
export function isWordBoundaryChar(char: string): boolean {
  return WORD_BOUNDARY_CHARS.test(char);
}

/**
 * Tokenize and also return the original text with tokens
 * Useful for highlighting and position tracking
 * 
 * @param text - Text to tokenize
 * @returns Object with tokens and original text
 */
export function tokenizeWithPositions(text: string): {
  tokens: string[];
  positions: { token: string; start: number; end: number }[];
} {
  const tokens: string[] = [];
  const positions: { token: string; start: number; end: number }[] = [];

  let currentToken = "";
  let tokenStart = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (isWordBoundaryChar(char)) {
      // End of token
      if (currentToken.length > 0) {
        tokens.push(currentToken);
        positions.push({
          token: currentToken,
          start: tokenStart,
          end: i,
        });
        currentToken = "";
      }
      tokenStart = i + 1;
    } else {
      // Part of token
      if (currentToken.length === 0) {
        tokenStart = i;
      }
      currentToken += char;
    }
  }

  // Add final token if exists
  if (currentToken.length > 0) {
    tokens.push(currentToken);
    positions.push({
      token: currentToken,
      start: tokenStart,
      end: text.length,
    });
  }

  return { tokens, positions };
}

/**
 * Join tokens back into text with a separator
 * 
 * @param tokens - Tokens to join
 * @param separator - Separator to use (default: space)
 * @returns Joined text
 */
export function joinTokens(tokens: string[], separator: string = " "): string {
  return tokens.join(separator);
}

/**
 * Normalize text for search by tokenizing and rejoining
 * This ensures consistent handling of special characters
 * 
 * @param text - Text to normalize
 * @param options - Normalization options
 * @returns Normalized text
 */
export function normalizeForSearch(
  text: string,
  options: {
    lowercase?: boolean;
    separator?: string;
  } = {}
): string {
  const { lowercase = true, separator = " " } = options;
  const tokens = tokenize(text, { lowercase });
  return joinTokens(tokens, separator);
}
