/**
 * FQL Lexer (Tokenizer)
 * Converts FQL query strings into tokens for parsing
 */
export declare const TokenType: {
    readonly TERM: "TERM";
    readonly QUOTED: "QUOTED";
    readonly AND: "AND";
    readonly OR: "OR";
    readonly NOT: "NOT";
    readonly LPAREN: "LPAREN";
    readonly RPAREN: "RPAREN";
    readonly COLON: "COLON";
    readonly EXACT: "EXACT";
    readonly FUZZY: "FUZZY";
    readonly PHONETIC: "PHONETIC";
    readonly PREFIX: "PREFIX";
    readonly REGEX: "REGEX";
    readonly COMPOUND: "COMPOUND";
    readonly LANG: "LANG";
    readonly SCORE: "SCORE";
    readonly SCORE_OP: "SCORE_OP";
    readonly NUMBER: "NUMBER";
    readonly EOF: "EOF";
};
export type TokenType = (typeof TokenType)[keyof typeof TokenType];
export interface Token {
    type: TokenType;
    value: string;
    position: number;
}
export declare class FQLLexer {
    private input;
    private position;
    private tokens;
    /**
     * Tokenize an FQL query string
     */
    tokenize(input: string): Token[];
    private skipWhitespace;
    private isAlpha;
    private isDigit;
    private isAlphaNumeric;
    private tokenizeQuotedString;
    private tokenizeNumber;
    private tokenizeKeywordOrTerm;
    private tokenizeScoreOperator;
}
//# sourceMappingURL=lexer.d.ts.map