/**
 * FuzzyFindJS Example Usage
 * Run with: npm run dev
 */

import { buildFuzzyIndex, getSuggestions, createFuzzySearch } from './src/index.js';

// Example 1: Basic German healthcare search
console.log('=== Example 1: German Healthcare Search ===');
const germanHealthcare = [
  'Krankenhaus',
  'Pflegeheim',
  'Ambulanz',
  'Hausarzt',
  'Zahnarzt',
  'Kinderarzt',
  'Notaufnahme',
  'Apotheke'
];

const healthcareIndex = buildFuzzyIndex(germanHealthcare);

// Test various queries
const queries = ['krankenh', 'arzt', 'notauf', 'apothek'];
queries.forEach(query => {
  const results = getSuggestions(healthcareIndex, query, 3);
  console.log(`Query: "${query}" -> Results:`, results.map(r => `${r.display} (${r.score.toFixed(2)})`));
});

// Example 2: Multi-language search
console.log('\n=== Example 2: Multi-language Search ===');
const multiLangDict = [
  'Krankenhaus', 'Hospital', 'Hôpital', 'Hospital',  // German, English, French, Spanish
  'Schule', 'School', 'École', 'Escuela',
  'Auto', 'Car', 'Voiture', 'Coche'
];

const multiLangIndex = buildFuzzyIndex(multiLangDict, {
  config: { 
    languages: ['german', 'english', 'french', 'spanish'],
    performance: 'comprehensive'
  }
});

const multiQueries = ['kranken', 'hospit', 'schul', 'car'];
multiQueries.forEach(query => {
  const results = getSuggestions(multiLangIndex, query, 5);
  console.log(`Query: "${query}" -> Results:`, results.map(r => `${r.display} (${r.language})`));
});

// Example 3: Using the convenience function
console.log('\n=== Example 3: Quick Start Function ===');
const quickSearch = createFuzzySearch([
  'Kindergarten',
  'Grundschule', 
  'Gymnasium',
  'Universität',
  'Fachhochschule'
], {
  languages: ['german'],
  performance: 'fast',
  maxResults: 3
});

const quickQueries = ['kinder', 'schul', 'uni'];
quickQueries.forEach(query => {
  const results = quickSearch.search(query);
  console.log(`Quick search "${query}":`, results.map(r => r.display));
});

// Example 4: Performance comparison
console.log('\n=== Example 4: Performance Test ===');
const largeDictionary = Array.from({ length: 1000 }, (_, i) => 
  `TestWord${i}_${Math.random().toString(36).substring(7)}`
);

console.time('Index build time');
const largeIndex = buildFuzzyIndex(largeDictionary, {
  config: { performance: 'balanced' }
});
console.timeEnd('Index build time');

console.time('Search time');
const searchResults = getSuggestions(largeIndex, 'testword', 10);
console.timeEnd('Search time');

console.log(`Found ${searchResults.length} results in large dictionary`);

// Example 5: Custom configuration
console.log('\n=== Example 5: Custom Configuration ===');
const customIndex = buildFuzzyIndex(['Straßenbahn', 'Straße', 'Straßenkreuzung'], {
  config: {
    languages: ['german'],
    features: ['phonetic', 'partial-words', 'missing-letters'],
    fuzzyThreshold: 0.6,
    maxEditDistance: 3,
    maxResults: 5
  }
});

const customResults = getSuggestions(customIndex, 'strass', 5);
console.log('Custom config results:', customResults.map(r => `${r.display} (${r.score.toFixed(2)})`));
