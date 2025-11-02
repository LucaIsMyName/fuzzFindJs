import { buildFuzzyIndex, getSuggestions } from './dist/esm/index.js';

const index = buildFuzzyIndex(['café'], { 
  config: { languages: ['english'], minQueryLength: 1 } 
});

// Try with different thresholds
console.log('Default threshold:');
let results = getSuggestions(index, 'cafe', 10);
console.log('  Results:', results.length);

console.log('\nWith fuzzyThreshold: 0.3:');
results = getSuggestions(index, 'cafe', 10, { fuzzyThreshold: 0.3 });
console.log('  Results:', results.length, results.length > 0 ? results[0] : '');

console.log('\nWith fuzzyThreshold: 0.1:');
results = getSuggestions(index, 'cafe', 10, { fuzzyThreshold: 0.1 });
console.log('  Results:', results.length, results.length > 0 ? results[0] : '');
