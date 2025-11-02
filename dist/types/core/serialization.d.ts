/**
 * Index Serialization
 * Save and load fuzzy search indices for 100x faster startup
 */
import type { FuzzyIndex } from "./types.js";
/**
 * Serialize a FuzzyIndex to JSON string
 */
export declare function serializeIndex(index: FuzzyIndex): string;
/**
 * Deserialize a FuzzyIndex from JSON string
 */
export declare function deserializeIndex(json: string): Promise<FuzzyIndex>;
/**
 * Save index to localStorage (browser)
 */
export declare function saveIndexToLocalStorage(index: FuzzyIndex, key?: string): void;
/**
 * Load index from localStorage (browser)
 */
export declare function loadIndexFromLocalStorage(key?: string): Promise<FuzzyIndex | null>;
/**
 * Get serialized index size in bytes
 */
export declare function getSerializedSize(index: FuzzyIndex): number;
//# sourceMappingURL=serialization.d.ts.map