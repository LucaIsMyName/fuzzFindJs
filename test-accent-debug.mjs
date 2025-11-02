import { buildFuzzyIndex, getSuggestions } from './dist/esm/index.js';

const index = buildFuzzyIndex(['café'], { 
  config: { 
    languages: ['english'], 
    minQueryLength: 1,
    features: [] // Disable all features to test exact match only
  } 
});

console.log('Index has "cafe"?', index.variantToBase.has('cafe'));
console.log('Index has "café"?', index.variantToBase.has('café'));

const results = getSuggestions(index, 'cafe', 10);
console.log('Results for "cafe":', results.length);

const results2 = getSuggestions(index, 'café', 10);
console.log('Results for "café":', results2.length);
