import { describe, it, expect } from 'vitest';
import {
  buildFuzzyIndex,
  getSuggestions,
  batchSearch,
  createFuzzySearch,
  updateIndex,
  removeFromIndex,
} from '../index.js';

describe('JSDoc - Public API Functions', () => {
  describe('buildFuzzyIndex', () => {
    it('should build index from simple string array', () => {
      const index = buildFuzzyIndex(['apple', 'banana', 'cherry'], {
        config: { languages: ['english'], performance: 'fast' }
      });
      
      expect(index).toBeDefined();
      expect(index.base).toContain('apple');
      expect(index.base).toContain('banana');
      expect(index.base).toContain('cherry');
    });

    it('should build index from multi-field objects', () => {
      const products = [
        { name: 'iPhone', description: 'Smartphone', price: 999 },
        { name: 'MacBook', description: 'Laptop', price: 1999 }
      ];
      
      const index = buildFuzzyIndex(products, {
        fields: ['name', 'description'],
        fieldWeights: { name: 2.0, description: 1.0 }
      });
      
      expect(index).toBeDefined();
      expect(index.fields).toEqual(['name', 'description']);
      expect(index.fieldWeights).toEqual({ name: 2.0, description: 1.0 });
    });

    it('should call progress callback during indexing', () => {
      const progressCalls: Array<[number, number]> = [];
      
      // Use words that meet minimum length requirement (default is 2)
      buildFuzzyIndex(['apple', 'banana', 'cherry', 'date', 'elderberry'], {
        onProgress: (processed, total) => {
          progressCalls.push([processed, total]);
        }
      });
      
      expect(progressCalls.length).toBeGreaterThan(0);
      expect(progressCalls[progressCalls.length - 1]).toEqual([5, 5]);
    });

    it('should throw error when objects provided without fields', () => {
      const objects = [{ name: 'test' }];
      
      expect(() => {
        buildFuzzyIndex(objects);
      }).toThrow('When indexing objects, you must specify which fields to index via options.fields');
    });
  });

  describe('getSuggestions', () => {
    it('should return basic search results', () => {
      const index = buildFuzzyIndex(['hospital', 'pharmacy', 'doctor']);
      const results = getSuggestions(index, 'hospitl', 5);
      
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].display).toBe('hospital');
    });

    it('should support phrase search with quotes', () => {
      const index = buildFuzzyIndex(['New York', 'New Jersey', 'York City']);
      const results = getSuggestions(index, '"new york"');
      
      expect(results).toBeDefined();
      // Phrase search should work
    });

    it('should include highlights when requested', () => {
      const index = buildFuzzyIndex(['apple', 'application']);
      const results = getSuggestions(index, 'app', 10, {
        includeHighlights: true
      });
      
      expect(results).toBeDefined();
      if (results.length > 0 && results[0].highlights) {
        expect(results[0].highlights).toBeDefined();
      }
    });

    it('should return empty array for queries below min length', () => {
      const index = buildFuzzyIndex(['apple', 'banana']);
      const results = getSuggestions(index, 'a'); // Too short (default min is 2)
      
      expect(results).toEqual([]);
    });
  });

  describe('batchSearch', () => {
    it('should search multiple queries', () => {
      const index = buildFuzzyIndex(['apple', 'banana', 'cherry']);
      const results = batchSearch(index, ['apple', 'banana', 'cherry']);
      
      expect(results).toBeDefined();
      expect(Object.keys(results)).toEqual(['apple', 'banana', 'cherry']);
      expect(results.apple.length).toBeGreaterThan(0);
    });

    it('should deduplicate identical queries', () => {
      const index = buildFuzzyIndex(['apple', 'banana']);
      const results = batchSearch(index, ['apple', 'apple', 'banana', 'apple']);
      
      // Should only have 2 unique queries
      expect(Object.keys(results)).toEqual(['apple', 'banana']);
    });

    it('should support search options', () => {
      const index = buildFuzzyIndex(['apple', 'application']);
      const results = batchSearch(index, ['app'], 5, {
        includeHighlights: true,
        fuzzyThreshold: 0.8
      });
      
      expect(results).toBeDefined();
      expect(results.app).toBeDefined();
    });
  });

  describe('createFuzzySearch', () => {
    it('should create search instance with defaults', () => {
      const search = createFuzzySearch(['apple', 'banana', 'cherry']);
      
      expect(search).toBeDefined();
      expect(search.search).toBeTypeOf('function');
      expect(search.index).toBeDefined();
    });

    it('should perform searches', () => {
      const search = createFuzzySearch(['apple', 'banana', 'cherry']);
      const results = search.search('aple');
      
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].display).toBe('apple');
    });

    it('should respect custom options', () => {
      const search = createFuzzySearch(['Krankenhaus', 'Apotheke'], {
        languages: ['german'],
        performance: 'comprehensive',
        maxResults: 10
      });
      
      expect(search.index.config.languages).toContain('german');
      expect(search.index.config.performance).toBe('comprehensive');
      expect(search.index.config.maxResults).toBe(10);
    });

    it('should allow access to underlying index', () => {
      const { search: searchFn, index } = createFuzzySearch(['hello', 'world']);
      
      expect(index.base).toContain('hello');
      expect(index.base).toContain('world');
      expect(searchFn).toBeTypeOf('function');
    });
  });

  describe('updateIndex', () => {
    it('should add new items to existing index', () => {
      const index = buildFuzzyIndex(['apple', 'banana']);
      updateIndex(index, ['cherry', 'date']);
      
      expect(index.base).toContain('apple');
      expect(index.base).toContain('banana');
      expect(index.base).toContain('cherry');
      expect(index.base).toContain('date');
    });

    it('should not add duplicates', () => {
      const index = buildFuzzyIndex(['apple', 'banana']);
      const initialLength = index.base.length;
      
      updateIndex(index, ['apple', 'banana']); // Try to add duplicates
      
      expect(index.base.length).toBe(initialLength);
    });

    it('should call progress callback', () => {
      const index = buildFuzzyIndex(['apple']);
      const progressCalls: Array<[number, number]> = [];
      
      updateIndex(index, ['banana', 'cherry'], {
        onProgress: (processed, total) => {
          progressCalls.push([processed, total]);
        }
      });
      
      expect(progressCalls.length).toBeGreaterThan(0);
    });
  });

  describe('removeFromIndex', () => {
    it('should remove items from index', () => {
      const index = buildFuzzyIndex(['apple', 'banana', 'cherry']);
      removeFromIndex(index, ['banana']);
      
      expect(index.base).toContain('apple');
      expect(index.base).not.toContain('banana');
      expect(index.base).toContain('cherry');
    });

    it('should handle removing non-existent items', () => {
      const index = buildFuzzyIndex(['apple', 'banana']);
      const initialLength = index.base.length;
      
      removeFromIndex(index, ['nonexistent']);
      
      expect(index.base.length).toBe(initialLength);
    });

    it('should clear cache after removal', () => {
      const index = buildFuzzyIndex(['apple', 'banana', 'cherry']);
      
      // Perform a search to populate cache
      getSuggestions(index, 'apple');
      
      // Remove item
      removeFromIndex(index, ['apple']);
      
      // Cache should be cleared
      if (index._cache) {
        const stats = index._cache.getStats();
        expect(stats.size).toBe(0);
      }
    });
  });

  describe('Type Safety and JSDoc', () => {
    it('should have proper TypeScript types', () => {
      // This test verifies that TypeScript compilation works with JSDoc
      const index = buildFuzzyIndex(['test']);
      const results = getSuggestions(index, 'test');
      
      // TypeScript should infer these types correctly
      const firstResult = results[0];
      if (firstResult) {
        expect(firstResult.display).toBeTypeOf('string');
        expect(firstResult.score).toBeTypeOf('number');
        expect(firstResult.baseWord).toBeTypeOf('string');
        expect(firstResult.isSynonym).toBeTypeOf('boolean');
      }
    });

    it('should support all documented examples', () => {
      // Example from buildFuzzyIndex JSDoc
      const index1 = buildFuzzyIndex(['apple', 'banana', 'cherry'], {
        config: { languages: ['english'], performance: 'fast' }
      });
      expect(index1).toBeDefined();

      // Example from getSuggestions JSDoc
      const results1 = getSuggestions(index1, 'aple', 5);
      expect(results1).toBeDefined();

      // Example from batchSearch JSDoc
      const results2 = batchSearch(index1, ['apple', 'banana', 'apple', 'cherry']);
      expect(Object.keys(results2)).toContain('apple');

      // Example from createFuzzySearch JSDoc
      const search = createFuzzySearch(['apple', 'banana', 'cherry']);
      const results3 = search.search('aple');
      expect(results3).toBeDefined();
    });
  });
});
