import { isAndNode, isOrNode, isNotNode, isTermNode, isPhraseNode, isFilterNode, isFieldNode, isScoreNode, isLangNode } from "./ast.js";
import { getSuggestions } from "../core/index.js";
class FQLTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = "FQLTimeoutError";
  }
}
class FQLExecutor {
  index;
  options;
  startTime = 0;
  timeout = 5e3;
  // Default 5 seconds
  constructor(index, options = {}) {
    this.index = index;
    this.options = options;
    this.timeout = options.fqlOptions?.timeout || 5e3;
  }
  /**
   * Execute an FQL AST and return results
   */
  execute(ast) {
    this.startTime = Date.now();
    return this.executeNode(ast);
  }
  checkTimeout() {
    if (Date.now() - this.startTime > this.timeout) {
      throw new FQLTimeoutError(`Query execution timeout after ${this.timeout}ms`);
    }
  }
  executeNode(node) {
    this.checkTimeout();
    if (isAndNode(node)) {
      return this.executeAnd(node);
    }
    if (isOrNode(node)) {
      return this.executeOr(node);
    }
    if (isNotNode(node)) {
      return this.executeNot(node);
    }
    if (isTermNode(node)) {
      return this.executeTerm(node.value);
    }
    if (isPhraseNode(node)) {
      return this.executePhrase(node.value);
    }
    if (isFilterNode(node)) {
      return this.executeFilter(node);
    }
    if (isFieldNode(node)) {
      return this.executeField(node);
    }
    if (isScoreNode(node)) {
      return this.executeScore(node);
    }
    if (isLangNode(node)) {
      return this.executeLang(node);
    }
    return [];
  }
  /**
   * Execute AND - intersection of results
   */
  executeAnd(node) {
    const leftResults = this.executeNode(node.left);
    const rightResults = this.executeNode(node.right);
    const rightDisplays = new Set(rightResults.map((r) => r.display));
    const intersection = leftResults.filter((r) => rightDisplays.has(r.display));
    return intersection.sort((a, b) => b.score - a.score);
  }
  /**
   * Execute OR - union of results
   */
  executeOr(node) {
    const leftResults = this.executeNode(node.left);
    const rightResults = this.executeNode(node.right);
    const resultMap = /* @__PURE__ */ new Map();
    for (const result of leftResults) {
      resultMap.set(result.display, result);
    }
    for (const result of rightResults) {
      const existing = resultMap.get(result.display);
      if (!existing || result.score > existing.score) {
        resultMap.set(result.display, result);
      }
    }
    return Array.from(resultMap.values()).sort((a, b) => b.score - a.score);
  }
  /**
   * Execute NOT - exclusion of results
   */
  executeNot(node) {
    const childResults = this.executeNode(node.child);
    const excludeDisplays = new Set(childResults.map((r) => r.display));
    const allResults = getSuggestions(this.index, "", this.index.base.length, this.options);
    return allResults.filter((r) => !excludeDisplays.has(r.display)).sort((a, b) => b.score - a.score);
  }
  /**
   * Execute simple term search
   */
  executeTerm(term) {
    return getSuggestions(this.index, term, this.index.base.length, this.options);
  }
  /**
   * Execute phrase search
   */
  executePhrase(phrase) {
    return getSuggestions(this.index, `"${phrase}"`, this.index.base.length, this.options);
  }
  /**
   * Execute filter (EXACT, FUZZY, PHONETIC, etc.)
   */
  executeFilter(node) {
    const { filterType, value } = node;
    const results = getSuggestions(this.index, value, this.index.base.length, this.options);
    switch (filterType) {
      case "exact":
        return results.filter((r) => r._debug_matchType === "exact");
      case "fuzzy":
        return results.filter((r) => r._debug_matchType === "fuzzy");
      case "phonetic":
        return results.filter((r) => r._debug_matchType === "phonetic");
      case "prefix":
        return results.filter((r) => r._debug_matchType === "prefix");
      case "compound":
        return results.filter((r) => r._debug_matchType === "compound");
      case "regex":
        return this.executeRegex(value);
      default:
        return results;
    }
  }
  /**
   * Execute regex pattern
   */
  executeRegex(pattern) {
    if (!this.options.fqlOptions?.allowRegex) {
      throw new Error("Regex not enabled. Set fqlOptions.allowRegex = true");
    }
    try {
      const regex = new RegExp(pattern);
      const results = [];
      for (const word of this.index.base) {
        if (regex.test(word)) {
          results.push({
            display: word,
            baseWord: word,
            score: 1,
            isSynonym: false,
            language: "unknown",
            _debug_matchType: "regex"
          });
        }
      }
      return results;
    } catch (error) {
      throw new Error(`Invalid regex pattern: ${pattern}`);
    }
  }
  /**
   * Execute field selector
   */
  executeField(node) {
    const childResults = this.executeNode(node.child);
    if (!this.index.fieldData) {
      return childResults;
    }
    return childResults.filter((result) => {
      if (result.field === node.field) {
        return true;
      }
      return false;
    });
  }
  /**
   * Execute score filter
   */
  executeScore(node) {
    const childResults = this.executeNode(node.child);
    const { operator, threshold } = node;
    return childResults.filter((result) => {
      switch (operator) {
        case ">":
          return result.score > threshold;
        case "<":
          return result.score < threshold;
        case ">=":
          return result.score >= threshold;
        case "<=":
          return result.score <= threshold;
        default:
          return true;
      }
    });
  }
  /**
   * Execute language filter
   */
  executeLang(node) {
    const childResults = this.executeNode(node.child);
    const targetLang = node.language.toLowerCase();
    return childResults.filter((result) => {
      return result.language?.toLowerCase() === targetLang;
    });
  }
}
export {
  FQLExecutor,
  FQLTimeoutError
};
//# sourceMappingURL=executor.js.map
