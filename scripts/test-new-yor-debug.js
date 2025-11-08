import { buildFuzzyIndex, getSuggestions } from './dist/esm/index.js';

// Simulate large dataset to trigger inverted index (needs 10k+ items)
const largeDataset = [
  'New York',
  'New Orleans',
  'Los Angeles',
  ...Array.from({ length: 10500 }, (_, i) => `random_word_${i}`)
];

console.log(`Dataset size: ${largeDataset.length} items`);

console.log('🧪 Testing "New Yor" with Large Dataset (Inverted Index)\n');
console.log('='.repeat(60));

const index = buildFuzzyIndex(largeDataset, {
  config: { 
    performance: 'balanced'
  }
});

console.log(`\nIndex uses inverted index: ${index.invertedIndex ? 'YES' : 'NO'}`);
console.log(`Index properties:`, Object.keys(index).filter(k => !k.startsWith('_')));

const results = getSuggestions(index, 'New Yor', 5, { debug: false });

console.log(`\nQuery: "New Yor"`);
console.log(`Results found: ${results.length}`);
results.forEach(r => {
  console.log(`  → ${r.display}`);
  console.log(`     Score: ${r.score.toFixed(4)}`);
  // @ts-ignore
  console.log(`     Match Type: ${r._debug_matchType || 'unknown'}`);
});

// Check what's in the inverted index
console.log(`\n\nChecking inverted index:`);
if (index.invertedIndex && index.invertedIndex.termTrie) {
  const prefixResults = index.invertedIndex.termTrie.findWithPrefix('new yor');
  console.log(`Trie prefix search for "new yor":`, prefixResults.slice(0, 5).map(([term, docIds]) => `${term} (docs: ${docIds.join(',')})`));
  
  // Check what document 0 is
  if (index.documents && index.documents[0]) {
    console.log(`\nDocument 0:`, index.documents[0]);
  }
  
  // Check termToPostings
  const newYorkPosting = index.invertedIndex.termToPostings.get('new york');
  console.log(`\nPosting list for "new york":`, newYorkPosting);
}

console.log('\n\n✅ Test complete!');
console.log('\nExpected: "New York" should score ~0.94 (prefix match)');
console.log('If scoring lower, it may be treated as phrase/substring instead');
