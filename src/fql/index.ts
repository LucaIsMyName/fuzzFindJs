/**
 * FQL (Fuzzy Query Language) - Main entry point
 */

import type { FuzzyIndex, SuggestionResult, SearchOptions } from "../core/types.js";
import { FQLLexer } from "./lexer.js";
import { FQLParser, FQLSyntaxError } from "./parser.js";
import { FQLExecutor, FQLTimeoutError } from "./executor.js";

/**
 * Check if a query is an FQL query
 */
export function isFQLQuery(query: string): boolean {
  const trimmed = query.trim();
  return trimmed.startsWith("fql(") && trimmed.endsWith(")");
}

/**
 * Extract FQL query from fql(...) wrapper
 */
export function extractFQLQuery(query: string): string {
  const trimmed = query.trim();
  if (!isFQLQuery(trimmed)) {
    throw new Error("Not a valid FQL query. Must be wrapped in fql(...)");
  }
  
  // Remove fql( and )
  return trimmed.slice(4, -1).trim();
}

/**
 * Execute an FQL query
 */
export function executeFQLQuery(
  index: FuzzyIndex,
  query: string,
  maxResults?: number,
  options: SearchOptions = {}
): SuggestionResult[] {
  try {
    // Extract query from fql(...)
    const fqlQuery = extractFQLQuery(query);
    
    // Lexer: tokenize
    const lexer = new FQLLexer();
    const tokens = lexer.tokenize(fqlQuery);
    
    // Parser: build AST
    const parser = new FQLParser();
    const ast = parser.parse(tokens);
    
    // Executor: run query
    const executor = new FQLExecutor(index, options);
    const results = executor.execute(ast);
    
    // Apply maxResults limit
    const limit = maxResults || options.maxResults || 10;
    return results.slice(0, limit);
  } catch (error) {
    // Re-throw FQL-specific errors
    if (error instanceof FQLSyntaxError || error instanceof FQLTimeoutError) {
      throw error;
    }
    
    // Wrap other errors
    throw new Error(`FQL execution error: ${(error as Error).message}`);
  }
}

// Export all FQL components
export { FQLLexer } from "./lexer.js";
export { FQLParser, FQLSyntaxError } from "./parser.js";
export { FQLExecutor, FQLTimeoutError } from "./executor.js";
export type { FQLNode } from "./ast.js";
export { TokenType } from "./lexer.js";
