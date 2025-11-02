import type { FuzzyIndex, SuggestionResult, BuildIndexOptions, SearchOptions } from "./types.js";
/**
 * Build a fuzzy search index from a dictionary of words or objects
 */
export declare function buildFuzzyIndex(words?: (string | any)[], options?: BuildIndexOptions): FuzzyIndex;
/**
 * Batch search multiple queries at once
 * Deduplicates identical queries and returns results for all
 */
export declare function batchSearch(index: FuzzyIndex, queries: string[], maxResults?: number, options?: SearchOptions): Record<string, SuggestionResult[]>;
/**
 * Get fuzzy search suggestions from an index
 * Auto-detects whether to use inverted index or classic hash-based approach
 */
export declare function getSuggestions(index: FuzzyIndex, query: string, maxResults?: number, options?: SearchOptions): SuggestionResult[];
/**
 * Update an existing index by adding new items
 * Much faster than rebuilding the entire index
 *
 * @param index - Existing fuzzy index to update
 * @param newItems - New items to add (strings or objects)
 * @param options - Optional configuration (uses index's existing config by default)
 * @returns Updated index (mutates the original)
 *
 * @example
 * const index = buildFuzzyIndex(['apple', 'banana']);
 * updateIndex(index, ['cherry', 'date']);
 * // Index now contains: apple, banana, cherry, date
 */
export declare function updateIndex(index: FuzzyIndex, newItems?: (string | any)[], options?: Partial<BuildIndexOptions>): FuzzyIndex;
/**
 * Remove items from an existing index
 *
 * @param index - Existing fuzzy index to update
 * @param itemsToRemove - Items to remove (exact matches)
 * @returns Updated index (mutates the original)
 *
 * @example
 * const index = buildFuzzyIndex(['apple', 'banana', 'cherry']);
 * removeFromIndex(index, ['banana']);
 * // Index now contains: apple, cherry
 */
export declare function removeFromIndex(index: FuzzyIndex, itemsToRemove?: string[]): FuzzyIndex;
//# sourceMappingURL=index.d.ts.map