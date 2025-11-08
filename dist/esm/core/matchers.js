import { generateNgrams, calculateDamerauLevenshteinDistance, calculateLevenshteinDistance } from "../algorithms/levenshtein.js";
function findExactMatches(query, index, matches, language) {
  const wordBoundaries = index.config.wordBoundaries || false;
  if (query.includes("*")) {
    for (const baseWord of index.base) {
      if (matchesWildcard(baseWord, query)) {
        if (!matches.has(baseWord)) {
          matches.set(baseWord, {
            word: baseWord,
            normalized: query,
            matchType: "exact",
            editDistance: 0,
            language
          });
        }
      }
    }
    return;
  }
  const exactMatches = index.variantToBase.get(query.toLowerCase());
  if (exactMatches) {
    exactMatches.forEach((word) => {
      if (wordBoundaries && !matchesWord(word, query, wordBoundaries)) {
        return;
      }
      const existing = matches.get(word);
      if (!existing || existing.matchType !== "exact") {
        matches.set(word, {
          word,
          normalized: query,
          matchType: "exact",
          editDistance: 0,
          language
        });
      }
    });
  }
  const queryLower = query.toLowerCase();
  for (const baseWord of index.base) {
    if (baseWord.toLowerCase() === queryLower) {
      if (!matches.has(baseWord)) {
        matches.set(baseWord, {
          word: baseWord,
          normalized: query,
          matchType: "exact",
          editDistance: 0,
          language
        });
      }
    }
  }
}
function findPrefixMatches(query, index, matches, language) {
  const wordBoundaries = index.config.wordBoundaries || false;
  const queryLower = query.toLowerCase();
  for (const [variant, words] of index.variantToBase.entries()) {
    if (variant.startsWith(queryLower) && variant !== queryLower) {
      words.forEach((word) => {
        if (wordBoundaries && !matchesWord(word, query, wordBoundaries)) {
          return;
        }
        if (!matches.has(word)) {
          matches.set(word, {
            word,
            normalized: variant,
            matchType: "prefix",
            language
          });
        }
      });
    }
  }
}
function findSubstringMatches(query, index, matches, language) {
  const queryLower = query.toLowerCase();
  if (queryLower.length < 2) return;
  for (const [variant, words] of index.variantToBase.entries()) {
    if (variant.includes(queryLower) && !variant.startsWith(queryLower) && variant !== queryLower) {
      words.forEach((word) => {
        const existingMatch = matches.get(word);
        if (!existingMatch || existingMatch.matchType !== "exact" && existingMatch.matchType !== "prefix") {
          matches.set(word, {
            word,
            normalized: variant,
            matchType: "substring",
            language
          });
        }
      });
    }
  }
}
function findPhoneticMatches(query, processor, index, matches) {
  if (!processor.supportedFeatures.includes("phonetic")) return;
  const phoneticCode = processor.getPhoneticCode(query);
  if (phoneticCode) {
    const phoneticMatches = index.phoneticToBase.get(phoneticCode);
    if (phoneticMatches) {
      phoneticMatches.forEach((word) => {
        if (!matches.has(word)) {
          matches.set(word, {
            word,
            normalized: query,
            matchType: "phonetic",
            phoneticCode,
            language: processor.language
          });
        }
      });
    }
  }
}
function findSynonymMatches(query, index, matches) {
  const synonymMatches = index.synonymMap.get(query.toLowerCase());
  if (synonymMatches) {
    synonymMatches.forEach((word) => {
      if (!matches.has(word)) {
        matches.set(word, {
          word,
          normalized: query,
          matchType: "synonym",
          language: "synonym"
        });
      }
    });
  }
}
function findNgramMatches(query, index, matches, language, ngramSize) {
  if (query.length < ngramSize) return;
  const queryNgrams = generateNgrams(query, ngramSize);
  const candidateWords = /* @__PURE__ */ new Set();
  queryNgrams.forEach((ngram) => {
    const ngramMatches = index.ngramIndex.get(ngram);
    if (ngramMatches) {
      ngramMatches.forEach((word) => candidateWords.add(word));
    }
  });
  candidateWords.forEach((word) => {
    if (!matches.has(word)) {
      matches.set(word, {
        word,
        normalized: query,
        matchType: "ngram",
        language
      });
    }
  });
}
function findFuzzyMatches(query, index, matches, processor, config) {
  let maxDistance = config.maxEditDistance;
  if (query.length <= 3) {
    maxDistance = Math.max(maxDistance, 2);
  } else if (query.length <= 4) {
    maxDistance = Math.max(maxDistance, 2);
  } else if (query.length >= 10) {
    maxDistance = Math.max(maxDistance, 3);
  }
  for (const [variant, words] of index.variantToBase.entries()) {
    const lengthDiff = Math.abs(variant.length - query.length);
    let maxLengthDiff;
    if (query.length <= 4) {
      maxLengthDiff = query.length <= 3 ? 5 : 4;
    } else if (query.length <= 9) {
      maxLengthDiff = maxDistance + 1;
    } else {
      maxLengthDiff = maxDistance + 2;
    }
    if (lengthDiff <= maxLengthDiff) {
      const useTranspositions = index.config.features?.includes("transpositions");
      const distance = useTranspositions ? calculateDamerauLevenshteinDistance(query, variant, maxDistance) : calculateLevenshteinDistance(query, variant, maxDistance);
      const distanceThreshold = query.length <= 3 ? 2 : maxDistance;
      if (distance <= distanceThreshold) {
        words.forEach((word) => {
          const existingMatch = matches.get(word);
          if (!existingMatch || existingMatch.matchType !== "exact" && existingMatch.matchType !== "prefix" && (existingMatch.editDistance || Infinity) > distance) {
            matches.set(word, {
              word,
              normalized: variant,
              matchType: "fuzzy",
              editDistance: distance,
              language: processor.language
            });
          }
        });
      }
    }
  }
}
function matchesWord(word, query, wordBoundaries) {
  if (!wordBoundaries) return true;
  const wordLower = word.toLowerCase();
  const queryLower = query.toLowerCase();
  const regex = new RegExp(`\\b${escapeRegex(queryLower)}`, "i");
  return regex.test(wordLower);
}
function matchesWildcard(word, pattern) {
  const regexPattern = pattern.split("*").map(escapeRegex).join(".*");
  const regex = new RegExp(`^${regexPattern}$`, "i");
  return regex.test(word);
}
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
export {
  findExactMatches,
  findFuzzyMatches,
  findNgramMatches,
  findPhoneticMatches,
  findPrefixMatches,
  findSubstringMatches,
  findSynonymMatches
};
//# sourceMappingURL=matchers.js.map
