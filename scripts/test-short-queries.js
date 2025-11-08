import { buildFuzzyIndex, getSuggestions } from '../dist/esm/index.js';

const testData = [
  'San Antonio',
  'San Diego', 
  'San Jose',
  'San Francisco',
  'api_controller_145',
  'api_controller_1042',
  'apicontroller1134',
  'datahandler6786',
  'serviceservice9024'
];

console.log('🧪 Testing Short Queries and Complex Typos\n');
console.log('='.repeat(60));

const index = buildFuzzyIndex(testData, {
  config: { 
    performance: 'balanced',
    maxEditDistance: 3  // Allow more edits for complex typos
  }
});

const queries = [
  'San',
  'api_cntrlll',
  'controller1234',
  'handler5678',
  'hanler5678'
];

queries.forEach(query => {
  console.log(`\nQuery: "${query}"`);
  const results = getSuggestions(index, query, 5);
  
  if (results.length === 0) {
    console.log('  ❌ No results found');
  } else {
    results.forEach(r => {
      console.log(`  ✅ ${r.display} (score: ${r.score.toFixed(2)})`);
    });
  }
});

console.log('\n\n✅ Test complete!');
