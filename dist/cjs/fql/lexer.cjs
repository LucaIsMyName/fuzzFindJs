"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const TokenType = {
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
  EOF: "EOF"
};
class FQLLexer {
  input = "";
  position = 0;
  tokens = [];
  /**
   * Tokenize an FQL query string
   */
  tokenize(input) {
    this.input = input.trim();
    this.position = 0;
    this.tokens = [];
    while (this.position < this.input.length) {
      this.skipWhitespace();
      if (this.position >= this.input.length) break;
      const char = this.input[this.position];
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
      if (char === ":") {
        this.tokens.push({ type: TokenType.COLON, value: ":", position: this.position });
        this.position++;
        continue;
      }
      if (char === '"' || char === "'") {
        this.tokenizeQuotedString(char);
        continue;
      }
      if (this.isDigit(char)) {
        this.tokenizeNumber();
        continue;
      }
      if (this.isAlpha(char)) {
        this.tokenizeKeywordOrTerm();
        continue;
      }
      if (char === ">" || char === "<") {
        this.tokenizeScoreOperator();
        continue;
      }
      this.position++;
    }
    this.tokens.push({ type: TokenType.EOF, value: "", position: this.position });
    return this.tokens;
  }
  skipWhitespace() {
    while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
      this.position++;
    }
  }
  isAlpha(char) {
    return /[a-zA-ZäöüßÄÖÜàâäæçéèêëïîôùûüÿœÀÂÄÆÇÉÈÊËÏÎÔÙÛÜŸŒáéíóúñüÁÉÍÓÚÑÜ_]/.test(char);
  }
  isDigit(char) {
    return /[0-9.]/.test(char);
  }
  isAlphaNumeric(char) {
    return this.isAlpha(char) || this.isDigit(char);
  }
  tokenizeQuotedString(quote) {
    const start = this.position;
    this.position++;
    let value = "";
    while (this.position < this.input.length && this.input[this.position] !== quote) {
      value += this.input[this.position];
      this.position++;
    }
    if (this.position >= this.input.length) {
      throw new Error(`Unclosed quote at position ${start}`);
    }
    this.position++;
    this.tokens.push({ type: TokenType.QUOTED, value, position: start });
  }
  tokenizeNumber() {
    const start = this.position;
    let value = "";
    while (this.position < this.input.length && this.isDigit(this.input[this.position])) {
      value += this.input[this.position];
      this.position++;
    }
    this.tokens.push({ type: TokenType.NUMBER, value, position: start });
  }
  tokenizeKeywordOrTerm() {
    const start = this.position;
    let value = "";
    while (this.position < this.input.length && this.isAlphaNumeric(this.input[this.position])) {
      value += this.input[this.position];
      this.position++;
    }
    const upperValue = value.toUpperCase();
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
        this.tokens.push({ type: TokenType.TERM, value, position: start });
        break;
    }
  }
  tokenizeScoreOperator() {
    const start = this.position;
    let value = this.input[this.position];
    this.position++;
    if (this.position < this.input.length && this.input[this.position] === "=") {
      value += "=";
      this.position++;
    }
    this.tokens.push({ type: TokenType.SCORE_OP, value, position: start });
  }
}
exports.FQLLexer = FQLLexer;
exports.TokenType = TokenType;
//# sourceMappingURL=lexer.cjs.map
