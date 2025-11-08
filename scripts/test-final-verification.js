import { buildFuzzyIndex, getSuggestions } from '../dist/esm/index.js';

// Test with the exact queries that were failing
const testData = [
  'New York',
  'Los Angeles',
  'San Francisco',
  'San Antonio',
  'Chicago',
  'John Smith',
  'system_factory_4',
  'systemmanager27',
  'user_handler_25',
  'user_helper_577'
];

console.log('🧪 Final Verification Test\n');
console.log('='.repeat(60));

const index = buildFuzzyIndex(testData, {
  config: { performance: 'balanced' }
});

const failingQueries = [
  'Los Angel',   // Was scoring 0.57
  'San Fran',    // Was finding nothing
  'user_h'       // Was finding nothing
];

console.log('\n📊 BALANCED MODE (Default):');
failingQueries.forEach(query => {
  console.log(`\nQuery: "${query}"`);
  const results = getSuggestions(index, query, 3);
  
  if (results.length === 0) {
    console.log('  ❌ No results found');
  } else {
    results.forEach(r => {
      console.log(`  ✅ ${r.display} (score: ${r.score.toFixed(2)})`);
    });
  }
});

console.log('\n\n✅ Test complete!');
console.log('\nExpected results:');
console.log('- "Los Angel" should find "Los Angeles" with high score (>0.80)');
console.log('- "San Fran" should find "San Francisco"');
console.log('- "user_h" should find "user_handler_25" and "user_helper_577"');
