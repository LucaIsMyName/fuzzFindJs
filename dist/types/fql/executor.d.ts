/**
 * FQL Executor
 * Executes FQL AST against a fuzzy index
 */
import type { FuzzyIndex, SuggestionResult, SearchOptions } from "../core/types.js";
import type { FQLNode } from "./ast.js";
export declare class FQLTimeoutError extends Error {
    constructor(message: string);
}
export declare class FQLExecutor {
    private index;
    private options;
    private startTime;
    private timeout;
    constructor(index: FuzzyIndex, options?: SearchOptions);
    /**
     * Execute an FQL AST and return results
     */
    execute(ast: FQLNode): SuggestionResult[];
    private checkTimeout;
    private executeNode;
    /**
     * Execute AND - intersection of results
     */
    private executeAnd;
    /**
     * Execute OR - union of results
     */
    private executeOr;
    /**
     * Execute NOT - exclusion of results
     */
    private executeNot;
    /**
     * Execute simple term search
     */
    private executeTerm;
    /**
     * Execute phrase search
     */
    private executePhrase;
    /**
     * Execute filter (EXACT, FUZZY, PHONETIC, etc.)
     */
    private executeFilter;
    /**
     * Execute regex pattern
     */
    private executeRegex;
    /**
     * Execute field selector
     */
    private executeField;
    /**
     * Execute score filter
     */
    private executeScore;
    /**
     * Execute language filter
     */
    private executeLang;
}
//# sourceMappingURL=executor.d.ts.map