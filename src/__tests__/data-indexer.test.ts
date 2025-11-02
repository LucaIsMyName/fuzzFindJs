import { describe, it, expect } from 'vitest';
import { dataToIndex, dataToIndexAsync } from '../index.js';

describe('Data Indexer Utility', () => {
  describe('String Format (Default)', () => {
    it('should extract unique words from plain text', () => {
      const text = 'Hello world! Hello again.';
      const words = dataToIndex(text);
      
      expect(words).toContain('hello');
      expect(words).toContain('world');
      expect(words).toContain('again');
      expect(words.length).toBe(3); // No duplicates
    });

    it('should handle punctuation correctly', () => {
      const text = 'Hello, world! How are you?';
      const words = dataToIndex(text);
      
      expect(words).toContain('hello');
      expect(words).toContain('world');
      expect(words).toContain('how');
      expect(words).toContain('are');
      expect(words).toContain('you');
    });

    it('should respect minimum length', () => {
      const text = 'I am a developer';
      const words = dataToIndex(text, { minLength: 3 });
      
      expect(words).not.toContain('i');
      expect(words).not.toContain('am');
      expect(words).toContain('developer');
    });

    it('should remove numbers when requested', () => {
      const text = 'Product 123 costs 456 dollars';
      const words = dataToIndex(text, { removeNumbers: true });
      
      expect(words).not.toContain('123');
      expect(words).not.toContain('456');
      expect(words).toContain('product');
      expect(words).toContain('costs');
      expect(words).toContain('dollars');
    });

    it('should handle case sensitivity', () => {
      const text = 'Hello HELLO World';
      const wordsInsensitive = dataToIndex(text, { caseSensitive: false });
      const wordsSensitive = dataToIndex(text, { caseSensitive: true });
      
      expect(wordsInsensitive.length).toBe(2);
      expect(wordsInsensitive).toContain('hello');
      expect(wordsInsensitive).toContain('world');
      
      expect(wordsSensitive.length).toBe(3);
      expect(wordsSensitive).toContain('Hello');
      expect(wordsSensitive).toContain('HELLO');
      expect(wordsSensitive).toContain('World');
    });

    it('should filter stop words', () => {
      const text = 'the quick brown fox';
      const words = dataToIndex(text, {
        stopWords: ['the', 'a', 'an']
      });
      
      expect(words).not.toContain('the');
      expect(words).toContain('quick');
      expect(words).toContain('brown');
      expect(words).toContain('fox');
    });
  });

  describe('HTML Format', () => {
    it('should strip HTML tags', () => {
      const html = '<h1>Hello</h1><p>World</p>';
      const words = dataToIndex(html, { format: 'html' });
      
      expect(words).toContain('hello');
      expect(words).toContain('world');
      expect(words.length).toBe(2);
    });

    it('should remove script and style tags', () => {
      const html = `
        <html>
          <head>
            <script>console.log('test');</script>
            <style>.class { color: red; }</style>
          </head>
          <body>
            <h1>Title</h1>
            <p>Content</p>
          </body>
        </html>
      `;
      const words = dataToIndex(html, { format: 'html' });
      
      expect(words).toContain('title');
      expect(words).toContain('content');
      expect(words).not.toContain('console');
      expect(words).not.toContain('log');
      expect(words).not.toContain('class');
      expect(words).not.toContain('color');
    });

    it('should decode HTML entities', () => {
      const html = '<p>Hello&nbsp;world &amp; friends</p>';
      const words = dataToIndex(html, { format: 'html' });
      
      expect(words).toContain('hello');
      expect(words).toContain('world');
      expect(words).toContain('friends');
    });

    it('should handle complex HTML', () => {
      const html = `
        <div class="container">
          <h1>Product Title</h1>
          <p>This is a <strong>great</strong> product!</p>
          <ul>
            <li>Feature 1</li>
            <li>Feature 2</li>
          </ul>
        </div>
      `;
      const words = dataToIndex(html, { format: 'html' });
      
      expect(words).toContain('product');
      expect(words).toContain('title');
      expect(words).toContain('great');
      expect(words).toContain('feature');
    });
  });

  describe('JSON Format', () => {
    it('should extract string values from JSON', () => {
      const json = JSON.stringify({
        name: 'John',
        city: 'New York',
        age: 30
      });
      const words = dataToIndex(json, { format: 'json' });
      
      expect(words).toContain('john');
      expect(words).toContain('new');
      expect(words).toContain('york');
      expect(words).not.toContain('30'); // Numbers in JSON are not strings
    });

    it('should handle nested JSON objects', () => {
      const json = JSON.stringify({
        user: {
          name: 'Jane',
          address: {
            city: 'Boston',
            state: 'MA'
          }
        }
      });
      const words = dataToIndex(json, { format: 'json' });
      
      expect(words).toContain('jane');
      expect(words).toContain('boston');
      expect(words).toContain('ma');
    });

    it('should handle JSON arrays', () => {
      const json = JSON.stringify([
        { title: 'Product 1', description: 'Great item' },
        { title: 'Product 2', description: 'Amazing deal' }
      ]);
      const words = dataToIndex(json, { format: 'json' });
      
      expect(words).toContain('product');
      expect(words).toContain('great');
      expect(words).toContain('item');
      expect(words).toContain('amazing');
      expect(words).toContain('deal');
    });

    it('should handle invalid JSON gracefully', () => {
      const invalidJson = '{ invalid json }';
      const words = dataToIndex(invalidJson, { format: 'json' });
      
      expect(words).toEqual([]);
    });
  });

  describe('Base64 Format', () => {
    it('should decode base64 and extract words', () => {
      const text = 'Hello World';
      const base64 = btoa(text);
      const words = dataToIndex(base64, { format: 'base64' });
      
      expect(words).toContain('hello');
      expect(words).toContain('world');
    });

    it('should handle invalid base64 gracefully', () => {
      const invalidBase64 = 'not-valid-base64!!!';
      const words = dataToIndex(invalidBase64, { format: 'base64' });
      
      expect(words).toEqual([]);
    });
  });

  describe('Text Chunking', () => {
    it('should chunk text by word count', () => {
      const text = 'one two three four five six seven eight nine ten';
      const words = dataToIndex(text, {
        chunkSize: 20, // Small chunks
        splitOn: 'word'
      });
      
      // Should still get all unique words
      expect(words).toContain('one');
      expect(words).toContain('five');
      expect(words).toContain('ten');
    });

    it('should handle overlap in chunks', () => {
      const text = 'word1 word2 word3 word4 word5';
      const words = dataToIndex(text, {
        chunkSize: 15,
        overlap: 5,
        splitOn: 'word'
      });
      
      // All words should be present
      expect(words.length).toBe(5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      const words = dataToIndex('');
      expect(words).toEqual([]);
    });

    it('should handle whitespace only', () => {
      const words = dataToIndex('   \n\t  ');
      expect(words).toEqual([]);
    });

    it('should handle special characters', () => {
      const text = 'hello world test tag price';
      const words = dataToIndex(text);
      
      expect(words).toContain('hello');
      expect(words).toContain('world');
      expect(words).toContain('test');
      expect(words).toContain('tag');
      expect(words).toContain('price');
      expect(words.length).toBe(5);
    });

    it('should handle unicode characters', () => {
      const text = 'café naïve résumé';
      const words = dataToIndex(text);
      
      expect(words).toContain('café');
      expect(words).toContain('naïve');
      expect(words).toContain('résumé');
    });

    it('should handle very long text', () => {
      const longText = 'word '.repeat(10000);
      const words = dataToIndex(longText);
      
      expect(words).toEqual(['word']);
    });
  });

  describe('Integration with FuzzySearch', () => {
    it('should work with buildFuzzyIndex', async () => {
      const { buildFuzzyIndex, getSuggestions } = await import('../index.js');
      
      const html = '<h1>Coffee</h1><p>Kaffee is German for coffee</p>';
      const dictionary = dataToIndex(html, { format: 'html' });
      
      const index = buildFuzzyIndex(dictionary);
      const results = getSuggestions(index, 'kaffee');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].display).toBe('kaffee');
    });

    it('should work with createFuzzySearch', async () => {
      const { createFuzzySearch } = await import('../index.js');
      
      const text = 'apple banana cherry date elderberry fig grape';
      const dictionary = dataToIndex(text);
      
      const search = createFuzzySearch(dictionary);
      const results = search.search('banan');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].display).toBe('banana');
    });
  });

  describe('Async URL Format', () => {
    it('should throw error for URL format in sync function', () => {
      expect(() => {
        dataToIndex('https://example.com', { format: 'url' });
      }).toThrow('URL format requires async');
    });

    it('should handle URL format in async function', async () => {
      // Mock fetch for testing
      global.fetch = async () => ({
        text: async () => '<html><body>Test Content</body></html>'
      }) as Response;

      const words = await dataToIndexAsync('https://example.com', { format: 'url' });
      
      expect(words).toContain('test');
      expect(words).toContain('content');
    });
  });

  describe('Real-World Examples', () => {
    it('should index a blog post', () => {
      const html = `
        <article>
          <h1>Introduction to TypeScript</h1>
          <p>TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.</p>
          <p>It offers classes, modules, and interfaces to help you build robust components.</p>
        </article>
      `;
      const words = dataToIndex(html, {
        format: 'html',
        minLength: 3,
        stopWords: ['the', 'a', 'to', 'of', 'and', 'that', 'it', 'is']
      });
      
      expect(words).toContain('typescript');
      expect(words).toContain('javascript');
      expect(words).toContain('classes');
      expect(words).toContain('modules');
      expect(words).toContain('interfaces');
      expect(words).not.toContain('the');
      expect(words).not.toContain('and');
    });

    it('should index product data', () => {
      const products = [
        { name: 'iPhone 15', category: 'Electronics', price: 999 },
        { name: 'MacBook Pro', category: 'Computers', price: 2499 },
        { name: 'AirPods', category: 'Audio', price: 199 }
      ];
      const words = dataToIndex(JSON.stringify(products), {
        format: 'json',
        minLength: 3
      });
      
      expect(words).toContain('iphone');
      expect(words).toContain('macbook');
      expect(words).toContain('pro');
      expect(words).toContain('airpods');
      expect(words).toContain('electronics');
      expect(words).toContain('computers');
      expect(words).toContain('audio');
    });
  });
});
