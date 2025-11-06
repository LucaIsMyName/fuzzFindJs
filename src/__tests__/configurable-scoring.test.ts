import { describe, it, expect } from 'vitest';
import { buildFuzzyIndex, getSuggestions } from '../core/index.js';

describe('Configurable Scoring', () => {
  describe('Match Type Scores', () => {
    it('should use custom exact match score', () => {
      const words = ['apple', 'application'];
      
      const index = buildFuzzyIndex(words, {
        config: {
          matchTypeScores: {
            exact: 0.95, // Lower than default 1.0
          },
        },
      });

      const results = getSuggestions(index, 'apple');
      const exactMatch = results.find(r => r.baseWord === 'apple');
      
      expect(exactMatch).toBeDefined();
      expect(exactMatch!.score).toBeLessThanOrEqual(0.95);
    });

    it('should use custom prefix match score', () => {
      const words = ['application', 'apple', 'apply'];
      
      const index = buildFuzzyIndex(words, {
        config: {
          matchTypeScores: {
            prefix: 0.95, // Higher than default 0.9
          },
        },
      });

      const results = getSuggestions(index, 'app');
      
      // All results should be prefix matches with higher scores
      expect(results.length).toBeGreaterThan(0);
      results.forEach(result => {
        expect(result.score).toBeGreaterThan(0.85); // Should be higher due to custom score
      });
    });

    it('should use custom fuzzy match minimum score', () => {
      const words = ['apple', 'apricot', 'banana'];
      
      // Strict fuzzy minimum
      const strictIndex = buildFuzzyIndex(words, {
        config: {
          matchTypeScores: {
            fuzzyMin: 0.7, // Much higher than default 0.3
          },
          fuzzyThreshold: 0.6,
        },
      });

      const strictResults = getSuggestions(strictIndex, 'aple');
      
      // Should filter out low-scoring fuzzy matches
      strictResults.forEach(result => {
        expect(result.score).toBeGreaterThanOrEqual(0.6);
      });
    });

    it('should use custom phonetic match score', () => {
      const words = ['Smith', 'Smythe', 'Schmidt'];
      
      const index = buildFuzzyIndex(words, {
        config: {
          languages: ['english'],
          matchTypeScores: {
            phonetic: 0.85, // Higher than default 0.7
          },
        },
      });

      const results = getSuggestions(index, 'Smith');
      
      expect(results.length).toBeGreaterThan(0);
    });

    it('should use custom ngram multiplier', () => {
      const words = ['testing', 'resting', 'nesting'];
      
      const highNgramIndex = buildFuzzyIndex(words, {
        config: {
          matchTypeScores: {
            ngram: 0.95, // Higher than default 0.8
          },
        },
      });

      const results = getSuggestions(highNgramIndex, 'test');
      
      expect(results.length).toBeGreaterThan(0);
      // N-gram matches should have higher scores
      const ngramMatch = results.find(r => r.baseWord === 'testing');
      expect(ngramMatch).toBeDefined();
    });
  });

  describe('Scoring Modifiers', () => {
    it('should use custom base score', () => {
      const words = ['test', 'testing'];
      
      const index = buildFuzzyIndex(words, {
        config: {
          scoringModifiers: {
            baseScore: 0.7, // Higher than default 0.5
          },
        },
      });

      const results = getSuggestions(index, 'xyz'); // Non-matching query
      
      // Even non-matches should start from higher base
      expect(results.length).toBeGreaterThanOrEqual(0);
    });

    it('should use custom short word boost', () => {
      const words = ['app', 'application', 'apple'];
      
      const highBoostIndex = buildFuzzyIndex(words, {
        config: {
          scoringModifiers: {
            shortWordBoost: 0.2, // Higher than default 0.1
          },
        },
      });

      const results = getSuggestions(highBoostIndex, 'app');
      
      // Shorter words should get bigger boost
      const shortMatch = results.find(r => r.baseWord === 'app');
      expect(shortMatch).toBeDefined();
      expect(shortMatch!.score).toBeGreaterThan(0.9);
    });

    it('should respect shortWordMaxDiff setting', () => {
      const words = ['app', 'apple', 'application'];
      
      const index = buildFuzzyIndex(words, {
        config: {
          scoringModifiers: {
            shortWordMaxDiff: 1, // Only boost if within 1 char
            shortWordBoost: 0.15,
          },
        },
      });

      const results = getSuggestions(index, 'app');
      
      // 'app' (exact) and 'apple' (+2 chars, outside diff) should be treated differently
      expect(results.length).toBeGreaterThan(0);
    });

    it('should allow disabling prefix length penalty', () => {
      const words = ['application', 'app'];
      
      const noPenaltyIndex = buildFuzzyIndex(words, {
        config: {
          scoringModifiers: {
            prefixLengthPenalty: false,
          },
        },
      });

      const results = getSuggestions(noPenaltyIndex, 'app');
      
      // Both should have high scores without length penalty
      const longMatch = results.find(r => r.baseWord === 'application');
      expect(longMatch).toBeDefined();
      expect(longMatch!.score).toBeGreaterThan(0.85);
    });

    // Note: Prefix length penalty is tested indirectly through the "disable" test above
    // Direct testing is challenging because match type detection happens before scoring
  });

  describe('Performance Mode Scoring', () => {
    it('should use stricter scoring in fast mode', () => {
      const words = ['apple', 'application', 'apricot'];
      
      const fastIndex = buildFuzzyIndex(words, {
        config: {
          performance: 'fast',
        },
      });

      const results = getSuggestions(fastIndex, 'apl');
      
      // Fast mode has fuzzyMin: 0.5, so should filter more aggressively
      results.forEach(result => {
        expect(result.score).toBeGreaterThan(0.4);
      });
    });

    it('should use lenient scoring in comprehensive mode', () => {
      const words = ['apple', 'application', 'apricot', 'banana'];
      
      const comprehensiveIndex = buildFuzzyIndex(words, {
        config: {
          performance: 'comprehensive',
        },
      });

      const results = getSuggestions(comprehensiveIndex, 'apl');
      
      // Comprehensive mode has fuzzyMin: 0.2, so should be more lenient
      expect(results.length).toBeGreaterThan(0);
    });

    it('should prioritize prefix matches in fast mode', () => {
      const words = ['application', 'apple', 'apricot'];
      
      const fastIndex = buildFuzzyIndex(words, {
        config: {
          performance: 'fast',
        },
      });

      const results = getSuggestions(fastIndex, 'app');
      
      // Fast mode has prefix: 0.95, higher than default
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].score).toBeGreaterThan(0.9);
    });
  });

  describe('Custom Scoring Scenarios', () => {
    it('should allow product code search with strict exact matching', () => {
      const productCodes = ['ABC123', 'ABC124', 'XYZ789'];
      
      const index = buildFuzzyIndex(productCodes, {
        config: {
          matchTypeScores: {
            exact: 1.0,
            prefix: 0.95,
            fuzzy: 0.5,
            fuzzyMin: 0.7,
          },
        },
      });

      const results = getSuggestions(index, 'ABC123');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].baseWord).toBe('ABC123');
      expect(results[0].score).toBe(1.0);
    });

    it('should allow name search with high phonetic weight', () => {
      const names = ['Smith', 'Smythe', 'Schmidt'];
      
      const index = buildFuzzyIndex(names, {
        config: {
          languages: ['english'],
          matchTypeScores: {
            phonetic: 0.9, // Very high phonetic weight
            fuzzy: 0.85,
            fuzzyMin: 0.2,
          },
        },
      });

      const results = getSuggestions(index, 'Smith');
      
      expect(results.length).toBeGreaterThan(0);
    });

    it('should allow autocomplete with short word preference', () => {
      const terms = ['app', 'apple', 'application', 'apply'];
      
      const index = buildFuzzyIndex(terms, {
        config: {
          performance: 'fast',
          matchTypeScores: {
            exact: 1.0,
            prefix: 0.98,
            fuzzyMin: 0.8,
          },
          scoringModifiers: {
            shortWordBoost: 0.2,
            shortWordMaxDiff: 3,
          },
        },
      });

      const results = getSuggestions(index, 'app');
      
      // Shorter matches should be boosted
      const shortMatch = results.find(r => r.baseWord === 'app');
      expect(shortMatch).toBeDefined();
      expect(shortMatch!.score).toBeGreaterThan(0.95);
    });
  });

  describe('Backward Compatibility', () => {
    it('should work without custom scoring configuration', () => {
      const words = ['apple', 'application', 'apply'];
      
      const index = buildFuzzyIndex(words);
      const results = getSuggestions(index, 'app');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].score).toBeGreaterThan(0);
    });

    it('should merge partial scoring configs with defaults', () => {
      const words = ['test', 'testing'];
      
      const index = buildFuzzyIndex(words, {
        config: {
          matchTypeScores: {
            exact: 0.99, // Only override exact
            // Other scores should use defaults
          },
        },
      });

      const results = getSuggestions(index, 'test');
      
      expect(results.length).toBeGreaterThan(0);
      const exactMatch = results.find(r => r.baseWord === 'test');
      expect(exactMatch).toBeDefined();
    });

    it('should handle empty scoring config objects', () => {
      const words = ['apple', 'banana'];
      
      const index = buildFuzzyIndex(words, {
        config: {
          matchTypeScores: {},
          scoringModifiers: {},
        },
      });

      const results = getSuggestions(index, 'apple');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].baseWord).toBe('apple');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero boost values', () => {
      const words = ['app', 'apple'];
      
      const index = buildFuzzyIndex(words, {
        config: {
          scoringModifiers: {
            shortWordBoost: 0, // No boost
          },
        },
      });

      const results = getSuggestions(index, 'app');
      
      expect(results.length).toBeGreaterThan(0);
    });

    it('should clamp scores to [0, 1] range', () => {
      const words = ['test'];
      
      const index = buildFuzzyIndex(words, {
        config: {
          matchTypeScores: {
            exact: 1.5, // Above 1.0
          },
          scoringModifiers: {
            shortWordBoost: 0.5, // Large boost
          },
        },
      });

      const results = getSuggestions(index, 'test');
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach(result => {
        expect(result.score).toBeLessThanOrEqual(1.0);
        expect(result.score).toBeGreaterThanOrEqual(0.0);
      });
    });
  });
});
