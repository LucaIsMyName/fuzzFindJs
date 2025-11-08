/**
 * Matching functions for different search strategies
 * Extracted from index.ts for better modularity
 */

import type { FuzzyIndex, SearchMatch, FuzzyConfig } from "./types.js";
import type { LanguageProcessor } from "./types.js";
import { calculateLevenshteinDistance, calculateDamerauLevenshteinDistance, generateNgrams } from "../algorithms/levenshtein.js";

/**
 * Find exact matches
 */
export function findExactMatches(query: string, index: FuzzyIndex, matches: Map<string, SearchMatch>, language: string): void {
  const wordBoundaries = index.config.wordBoundaries || false;

  // Check for wildcard pattern
  if (query.includes("*")) {
    // Wildcard search
    for (const baseWord of index.base) {
      if (matchesWildcard(baseWord, query)) {
        if (!matches.has(baseWord)) {
          matches.set(baseWord, {
            word: baseWord,
            normalized: query,
            matchType: "exact",
            editDistance: 0,
            language,
          });
        }
      }
    }
    return;
  }

  // Check for exact matches in the variant map (normalize to lowercase)
  const exactMatches = index.variantToBase.get(query.toLowerCase());
  if (exactMatches) {
    exactMatches.forEach((word) => {
      // With word boundaries, verify the match
      if (wordBoundaries && !matchesWord(word, query, wordBoundaries)) {
        return;
      }

      // Always add exact matches, even if already found with lower score
      const existing = matches.get(word);
      if (!existing || existing.matchType !== "exact") {
        matches.set(word, {
          word,
          normalized: query,
          matchType: "exact",
          editDistance: 0,
          language,
        });
      }
    });
  }

  // Also check if the query exactly matches any base word (case-insensitive)
  const queryLower = query.toLowerCase();
  for (const baseWord of index.base) {
    if (baseWord.toLowerCase() === queryLower) {
      if (!matches.has(baseWord)) {
        matches.set(baseWord, {
          word: baseWord,
          normalized: query,
          matchType: "exact",
          editDistance: 0,
          language,
        });
      }
    }
  }
}

/**
 * Find prefix matches
 */
export function findPrefixMatches(query: string, index: FuzzyIndex, matches: Map<string, SearchMatch>, language: string): void {
  const wordBoundaries = index.config.wordBoundaries || false;
  const queryLower = query.toLowerCase();

  for (const [variant, words] of index.variantToBase.entries()) {
    if (variant.startsWith(queryLower) && variant !== queryLower) {
      words.forEach((word) => {
        // With word boundaries, verify the match
        if (wordBoundaries && !matchesWord(word, query, wordBoundaries)) {
          return;
        }

        if (!matches.has(word)) {
          matches.set(word, {
            word,
            normalized: variant,
            matchType: "prefix",
            language,
          });
        }
      });
    }
  }
}

/**
 * Find substring matches (exact substring within the word)
 */
export function findSubstringMatches(query: string, index: FuzzyIndex, matches: Map<string, SearchMatch>, language: string): void {
  const queryLower = query.toLowerCase();
  
  // Skip very short queries to avoid too many matches
  if (queryLower.length < 2) return;

  for (const [variant, words] of index.variantToBase.entries()) {
    // Check if query is a substring (but not prefix or exact match)
    if (variant.includes(queryLower) && !variant.startsWith(queryLower) && variant !== queryLower) {
      words.forEach((word) => {
        const existingMatch = matches.get(word);
        // Don't replace exact or prefix matches with substring matches
        if (!existingMatch || (existingMatch.matchType !== "exact" && existingMatch.matchType !== "prefix")) {
          matches.set(word, {
            word,
            normalized: variant,
            matchType: "substring",
            language,
          });
        }
      });
    }
  }
}

/**
 * Find phonetic matches
 */
export function findPhoneticMatches(query: string, processor: LanguageProcessor, index: FuzzyIndex, matches: Map<string, SearchMatch>): void {
  if (!processor.supportedFeatures.includes("phonetic")) return;

  const phoneticCode = processor.getPhoneticCode(query);
  if (phoneticCode) {
    const phoneticMatches = index.phoneticToBase.get(phoneticCode);
    if (phoneticMatches) {
      phoneticMatches.forEach((word) => {
        if (!matches.has(word)) {
          matches.set(word, {
            word,
            normalized: query,
            matchType: "phonetic",
            phoneticCode,
            language: processor.language,
          });
        }
      });
    }
  }
}

