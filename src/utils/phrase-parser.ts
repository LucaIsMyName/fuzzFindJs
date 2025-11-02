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
export function parseQuery(query: string): ParsedQuery {
  if (!query || typeof query !== 'string') {
    return {
      phrases: [],
      terms: [],
      original: query || '',
      hasPhrases: false,
    };
  }

  const phrases: string[] = [];
  let remaining = query;

  // Extract phrases with double quotes
  const doubleQuoteRegex = /"([^"]+)"/g;
  let match;
  
  while ((match = doubleQuoteRegex.exec(query)) !== null) {
    const phrase = match[1].trim();
    if (phrase) {
      // Validate phrase length (max 10 words)
      const wordCount = phrase.split(/\s+/).length;
      if (wordCount <= 10) {
        phrases.push(phrase);
      }
    }
  }

  // Remove double-quoted phrases from remaining text (including empty ones)
  remaining = remaining.replace(/"[^"]*"/g, ' ');

  // Extract phrases with single quotes
  const singleQuoteRegex = /'([^']+)'/g;
  
  while ((match = singleQuoteRegex.exec(query)) !== null) {
    const phrase = match[1].trim();
    if (phrase) {
      // Validate phrase length (max 10 words)
      const wordCount = phrase.split(/\s+/).length;
      if (wordCount <= 10) {
        phrases.push(phrase);
      }
    }
  }

  // Remove single-quoted phrases from remaining text (including empty ones)
  remaining = remaining.replace(/'[^']*'/g, ' ');

  // Extract remaining terms (non-phrase words)
  const terms = remaining
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length > 0);

  return {
    phrases,
    terms,
    original: query,
    hasPhrases: phrases.length > 0,
  };
}

/**
 * Check if a query contains phrase syntax (quotes)
 */
export function hasPhraseSyntax(query: string): boolean {
  if (!query) return false;
  return /"[^"]*"/.test(query) || /'[^']*'/.test(query);
}

/**
 * Normalize a phrase for matching (lowercase, trim)
 */
export function normalizePhrase(phrase: string): string {
  return phrase.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Split a phrase into words
 */
export function splitPhraseWords(phrase: string): string[] {
  return phrase
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 0);
}
