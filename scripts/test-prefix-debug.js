import { buildFuzzyIndex, getSuggestions } from '../dist/esm/index.js';

const testData = [
  'San Francisco',
  'San Antonio',
  'user_handler_25',
  'user_helper_577'
];

console.log('🧪 Testing Prefix Matching\n');
console.log('='.repeat(60));

const index = buildFuzzyIndex(testData, {
  config: { 
    performance: 'balanced'
  }
});

const queries = [
  'San Fran',
  'San',
  'user_h',
  'user_'
];

queries.forEach(query => {
  console.log(`\nQuery: "${query}"`);
  const results = getSuggestions(index, query, 5, { debug: false });
  
  if (results.length === 0) {
    console.log('  ❌ No results found');
  } else {
    results.forEach(r => {
      console.log(`  ✅ ${r.display} (score: ${r.score.toFixed(2)})`);
    });
  }
});

console.log('\n\n✅ Test complete!');
