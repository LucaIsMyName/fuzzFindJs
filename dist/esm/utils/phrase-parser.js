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
  remaining = remaining.replace(/"[^"]*"/g, " ");
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
  remaining = remaining.replace(/'[^']*'/g, " ");
  const terms = remaining.split(/\s+/).map((t) => t.trim()).filter((t) => t.length > 0);
  return {
    phrases,
    terms,
    original: query,
    hasPhrases: phrases.length > 0
  };
}
function hasPhraseSyntax(query) {
  if (!query) return false;
  return /"[^"]*"/.test(query) || /'[^']*'/.test(query);
}
function normalizePhrase(phrase) {
  return phrase.toLowerCase().trim().replace(/\s+/g, " ");
}
function splitPhraseWords(phrase) {
  return phrase.toLowerCase().trim().split(/\s+/).filter((w) => w.length > 0);
}
export {
  hasPhraseSyntax,
  normalizePhrase,
  parseQuery,
  splitPhraseWords
};
//# sourceMappingURL=phrase-parser.js.map
