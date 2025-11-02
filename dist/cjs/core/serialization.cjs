"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const cache = require("./cache.cjs");
function serializeIndex(index) {
  const serialized = {
    version: "1.0",
    base: index.base,
    variantToBase: Array.from(index.variantToBase.entries()).map(([k, v]) => [k, Array.from(v)]),
    phoneticToBase: Array.from(index.phoneticToBase.entries()).map(([k, v]) => [k, Array.from(v)]),
    ngramIndex: Array.from(index.ngramIndex.entries()).map(([k, v]) => [k, Array.from(v)]),
    synonymMap: Array.from(index.synonymMap.entries()).map(([k, v]) => [k, Array.from(v)]),
    config: index.config,
    languageProcessorNames: Array.from(index.languageProcessors.keys())
  };
  if (index.invertedIndex) {
    serialized.invertedIndex = {
      termToPostings: Array.from(index.invertedIndex.termToPostings.entries()),
      phoneticToPostings: Array.from(index.invertedIndex.phoneticToPostings.entries()),
      ngramToPostings: Array.from(index.invertedIndex.ngramToPostings.entries()),
      synonymToPostings: Array.from(index.invertedIndex.synonymToPostings.entries()),
      totalDocs: index.invertedIndex.totalDocs,
      avgDocLength: index.invertedIndex.avgDocLength
    };
  }
  if (index.documents) {
    serialized.documents = index.documents;
  }
  return JSON.stringify(serialized);
}
async function deserializeIndex(json) {
  const data = JSON.parse(json);
  const variantToBase = new Map(data.variantToBase.map(([k, v]) => [k, new Set(v)]));
  const phoneticToBase = new Map(data.phoneticToBase.map(([k, v]) => [k, new Set(v)]));
  const ngramIndex = new Map(data.ngramIndex.map(([k, v]) => [k, new Set(v)]));
  const synonymMap = new Map(data.synonymMap.map(([k, v]) => [k, new Set(v)]));
  const { LanguageRegistry } = await Promise.resolve().then(() => require("../languages/index.cjs"));
  const languageProcessors = /* @__PURE__ */ new Map();
  for (const langName of data.languageProcessorNames) {
    const processor = LanguageRegistry.getProcessor(langName);
    if (processor) {
      languageProcessors.set(langName, processor);
    }
  }
  const index = {
    base: data.base,
    variantToBase,
    phoneticToBase,
    ngramIndex,
    synonymMap,
    languageProcessors,
    config: data.config
  };
  if (data.invertedIndex) {
    index.invertedIndex = {
      termToPostings: new Map(data.invertedIndex.termToPostings),
      phoneticToPostings: new Map(data.invertedIndex.phoneticToPostings),
      ngramToPostings: new Map(data.invertedIndex.ngramToPostings),
      synonymToPostings: new Map(data.invertedIndex.synonymToPostings),
      totalDocs: data.invertedIndex.totalDocs,
      avgDocLength: data.invertedIndex.avgDocLength
    };
  }
  if (data.documents) {
    index.documents = data.documents;
  }
  if (data.config.enableCache !== false) {
    const cacheSize = data.config.cacheSize || 100;
    index._cache = new cache.SearchCache(cacheSize);
  }
  return index;
}
function saveIndexToLocalStorage(index, key = "fuzzy-search-index") {
  if (typeof localStorage === "undefined") {
    throw new Error("localStorage is not available");
  }
  const serialized = serializeIndex(index);
  localStorage.setItem(key, serialized);
}
async function loadIndexFromLocalStorage(key = "fuzzy-search-index") {
  if (typeof localStorage === "undefined") {
    throw new Error("localStorage is not available");
  }
  const serialized = localStorage.getItem(key);
  if (!serialized) {
    return null;
  }
  return await deserializeIndex(serialized);
}
function getSerializedSize(index) {
  const serialized = serializeIndex(index);
  return new Blob([serialized]).size;
}
exports.deserializeIndex = deserializeIndex;
exports.getSerializedSize = getSerializedSize;
exports.loadIndexFromLocalStorage = loadIndexFromLocalStorage;
exports.saveIndexToLocalStorage = saveIndexToLocalStorage;
exports.serializeIndex = serializeIndex;
//# sourceMappingURL=serialization.cjs.map
