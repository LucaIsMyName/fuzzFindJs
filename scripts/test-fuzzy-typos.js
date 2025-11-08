import { buildFuzzyIndex, getSuggestions } from '../dist/esm/index.js';

const testData = [
  'machine learning',
  'artificial intelligence',
  'data science',
  'New York',
  'Los Angeles',
  'Chicago',
  'John Smith',
  'Emma Johnson',
  'Michael Williams'
];

const typoQueries = [
  'machne learning',      // missing 'i'
  'artifical intelligence', // missing 'i'
  'dta science',          // missing 'a'
  'Nwe York',             // transposition
  'Los Angelos',          // extra 'o'
  'Chicgo',               // missing 'a'
  'Jhon Smith',           // transposition
  'Ema Johnson',          // missing 'm'
  'Micheal Williams'      // extra 'e'
];

console.log('🧪 Testing Fuzzy Matching with Typos\n');
console.log('='.repeat(60));

// Test with balanced mode
console.log('\n📊 BALANCED MODE:');
const balancedIndex = buildFuzzyIndex(testData, {
  config: { performance: 'balanced' }
});

typoQueries.forEach((query, i) => {
  const results = getSuggestions(balancedIndex, query, 3);
  console.log(`\nQuery ${i + 1}: "${query}"`);
  if (results.length === 0) {
    console.log('  ❌ No results found');
  } else {
    results.forEach(r => {
      console.log(`  ✅ ${r.display} (score: ${r.score.toFixed(2)})`);
    });
  }
});

// Test with fast mode
console.log('\n\n📊 FAST MODE:');
const fastIndex = buildFuzzyIndex(testData, {
  config: { performance: 'fast' }
});

typoQueries.forEach((query, i) => {
  const results = getSuggestions(fastIndex, query, 3);
  console.log(`\nQuery ${i + 1}: "${query}"`);
  if (results.length === 0) {
    console.log('  ❌ No results found');
  } else {
    results.forEach(r => {
      console.log(`  ✅ ${r.display} (score: ${r.score.toFixed(2)})`);
    });
  }
});

console.log('\n\n✅ Test complete!');
