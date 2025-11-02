import { buildFuzzyIndex } from './dist/esm/index.js';

const index = buildFuzzyIndex(['café'], { 
  config: { languages: ['english'] } 
});

console.log('=== Checking variantToBase ===');
console.log('Has "café"?', index.variantToBase.has('café'));
console.log('Has "cafe"?', index.variantToBase.has('cafe'));
console.log('Has "Café"?', index.variantToBase.has('Café'));
console.log('Has "CAFE"?', index.variantToBase.has('CAFE'));

console.log('\n=== All keys containing "caf" ===');
for (const key of index.variantToBase.keys()) {
  if (key.includes('caf')) {
    console.log(`"${key}" -> [${Array.from(index.variantToBase.get(key)).join(', ')}]`);
  }
}
