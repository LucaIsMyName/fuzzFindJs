/**
 * FQL Executor
 * Executes FQL AST against a fuzzy index
 */

import type { FuzzyIndex, SuggestionResult, SearchOptions } from "../core/types.js";
import type { FQLNode } from "./ast.js";
import { isAndNode, isOrNode, isNotNode, isTermNode, isPhraseNode, isFilterNode, isFieldNode, isScoreNode, isLangNode } from "./ast.js";
import { getSuggestions } from "../core/index.js";

export class FQLTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FQLTimeoutError";
  }
}

export class FQLExecutor {
  private index: FuzzyIndex;
  private options: SearchOptions;
  private startTime: number = 0;
  private timeout: number = 5000; // Default 5 seconds

  constructor(index: FuzzyIndex, options: SearchOptions = {}) {
    this.index = index;
    this.options = options;
    this.timeout = options.fqlOptions?.timeout || 5000;
  }

  /**
   * Execute an FQL AST and return results
   */
  execute(ast: FQLNode): SuggestionResult[] {
    this.startTime = Date.now();
    return this.executeNode(ast);
  }

  private checkTimeout(): void {
    if (Date.now() - this.startTime > this.timeout) {
      throw new FQLTimeoutError(`Query execution timeout after ${this.timeout}ms`);
    }
  }

  private executeNode(node: FQLNode): SuggestionResult[] {
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
  private executeAnd(node: { left: FQLNode; right: FQLNode }): SuggestionResult[] {
    const leftResults = this.executeNode(node.left);
    const rightResults = this.executeNode(node.right);

    // Intersection: items that appear in both
    const rightDisplays = new Set(rightResults.map((r) => r.display));
    const intersection = leftResults.filter((r) => rightDisplays.has(r.display));

    // Sort by score
    return intersection.sort((a, b) => b.score - a.score);
  }

  /**
   * Execute OR - union of results
   */
  private executeOr(node: { left: FQLNode; right: FQLNode }): SuggestionResult[] {
    const leftResults = this.executeNode(node.left);
    const rightResults = this.executeNode(node.right);

    // Union: combine and deduplicate
    const resultMap = new Map<string, SuggestionResult>();

    for (const result of leftResults) {
      resultMap.set(result.display, result);
    }

    for (const result of rightResults) {
      const existing = resultMap.get(result.display);
      // Keep higher score
      if (!existing || result.score > existing.score) {
        resultMap.set(result.display, result);
      }
    }

    // Sort by score
    return Array.from(resultMap.values()).sort((a, b) => b.score - a.score);
  }

  /**
   * Execute NOT - exclusion of results
   */
  private executeNot(node: { child: FQLNode }): SuggestionResult[] {
    const childResults = this.executeNode(node.child);
    const excludeDisplays = new Set(childResults.map((r) => r.display));

    // Get all results and exclude
    const allResults = getSuggestions(this.index, "", this.index.base.length, this.options);
    return allResults.filter((r) => !excludeDisplays.has(r.display)).sort((a, b) => b.score - a.score);
  }

  /**
   * Execute simple term search
   */
  private executeTerm(term: string): SuggestionResult[] {
    return getSuggestions(this.index, term, this.index.base.length, this.options);
  }

  /**
   * Execute phrase search
   */
  private executePhrase(phrase: string): SuggestionResult[] {
    // Use existing phrase search with quotes
    return getSuggestions(this.index, `"${phrase}"`, this.index.base.length, this.options);
  }

  /**
   * Execute filter (EXACT, FUZZY, PHONETIC, etc.)
   */
  private executeFilter(node: { filterType: string; value: string }): SuggestionResult[] {
    const { filterType, value } = node;

    // Get all results for the value
    const results = getSuggestions(this.index, value, this.index.base.length, this.options);

    // Filter by match type
    switch (filterType) {
      case "exact":
        return results.filter((r) => (r as any)._debug_matchType === "exact");

      case "fuzzy":
        return results.filter((r) => (r as any)._debug_matchType === "fuzzy");

      case "phonetic":
        return results.filter((r) => (r as any)._debug_matchType === "phonetic");

      case "prefix":
        return results.filter((r) => (r as any)._debug_matchType === "prefix");

      case "compound":
        return results.filter((r) => (r as any)._debug_matchType === "compound");

      case "regex":
        return this.executeRegex(value);

      default:
        return results;
    }
  }

  /**
   * Execute regex pattern
   */
  private executeRegex(pattern: string): SuggestionResult[] {
    // Check if regex is allowed
    if (!this.options.fqlOptions?.allowRegex) {
      throw new Error("Regex not enabled. Set fqlOptions.allowRegex = true");
    }

    try {
      const regex = new RegExp(pattern);
      const results: SuggestionResult[] = [];

      for (const word of this.index.base) {
        if (regex.test(word)) {
          results.push({
            display: word,
            baseWord: word,
            score: 1.0,
            isSynonym: false,
            language: "unknown",
            _debug_matchType: "regex",
          } as any);
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
  private executeField(node: { field: string; child: FQLNode }): SuggestionResult[] {
    // Execute child query
    const childResults = this.executeNode(node.child);

    // Filter by field if multi-field index
    if (!this.index.fieldData) {
      // No field data, return all results
      return childResults;
    }

    // Filter results that match the field
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
  private executeScore(node: { operator: string; threshold: number; child: FQLNode }): SuggestionResult[] {
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
  private executeLang(node: { language: string; child: FQLNode }): SuggestionResult[] {
    const childResults = this.executeNode(node.child);
    const targetLang = node.language.toLowerCase();

    return childResults.filter((result) => {
      return result.language?.toLowerCase() === targetLang;
    });
  }
}
