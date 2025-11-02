/**
 * FQL Parser
 * Converts tokens into an Abstract Syntax Tree (AST)
 */
import type { Token } from "./lexer.js";
import type { FQLNode } from "./ast.js";
export declare class FQLSyntaxError extends Error {
    position: number;
    constructor(message: string, position: number);
}
export declare class FQLParser {
    private tokens;
    private current;
    /**
     * Parse tokens into an AST
     */
    parse(tokens: Token[]): FQLNode;
    /**
     * expression → or_expr
     */
    private parseExpression;
    /**
     * or_expr → and_expr ( OR and_expr )*
     */
    private parseOrExpression;
    /**
     * and_expr → not_expr ( AND not_expr )*
     */
    private parseAndExpression;
    /**
     * not_expr → NOT? primary
     */
    private parseNotExpression;
    /**
     * primary → filter | field | lang | score | term | phrase | grouped
     */
    private parsePrimary;
    /**
     * filter → (EXACT|FUZZY|PHONETIC|PREFIX|REGEX|COMPOUND) COLON value
     */
    private parseFilter;
    /**
     * lang → LANG COLON TERM expression
     */
    private parseLang;
    /**
     * score → expression SCORE (>|<|>=|<=) NUMBER
     */
    private parseScore;
    private match;
    private check;
    private advance;
    private isAtEnd;
    private peek;
    private previous;
}
//# sourceMappingURL=parser.d.ts.map