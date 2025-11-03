/**
 * E-Commerce Filtering System
 * Works with multi-field search results to filter by ranges, terms, and booleans
 */
import type { SuggestionResult } from "./types.js";
/**
 * Range filter for numeric fields
 */
export interface RangeFilter {
    field: string;
    min?: number;
    max?: number;
}
/**
 * Term filter for categorical fields
 */
export interface TermFilter {
    field: string;
    values: any[];
    operator?: "AND" | "OR";
}
/**
 * Boolean filter
 */
export interface BooleanFilter {
    field: string;
    value: boolean;
}
/**
 * Combined filter options
 */
export interface FilterOptions {
    ranges?: RangeFilter[];
    terms?: TermFilter[];
    booleans?: BooleanFilter[];
}
/**
 * Apply filters to search results
 * Works with result.fields property populated by multi-field search
 */
export declare function applyFilters(results: SuggestionResult[], filters: FilterOptions): SuggestionResult[];
//# sourceMappingURL=filters.d.ts.map