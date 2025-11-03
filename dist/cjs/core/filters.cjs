"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
function applyFilters(results, filters) {
  let filtered = results;
  if (filters.ranges && filters.ranges.length > 0) {
    filtered = filtered.filter((result) => {
      if (!result.fields) return true;
      return filters.ranges.every((range) => {
        const value = result.fields[range.field];
        if (value === void 0) return true;
        const numValue = Number(value);
        if (isNaN(numValue)) return true;
        if (range.min !== void 0 && numValue < range.min) return false;
        if (range.max !== void 0 && numValue > range.max) return false;
        return true;
      });
    });
  }
  if (filters.terms && filters.terms.length > 0) {
    filtered = filtered.filter((result) => {
      if (!result.fields) return true;
      return filters.terms.every((term) => {
        const value = result.fields[term.field];
        if (value === void 0) return true;
        const operator = term.operator || "OR";
        if (operator === "OR") {
          return term.values.some((filterValue) => matchValue(value, filterValue));
        } else {
          if (Array.isArray(value)) {
            return term.values.every(
              (filterValue) => value.some((v) => matchValue(v, filterValue))
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
      return filters.booleans.every((boolFilter) => {
        const value = result.fields[boolFilter.field];
        if (value === void 0) return true;
        const boolValue = typeof value === "boolean" ? value : String(value) === "true" || Number(value) === 1;
        return boolValue === boolFilter.value;
      });
    });
  }
  return filtered;
}
function matchValue(value, filterValue) {
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
exports.applyFilters = applyFilters;
//# sourceMappingURL=filters.cjs.map
