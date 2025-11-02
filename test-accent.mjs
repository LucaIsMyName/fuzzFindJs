import { buildFuzzyIndex, getSuggestions } from './dist/esm/index.js';

console.log('=== Testing Accent Normalization ===\n');

// Test 1: Build index with accented word
const index = buildFuzzyIndex(['café'], { 
  config: { languages: ['english'], minQueryLength: 1 } 
});

console.log('Built index for: café');
console.log('variantToBase entries (first 10):');
let count = 0;
for (const [key, values] of index.variantToBase.entries()) {
  if (count++ < 10) {
    console.log(`  "${key}" -> [${Array.from(values).join(', ')}]`);
  }
}

// Test 2: Search with non-accented query
console.log('\n=== Searching for "cafe" ===');
const results = getSuggestions(index, 'cafe');
console.log('Results:', results.length);
if (results.length > 0) {
  console.log('First result:', results[0]);
} else {
  console.log('No results found!');
}

// Test 3: Search with accented query
console.log('\n=== Searching for "café" ===');
const results2 = getSuggestions(index, 'café');
console.log('Results:', results2.length);
if (results2.length > 0) {
  console.log('First result:', results2[0]);
}
