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
export function applySorting(results: SuggestionResult[], sortConfig: SortConfig): SuggestionResult[] {
  const sorted = [...results];

  sorted.sort((a, b) => {
    // Primary sort
    const primaryCompare = compareResults(a, b, sortConfig.primary);
    if (primaryCompare !== 0) return primaryCompare;

    // Secondary sort
    if (sortConfig.secondary) {
      const secondaryCompare = compareResults(a, b, sortConfig.secondary);
      if (secondaryCompare !== 0) return secondaryCompare;
    }

    // Final tie-breaker: relevance score
    if (sortConfig.keepRelevance !== false) {
      return b.score - a.score;
    }

    return 0;
  });

  return sorted;
}

function compareResults(a: SuggestionResult, b: SuggestionResult, sort: SortOption): number {
  const aValue = a.fields?.[sort.field];
  const bValue = b.fields?.[sort.field];

  if (aValue === undefined && bValue === undefined) return 0;
  if (aValue === undefined) return 1;
  if (bValue === undefined) return -1;

  const type = sort.type || detectType(aValue);

  let comparison = 0;

  switch (type) {
    case "number":
      comparison = compareNumbers(aValue, bValue);
      break;
    case "date":
      comparison = compareDates(aValue, bValue);
      break;
    case "string":
    default:
      comparison = compareStrings(aValue, bValue);
  }

  return sort.order === "desc" ? -comparison : comparison;
}

function compareNumbers(a: any, b: any): number {
  const numA = Number(a);
  const numB = Number(b);

  if (isNaN(numA) && isNaN(numB)) return 0;
  if (isNaN(numA)) return 1;
  if (isNaN(numB)) return -1;

  return numA - numB;
}

function compareDates(a: any, b: any): number {
  const dateA = new Date(a);
  const dateB = new Date(b);

  const timeA = dateA.getTime();
  const timeB = dateB.getTime();

  if (isNaN(timeA) && isNaN(timeB)) return 0;
  if (isNaN(timeA)) return 1;
  if (isNaN(timeB)) return -1;

  return timeA - timeB;
}

function compareStrings(a: any, b: any): number {
  return String(a).localeCompare(String(b));
}

function detectType(value: any): "number" | "string" | "date" {
  if (typeof value === "number") return "number";
  
  if (typeof value === "string" && !isNaN(parseFloat(value)) && isFinite(Number(value))) {
    return "number";
  }
  
  if (value instanceof Date) return "date";
  
  if (typeof value === "string") {
    const date = new Date(value);
    if (!isNaN(date.getTime()) && /\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/.test(value)) {
      return "date";
    }
  }
  
  return "string";
}
