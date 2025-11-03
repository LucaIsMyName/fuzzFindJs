"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
function applySorting(results, sortConfig) {
  const sorted = [...results];
  sorted.sort((a, b) => {
    const primaryCompare = compareResults(a, b, sortConfig.primary);
    if (primaryCompare !== 0) return primaryCompare;
    if (sortConfig.secondary) {
      const secondaryCompare = compareResults(a, b, sortConfig.secondary);
      if (secondaryCompare !== 0) return secondaryCompare;
    }
    if (sortConfig.keepRelevance !== false) {
      return b.score - a.score;
    }
    return 0;
  });
  return sorted;
}
function compareResults(a, b, sort) {
  const aValue = a.fields?.[sort.field];
  const bValue = b.fields?.[sort.field];
  if (aValue === void 0 && bValue === void 0) return 0;
  if (aValue === void 0) return 1;
  if (bValue === void 0) return -1;
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
function compareNumbers(a, b) {
  const numA = Number(a);
  const numB = Number(b);
  if (isNaN(numA) && isNaN(numB)) return 0;
  if (isNaN(numA)) return 1;
  if (isNaN(numB)) return -1;
  return numA - numB;
}
function compareDates(a, b) {
  const dateA = new Date(a);
  const dateB = new Date(b);
  const timeA = dateA.getTime();
  const timeB = dateB.getTime();
  if (isNaN(timeA) && isNaN(timeB)) return 0;
  if (isNaN(timeA)) return 1;
  if (isNaN(timeB)) return -1;
  return timeA - timeB;
}
function compareStrings(a, b) {
  return String(a).localeCompare(String(b));
}
function detectType(value) {
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
exports.applySorting = applySorting;
//# sourceMappingURL=sorting.cjs.map
