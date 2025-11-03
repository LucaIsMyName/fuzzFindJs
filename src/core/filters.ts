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
export function applyFilters(results: SuggestionResult[], filters: FilterOptions): SuggestionResult[] {
  let filtered = results;

  if (filters.ranges && filters.ranges.length > 0) {
    filtered = filtered.filter((result) => {
      if (!result.fields) return true;
      
      return filters.ranges!.every((range) => {
        const value = result.fields![range.field];
        if (value === undefined) return true;
        
        const numValue = Number(value);
        if (isNaN(numValue)) return true;
        
        if (range.min !== undefined && numValue < range.min) return false;
        if (range.max !== undefined && numValue > range.max) return false;
        
        return true;
      });
    });
  }

  if (filters.terms && filters.terms.length > 0) {
    filtered = filtered.filter((result) => {
      if (!result.fields) return true;
      
      return filters.terms!.every((term) => {
        const value = result.fields![term.field];
        if (value === undefined) return true;
        
        const operator = term.operator || "OR";
        
        if (operator === "OR") {
          return term.values.some((filterValue) => matchValue(value, filterValue));
        } else {
          // AND for array fields
          if (Array.isArray(value)) {
            return term.values.every((filterValue) =>
              value.some((v) => matchValue(v, filterValue))
            );
          }
          return term.values.some((filterValue) => matchValue(value, filterValue));
        }
      });
    });
  }

  if (filters.booleans && filters.booleans.length > 0) {
    filtered = filtered.filter((result) => {
      if (!result.fields) return true;
      
      return filters.booleans!.every((boolFilter) => {
        const value = result.fields![boolFilter.field];
        if (value === undefined) return true;
        
        const boolValue = typeof value === "boolean" ? value : String(value) === "true" || Number(value) === 1;
        
        return boolValue === boolFilter.value;
      });
    });
  }

  return filtered;
}

function matchValue(value: any, filterValue: any): boolean {
  if (value === filterValue) return true;
  
  if (typeof value === "string" && typeof filterValue === "string") {
    return value.toLowerCase() === filterValue.toLowerCase();
  }
  
  const numValue = Number(value);
  const numFilterValue = Number(filterValue);
  if (!isNaN(numValue) && !isNaN(numFilterValue)) {
    return numValue === numFilterValue;
  }
  
  return false;
}
