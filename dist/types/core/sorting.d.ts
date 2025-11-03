/**
 * E-Commerce Custom Sorting System
 * Works with multi-field search results to sort by any field
 */
import type { SuggestionResult } from "./types.js";
/**
 * Sort option for a field
 */
export interface SortOption {
    field: string;
    order: "asc" | "desc";
    type?: "number" | "string" | "date";
}
/**
 * Sort configuration
 */
export interface SortConfig {
    primary: SortOption;
    secondary?: SortOption;
    keepRelevance?: boolean;
}
/**
 * Apply custom sorting to search results
 * Works with result.fields property populated by multi-field search
 */
export declare function applySorting(results: SuggestionResult[], sortConfig: SortConfig): SuggestionResult[];
//# sourceMappingURL=sorting.d.ts.map