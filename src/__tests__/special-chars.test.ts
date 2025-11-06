import { describe, it, expect } from 'vitest';
import { buildFuzzyIndex, getSuggestions } from '../index.js';

describe('Special Character Handling', () => {
  describe('Underscore-separated identifiers', () => {
    const dictionary = [
      'api_manager_3254',
      'api_ugicx',
      'api_edlsn',
      'api_lfnrj',
      'user_service',
      'data_processor',
      'api_handler_v2'
    ];

    it('should find matches for "api_" prefix', () => {
      const index = buildFuzzyIndex(dictionary);
      const results = getSuggestions(index, 'api_', 10);
      
      expect(results.length).toBeGreaterThan(0);
      // Should match all api_* entries
      const apiMatches = results.filter(r => r.display.startsWith('api_'));
      expect(apiMatches.length).toBeGreaterThan(0);
    });

    it('should find matches for "api" without underscore', () => {
      const index = buildFuzzyIndex(dictionary);
      const results = getSuggestions(index, 'api', 10);
      
      expect(results.length).toBeGreaterThan(0);
      // Should match all api_* entries
      const apiMatches = results.filter(r => r.display.startsWith('api_'));
      expect(apiMatches.length).toBeGreaterThan(0);
    });

    it('should find matches for "manager" token', () => {
      const index = buildFuzzyIndex(dictionary);
      const results = getSuggestions(index, 'manager', 10);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.display === 'api_manager_3254')).toBe(true);
    });

    it('should find matches for partial token "manag"', () => {
      const index = buildFuzzyIndex(dictionary);
      const results = getSuggestions(index, 'manag', 10);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.display === 'api_manager_3254')).toBe(true);
    });
  });

  describe('Hyphen-separated identifiers', () => {
    const dictionary = [
      'user-profile',
      'data-processor',
      'api-handler',
      'test-case-123',
      'my-component-v2'
    ];

    it('should find matches for "user-" prefix', () => {
      const index = buildFuzzyIndex(dictionary);
      const results = getSuggestions(index, 'user-', 10);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.display === 'user-profile')).toBe(true);
    });

    it('should find matches for "profile" token', () => {
      const index = buildFuzzyIndex(dictionary);
      const results = getSuggestions(index, 'profile', 10);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.display === 'user-profile')).toBe(true);
    });

    it('should find matches for "component" token', () => {
      const index = buildFuzzyIndex(dictionary);
      const results = getSuggestions(index, 'component', 10);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.display === 'my-component-v2')).toBe(true);
    });
  });

  describe('Dot-separated identifiers', () => {
    const dictionary = [
      'user.service.ts',
      'api.controller.js',
      'data.model.json',
      'test.spec.ts',
      'config.dev.yaml'
    ];

    it('should find matches for "user" token', () => {
      const index = buildFuzzyIndex(dictionary);
      const results = getSuggestions(index, 'user', 10);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.display === 'user.service.ts')).toBe(true);
    });

    it('should find matches for "service" token', () => {
      const index = buildFuzzyIndex(dictionary);
      const results = getSuggestions(index, 'service', 10);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.display === 'user.service.ts')).toBe(true);
    });

    it('should find matches for "controller" token', () => {
      const index = buildFuzzyIndex(dictionary);
      const results = getSuggestions(index, 'controller', 10);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.display === 'api.controller.js')).toBe(true);
    });
  });

  describe('Mixed special characters', () => {
    const dictionary = [
      'user@email.com',
      'api/v1/users',
      'path\\to\\file',
      'key:value:pair',
      'item#123',
      'price$99.99',
      'func(param)',
      'array[index]',
      'obj{key}',
      'quote"text"',
      "single'quote",
      'percent%20',
      'plus+sign',
      'equals=value',
      'less<than',
      'greater>than',
      'pipe|separator',
      'tilde~approx',
      'backtick`code`',
      'at@symbol'
    ];

    it('should tokenize email addresses', () => {
      const index = buildFuzzyIndex(dictionary);
      const results = getSuggestions(index, 'email', 10);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.display === 'user@email.com')).toBe(true);
    });

    it('should tokenize paths with slashes', () => {
      const index = buildFuzzyIndex(dictionary);
      const results = getSuggestions(index, 'users', 10);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.display === 'api/v1/users')).toBe(true);
    });

    it('should tokenize paths with backslashes', () => {
      const index = buildFuzzyIndex(dictionary);
      const results = getSuggestions(index, 'file', 10);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.display === 'path\\to\\file')).toBe(true);
    });

    it('should tokenize colon-separated values', () => {
      const index = buildFuzzyIndex(dictionary);
      const results = getSuggestions(index, 'value', 10);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.display === 'key:value:pair')).toBe(true);
    });

    it('should tokenize hash/number symbols', () => {
      const index = buildFuzzyIndex(dictionary);
      const results = getSuggestions(index, '123', 10);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.display === 'item#123')).toBe(true);
    });
  });

  describe('CamelCase and PascalCase (no special chars)', () => {
    const dictionary = [
      'getUserProfile',
      'DataProcessor',
      'apiHandler',
      'MyComponent',
      'handleClickEvent'
    ];

    it('should still match camelCase identifiers', () => {
      const index = buildFuzzyIndex(dictionary);
      const results = getSuggestions(index, 'getuser', 10);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.display === 'getUserProfile')).toBe(true);
    });

    it('should match PascalCase identifiers', () => {
      const index = buildFuzzyIndex(dictionary);
      const results = getSuggestions(index, 'dataproc', 10);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.display === 'DataProcessor')).toBe(true);
    });
  });

  describe('Comparison with original behavior', () => {
    const dictionary = [
      'api_manager_3254',
      'api_ugicx',
      'api_edlsn',
      'api_lfnrj'
    ];

    it('should return results for "api_" query (previously returned 0 results)', () => {
      const index = buildFuzzyIndex(dictionary);
      const results = getSuggestions(index, 'api_', 10);
      
      // This was the bug - should now return results
      expect(results.length).toBeGreaterThan(0);
      
      // All results should contain "api"
      results.forEach(result => {
        expect(result.display.toLowerCase()).toContain('api');
      });
    });

    it('should return same or better results for "api" query', () => {
      const index = buildFuzzyIndex(dictionary);
      const results = getSuggestions(index, 'api', 10);
      
      expect(results.length).toBeGreaterThan(0);
      // Should match all entries
      expect(results.length).toBe(dictionary.length);
    });
  });
});