/**
 * Find synonym matches
 */
export function findSynonymMatches(query: string, index: FuzzyIndex, matches: Map<string, SearchMatch>): void {
  const synonymMatches = index.synonymMap.get(query.toLowerCase());
  if (synonymMatches) {
    synonymMatches.forEach((word) => {
      if (!matches.has(word)) {
        matches.set(word, {
          word,
          normalized: query,
          matchType: "synonym",
          language: "synonym",
        });
      }
    });
  }
}

/**
 * Find n-gram matches
 */
export function findNgramMatches(query: string, index: FuzzyIndex, matches: Map<string, SearchMatch>, language: string, ngramSize: number): void {
  if (query.length < ngramSize) return;

  const queryNgrams = generateNgrams(query, ngramSize);
  const candidateWords = new Set<string>();

  queryNgrams.forEach((ngram: string) => {
    const ngramMatches = index.ngramIndex.get(ngram);
    if (ngramMatches) {
      ngramMatches.forEach((word) => candidateWords.add(word));
    }
  });

  candidateWords.forEach((word) => {
    if (!matches.has(word)) {
      matches.set(word, {
        word,
        normalized: query,
        matchType: "ngram",
        language,
      });
    }
  });
}

/**
 * Find fuzzy matches using edit distance
 */
export function findFuzzyMatches(query: string, index: FuzzyIndex, matches: Map<string, SearchMatch>, processor: LanguageProcessor, config: FuzzyConfig): void {
  // Adaptive max distance for short queries
  let maxDistance = config.maxEditDistance;
  
  // For very short queries (3-4 chars), be more lenient
  if (query.length <= 3) {
    maxDistance = Math.max(maxDistance, 2);
  } else if (query.length <= 4) {
    maxDistance = Math.max(maxDistance, 2);
  }

  for (const [variant, words] of index.variantToBase.entries()) {
    // Improved length check for short queries - be more lenient
    const lengthDiff = Math.abs(variant.length - query.length);
    const maxLengthDiff = query.length <= 3 ? 5 : (query.length <= 4 ? 4 : maxDistance);
    
    if (lengthDiff <= maxLengthDiff) {
      // Use Damerau-Levenshtein if transpositions feature is enabled
      const useTranspositions = index.config.features?.includes("transpositions");
      const distance = useTranspositions ? calculateDamerauLevenshteinDistance(query, variant, maxDistance) : calculateLevenshteinDistance(query, variant, maxDistance);

      // Adaptive distance threshold for short queries
      const distanceThreshold = query.length <= 3 ? 2 : maxDistance;
      
      if (distance <= distanceThreshold) {
        words.forEach((word) => {
          const existingMatch = matches.get(word);
          // Don't replace exact or prefix matches with fuzzy matches
          if (!existingMatch || (existingMatch.matchType !== "exact" && existingMatch.matchType !== "prefix" && (existingMatch.editDistance || Infinity) > distance)) {
            matches.set(word, {
              word,
              normalized: variant,
              matchType: "fuzzy",
              editDistance: distance,
              language: processor.language,
            });
          }
        });
      }
    }
  }
}

/**
 * Helper: Check if a word matches with word boundaries
 */
function matchesWord(word: string, query: string, wordBoundaries: boolean): boolean {
  if (!wordBoundaries) return true;
  
  const wordLower = word.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Check if query matches at word boundaries
  const regex = new RegExp(`\\b${escapeRegex(queryLower)}`, 'i');
  return regex.test(wordLower);
}

/**
 * Helper: Check if a word matches a wildcard pattern
 */
function matchesWildcard(word: string, pattern: string): boolean {
  const regexPattern = pattern
    .split('*')
    .map(escapeRegex)
    .join('.*');
  
  const regex = new RegExp(`^${regexPattern}$`, 'i');
  return regex.test(word);
}

/**
 * Helper: Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
