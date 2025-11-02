"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
function parseQuery(query) {
  if (!query || typeof query !== "string") {
    return {
      phrases: [],
      terms: [],
      original: query || "",
      hasPhrases: false
    };
  }
  const phrases = [];
  let remaining = query;
  const doubleQuoteRegex = /"([^"]+)"/g;
  let match;
  while ((match = doubleQuoteRegex.exec(query)) !== null) {
    const phrase = match[1].trim();
    if (phrase) {
      const wordCount = phrase.split(/\s+/).length;
      if (wordCount <= 10) {
        phrases.push(phrase);
      }
    }
  }
  remaining = remaining.replace(doubleQuoteRegex, " ");
  const singleQuoteRegex = /'([^']+)'/g;
  while ((match = singleQuoteRegex.exec(query)) !== null) {
    const phrase = match[1].trim();
    if (phrase) {
      const wordCount = phrase.split(/\s+/).length;
      if (wordCount <= 10) {
        phrases.push(phrase);
      }
    }
  }
  remaining = remaining.replace(singleQuoteRegex, " ");
  const terms = remaining.split(/\s+/).map((t) => t.trim()).filter((t) => t.length > 0);
  return {
    phrases,
    terms,
    original: query,
    hasPhrases: phrases.length > 0
  };
}
exports.parseQuery = parseQuery;
//# sourceMappingURL=phrase-parser.cjs.map
