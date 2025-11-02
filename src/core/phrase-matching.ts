/**
 * Phrase matching algorithms for multi-word query support
 */

import { calculateLevenshteinDistance, calculateDamerauLevenshteinDistance } from "../algorithms/levenshtein.js";

export interface PhraseMatchOptions {
  /** Require exact phrase match (no typos) */
  exactMatch?: boolean;
  /** Maximum edit distance per word in phrase */
  maxEditDistance?: number;
  /** Score multiplier for phrase matches */
  proximityBonus?: number;
  /** Maximum words between phrase words for proximity match */
  maxProximityDistance?: number;
  /** Use Damerau-Levenshtein (transpositions) */
  useTranspositions?: boolean;
}

export interface PhraseMatchResult {
  /** Whether phrase was found */
  matched: boolean;
  /** Match score (0-1) */
  score: number;
  /** Type of match */
  matchType: "exact" | "fuzzy" | "proximity" | "none";
  /** Start position in text */
  startPos?: number;
  /** End position in text */
  endPos?: number;
  /** Words that matched */
  matchedWords?: string[];
}

const DEFAULT_OPTIONS: Required<PhraseMatchOptions> = {
  exactMatch: false,
  maxEditDistance: 1,
  proximityBonus: 1.5,
  maxProximityDistance: 3,
  useTranspositions: false,
};

/**
 * Match a phrase in text with various strategies
 */
export function matchPhrase(
  //
  text: string,
  phrase: string,
  options: PhraseMatchOptions = {}
): PhraseMatchResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!text || !phrase) {
    return { matched: false, score: 0, matchType: "none" };
  }

  const normalizedText = text.toLowerCase();
  const normalizedPhrase = phrase.toLowerCase();

  // Strategy 1: Exact phrase match (highest score)
  const exactMatch = findExactPhrase(normalizedText, normalizedPhrase);
  if (exactMatch.matched) {
    return { ...exactMatch, score: 1.0, matchType: "exact" };
  }

  // If exact match required, stop here
  if (opts.exactMatch) {
    return { matched: false, score: 0, matchType: "none" };
  }

  // Strategy 2: Fuzzy phrase match (allow typos)
  const fuzzyMatch = findFuzzyPhrase(normalizedText, normalizedPhrase, opts.maxEditDistance, opts.useTranspositions);
  if (fuzzyMatch.matched) {
    return { ...fuzzyMatch, matchType: "fuzzy" };
  }

  // Strategy 3: Proximity match (words nearby)
  const proximityMatch = findProximityMatch(normalizedText, normalizedPhrase, opts.maxProximityDistance);
  if (proximityMatch.matched) {
    return { ...proximityMatch, matchType: "proximity" };
  }

  return { matched: false, score: 0, matchType: "none" };
}

/**
 * Find exact phrase in text
 */
function findExactPhrase(
  //
  text: string,
  phrase: string
): PhraseMatchResult {
  const index = text.indexOf(phrase);

  if (index !== -1) {
    return {
      matched: true,
      score: 1.0,
      matchType: "exact",
      startPos: index,
      endPos: index + phrase.length,
    };
  }

  return { matched: false, score: 0, matchType: "none" };
}

/**
 * Find phrase with fuzzy matching (allow typos)
 */
function findFuzzyPhrase(
  //
  text: string,
  phrase: string,
  maxEditDistance: number,
  useTranspositions: boolean
): PhraseMatchResult {
  const phraseWords = phrase.split(/\s+/);
  const textWords = text.split(/\s+/);

  // Try to find consecutive words that match the phrase
  for (let i = 0; i <= textWords.length - phraseWords.length; i++) {
    const segment = textWords.slice(i, i + phraseWords.length);

    // Check if this segment matches the phrase with fuzzy matching
    let totalDistance = 0;
    let allMatch = true;

    for (let j = 0; j < phraseWords.length; j++) {
      const distance = useTranspositions ? calculateDamerauLevenshteinDistance(phraseWords[j], segment[j], maxEditDistance) : calculateLevenshteinDistance(phraseWords[j], segment[j], maxEditDistance);

      if (distance > maxEditDistance) {
        allMatch = false;
        break;
      }
      totalDistance += distance;
    }

    if (allMatch) {
      // Calculate score based on edit distance
      const maxPossibleDistance = phraseWords.length * maxEditDistance;
      const score = maxPossibleDistance > 0 ? 0.7 + 0.2 * (1 - totalDistance / maxPossibleDistance) : 0.9;

      return {
        matched: true,
        score,
        matchType: "fuzzy",
        matchedWords: segment,
      };
    }
  }

  return { matched: false, score: 0, matchType: "none" };
}

/**
 * Find words in proximity (nearby but not necessarily consecutive)
 */
function findProximityMatch(
  //
  text: string,
  phrase: string,
  maxDistance: number
): PhraseMatchResult {
  const phraseWords = phrase.split(/\s+/);
  const textWords = text.split(/\s+/);

  // Find positions of each phrase word in text
  const positions: number[][] = phraseWords.map(() => []);

  textWords.forEach((word, index) => {
    phraseWords.forEach((phraseWord, phraseIndex) => {
      if (word === phraseWord || word.includes(phraseWord) || phraseWord.includes(word)) {
        positions[phraseIndex].push(index);
      }
    });
  });

  // Check if all words were found
  if (positions.some((p) => p.length === 0)) {
    return { matched: false, score: 0, matchType: "none" };
  }

  // Find the best combination where words are close together
  let bestDistance = Infinity;
  let bestPositions: number[] = [];

  function findBestCombination(wordIndex: number, currentPositions: number[]): void {
    if (wordIndex === phraseWords.length) {
      // Calculate total distance
      const sorted = [...currentPositions].sort((a, b) => a - b);
      const distance = sorted[sorted.length - 1] - sorted[0];

      if (distance < bestDistance) {
        bestDistance = distance;
        bestPositions = [...currentPositions];
      }
      return;
    }

    for (const pos of positions[wordIndex]) {
      findBestCombination(wordIndex + 1, [...currentPositions, pos]);
    }
  }

  findBestCombination(0, []);

  // Check if words are within max distance
  if (bestDistance <= maxDistance) {
    // Score based on proximity (closer = higher score)
    const score = 0.5 + 0.2 * (1 - bestDistance / maxDistance);

    return {
      matched: true,
      score,
      matchType: "proximity",
      matchedWords: bestPositions.map((i) => textWords[i]),
    };
  }

  return { matched: false, score: 0, matchType: "none" };
}

/**
 * Calculate phrase match score for a text
 * Returns 0 if no match, or a boosted score if phrase matches
 */
export function calculatePhraseScore(
  //
  text: string,
  phrase: string,
  baseScore: number,
  options: PhraseMatchOptions = {}
): number {
  const match = matchPhrase(text, phrase, options);

  if (!match.matched) {
    return 0;
  }

  // Apply proximity bonus
  const bonus = options.proximityBonus || 1.5;
  return Math.min(1.0, baseScore * match.score * bonus);
}
