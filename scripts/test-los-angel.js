import { buildFuzzyIndex, getSuggestions } from '../dist/esm/index.js';

const testData = ['Los Angeles'];

console.log('🧪 Testing "Los Angel" Scoring\n');
console.log('='.repeat(60));

const index = buildFuzzyIndex(testData, {
  config: { 
    performance: 'balanced'
  }
});

const results = getSuggestions(index, 'Los Angel', 5);

console.log(`Query: "Los Angel"`);
results.forEach(r => {
  console.log(`  → ${r.display}`);
  console.log(`     Score: ${r.score.toFixed(4)}`);
  // @ts-ignore
  console.log(`     Match Type: ${r._debug_matchType || 'unknown'}`);
});

console.log('\n\n✅ Test complete!');
