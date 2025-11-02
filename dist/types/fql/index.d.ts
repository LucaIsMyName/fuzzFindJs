/**
 * FQL (Fuzzy Query Language) - Main entry point
 */
import type { FuzzyIndex, SuggestionResult, SearchOptions } from "../core/types.js";
/**
 * Check if a query is an FQL query
 */
export declare function isFQLQuery(query: string): boolean;
/**
 * Extract FQL query from fql(...) wrapper
 */
export declare function extractFQLQuery(query: string): string;
/**
 * Execute an FQL query
 */
export declare function executeFQLQuery(index: FuzzyIndex, query: string, maxResults?: number, options?: SearchOptions): SuggestionResult[];
export { FQLLexer } from "./lexer.js";
export { FQLParser, FQLSyntaxError } from "./parser.js";
export { FQLExecutor, FQLTimeoutError } from "./executor.js";
export type { FQLNode } from "./ast.js";
export { TokenType } from "./lexer.js";
//# sourceMappingURL=index.d.ts.map