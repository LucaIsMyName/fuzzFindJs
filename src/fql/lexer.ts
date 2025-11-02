/**
 * FQL Lexer (Tokenizer)
 * Converts FQL query strings into tokens for parsing
 */

export const TokenType = {
  TERM: "TERM",
  QUOTED: "QUOTED",
  AND: "AND",
  OR: "OR",
  NOT: "NOT",
  LPAREN: "LPAREN",
  RPAREN: "RPAREN",
  COLON: "COLON",
  EXACT: "EXACT",
  FUZZY: "FUZZY",
  PHONETIC: "PHONETIC",
  PREFIX: "PREFIX",
  REGEX: "REGEX",
  COMPOUND: "COMPOUND",
  LANG: "LANG",
  SCORE: "SCORE",
  SCORE_OP: "SCORE_OP",
  NUMBER: "NUMBER",
  EOF: "EOF",
} as const;

export type TokenType = (typeof TokenType)[keyof typeof TokenType];

export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

export class FQLLexer {
  private input: string = "";
  private position: number = 0;
  private tokens: Token[] = [];

  /**
   * Tokenize an FQL query string
   */
  tokenize(input: string): Token[] {
    this.input = input.trim();
    this.position = 0;
    this.tokens = [];

    while (this.position < this.input.length) {
      this.skipWhitespace();

      if (this.position >= this.input.length) break;

      const char = this.input[this.position];

      // Parentheses
      if (char === "(") {
        this.tokens.push({ type: TokenType.LPAREN, value: "(", position: this.position });
        this.position++;
        continue;
      }

      if (char === ")") {
        this.tokens.push({ type: TokenType.RPAREN, value: ")", position: this.position });
        this.position++;
        continue;
      }

      // Colon
      if (char === ":") {
        this.tokens.push({ type: TokenType.COLON, value: ":", position: this.position });
        this.position++;
        continue;
      }

      // Quoted strings
      if (char === '"' || char === "'") {
        this.tokenizeQuotedString(char);
        continue;
      }

      // Numbers (for score thresholds)
      if (this.isDigit(char)) {
        this.tokenizeNumber();
        continue;
      }

      // Keywords and terms
      if (this.isAlpha(char)) {
        this.tokenizeKeywordOrTerm();
        continue;
      }

      // Score operators (>, <, >=, <=)
      if (char === ">" || char === "<") {
        this.tokenizeScoreOperator();
        continue;
      }

      // Unknown character - skip it
      this.position++;
    }

    // Add EOF token
    this.tokens.push({ type: TokenType.EOF, value: "", position: this.position });

    return this.tokens;
  }

  private skipWhitespace(): void {
    while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
      this.position++;
    }
  }

  private isAlpha(char: string): boolean {
    return /[a-zA-ZäöüßÄÖÜàâäæçéèêëïîôùûüÿœÀÂÄÆÇÉÈÊËÏÎÔÙÛÜŸŒáéíóúñüÁÉÍÓÚÑÜ_]/.test(char);
  }

  private isDigit(char: string): boolean {
    return /[0-9.]/.test(char);
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  private tokenizeQuotedString(quote: string): void {
    const start = this.position;
    this.position++; // Skip opening quote

    let value = "";
    while (this.position < this.input.length && this.input[this.position] !== quote) {
      value += this.input[this.position];
      this.position++;
    }

    if (this.position >= this.input.length) {
      throw new Error(`Unclosed quote at position ${start}`);
    }

    this.position++; // Skip closing quote

    this.tokens.push({ type: TokenType.QUOTED, value, position: start });
  }

  private tokenizeNumber(): void {
    const start = this.position;
    let value = "";

    while (this.position < this.input.length && this.isDigit(this.input[this.position])) {
      value += this.input[this.position];
      this.position++;
    }

    this.tokens.push({ type: TokenType.NUMBER, value, position: start });
  }

  private tokenizeKeywordOrTerm(): void {
    const start = this.position;
    let value = "";

    while (this.position < this.input.length && this.isAlphaNumeric(this.input[this.position])) {
      value += this.input[this.position];
      this.position++;
    }

    const upperValue = value.toUpperCase();

    // Check for keywords
    switch (upperValue) {
      case "AND":
        this.tokens.push({ type: TokenType.AND, value: upperValue, position: start });
        break;
      case "OR":
        this.tokens.push({ type: TokenType.OR, value: upperValue, position: start });
        break;
      case "NOT":
        this.tokens.push({ type: TokenType.NOT, value: upperValue, position: start });
        break;
      case "EXACT":
        this.tokens.push({ type: TokenType.EXACT, value: upperValue, position: start });
        break;
      case "FUZZY":
        this.tokens.push({ type: TokenType.FUZZY, value: upperValue, position: start });
        break;
      case "PHONETIC":
        this.tokens.push({ type: TokenType.PHONETIC, value: upperValue, position: start });
        break;
      case "PREFIX":
        this.tokens.push({ type: TokenType.PREFIX, value: upperValue, position: start });
        break;
      case "REGEX":
        this.tokens.push({ type: TokenType.REGEX, value: upperValue, position: start });
        break;
      case "COMPOUND":
        this.tokens.push({ type: TokenType.COMPOUND, value: upperValue, position: start });
        break;
      case "LANG":
        this.tokens.push({ type: TokenType.LANG, value: upperValue, position: start });
        break;
      case "SCORE":
        this.tokens.push({ type: TokenType.SCORE, value: upperValue, position: start });
        break;
      default:
        // Regular term (preserve original case)
        this.tokens.push({ type: TokenType.TERM, value, position: start });
        break;
    }
  }

  private tokenizeScoreOperator(): void {
    const start = this.position;
    let value = this.input[this.position];
    this.position++;

    // Check for >= or <=
    if (this.position < this.input.length && this.input[this.position] === "=") {
      value += "=";
      this.position++;
    }

    this.tokens.push({ type: TokenType.SCORE_OP, value, position: start });
  }
}
