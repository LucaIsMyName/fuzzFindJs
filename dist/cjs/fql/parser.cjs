"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const lexer = require("./lexer.cjs");
class FQLSyntaxError extends Error {
  position;
  constructor(message, position) {
    super(message);
    this.name = "FQLSyntaxError";
    this.position = position;
  }
}
class FQLParser {
  tokens = [];
  current = 0;
  /**
   * Parse tokens into an AST
   */
  parse(tokens) {
    this.tokens = tokens;
    this.current = 0;
    if (this.tokens.length === 0 || this.tokens[0].type === lexer.TokenType.EOF) {
      throw new FQLSyntaxError("Empty query", 0);
    }
    const ast = this.parseExpression();
    if (!this.isAtEnd()) {
      throw new FQLSyntaxError(`Unexpected token '${this.peek().value}' at position ${this.peek().position}`, this.peek().position);
    }
    return ast;
  }
  /**
   * expression → or_expr
   */
  parseExpression() {
    return this.parseOrExpression();
  }
  /**
   * or_expr → and_expr ( OR and_expr )*
   */
  parseOrExpression() {
    let left = this.parseAndExpression();
    while (this.match(lexer.TokenType.OR)) {
      const right = this.parseAndExpression();
      left = {
        type: "or",
        left,
        right
      };
    }
    return left;
  }
  /**
   * and_expr → not_expr ( AND not_expr )*
   */
  parseAndExpression() {
    let left = this.parseNotExpression();
    while (this.match(lexer.TokenType.AND)) {
      const right = this.parseNotExpression();
      left = {
        type: "and",
        left,
        right
      };
    }
    return left;
  }
  /**
   * not_expr → NOT? primary
   */
  parseNotExpression() {
    if (this.match(lexer.TokenType.NOT)) {
      const child = this.parsePrimary();
      return {
        type: "not",
        child
      };
    }
    return this.parsePrimary();
  }
  /**
   * primary → filter | field | lang | score | term | phrase | grouped
   */
  parsePrimary() {
    if (this.match(lexer.TokenType.LPAREN)) {
      const expr = this.parseExpression();
      if (!this.match(lexer.TokenType.RPAREN)) {
        throw new FQLSyntaxError(`Expected ')' at position ${this.peek().position}`, this.peek().position);
      }
      return expr;
    }
    if (this.check(lexer.TokenType.EXACT) || this.check(lexer.TokenType.FUZZY) || this.check(lexer.TokenType.PHONETIC) || this.check(lexer.TokenType.PREFIX) || this.check(lexer.TokenType.REGEX) || this.check(lexer.TokenType.COMPOUND)) {
      return this.parseFilter();
    }
    if (this.check(lexer.TokenType.LANG)) {
      return this.parseLang();
    }
    if (this.check(lexer.TokenType.QUOTED)) {
      const token = this.advance();
      const phrase = {
        type: "phrase",
        value: token.value
      };
      if (this.check(lexer.TokenType.SCORE)) {
        return this.parseScore(phrase);
      }
      return phrase;
    }
    if (this.check(lexer.TokenType.TERM)) {
      const token = this.advance();
      if (this.match(lexer.TokenType.COLON)) {
        const child = this.parsePrimary();
        const field = {
          type: "field",
          field: token.value,
          child
        };
        return field;
      }
      const term = {
        type: "term",
        value: token.value
      };
      if (this.check(lexer.TokenType.SCORE)) {
        return this.parseScore(term);
      }
      return term;
    }
    throw new FQLSyntaxError(`Unexpected token '${this.peek().value}' at position ${this.peek().position}`, this.peek().position);
  }
  /**
   * filter → (EXACT|FUZZY|PHONETIC|PREFIX|REGEX|COMPOUND) COLON value
   */
  parseFilter() {
    const filterToken = this.advance();
    const filterType = filterToken.value.toLowerCase();
    if (!this.match(lexer.TokenType.COLON)) {
      throw new FQLSyntaxError(`Expected ':' after ${filterToken.value} at position ${this.peek().position}`, this.peek().position);
    }
    let value;
    if (this.check(lexer.TokenType.QUOTED)) {
      value = this.advance().value;
    } else if (this.check(lexer.TokenType.TERM)) {
      value = this.advance().value;
    } else {
      throw new FQLSyntaxError(`Expected value after ${filterToken.value}: at position ${this.peek().position}`, this.peek().position);
    }
    const filter = {
      type: "filter",
      filterType,
      value
    };
    if (this.check(lexer.TokenType.SCORE)) {
      return this.parseScore(filter);
    }
    return filter;
  }
  /**
   * lang → LANG COLON TERM expression
   */
  parseLang() {
    this.advance();
    if (!this.match(lexer.TokenType.COLON)) {
      throw new FQLSyntaxError(`Expected ':' after LANG at position ${this.peek().position}`, this.peek().position);
    }
    if (!this.check(lexer.TokenType.TERM)) {
      throw new FQLSyntaxError(`Expected language name after LANG: at position ${this.peek().position}`, this.peek().position);
    }
    const language = this.advance().value;
    const child = this.parsePrimary();
    return {
      type: "lang",
      language,
      child
    };
  }
  /**
   * score → expression SCORE (>|<|>=|<=) NUMBER
   */
  parseScore(child) {
    this.advance();
    if (!this.check(lexer.TokenType.SCORE_OP)) {
      throw new FQLSyntaxError(`Expected score operator (>, <, >=, <=) at position ${this.peek().position}`, this.peek().position);
    }
    const operator = this.advance().value;
    if (!this.check(lexer.TokenType.NUMBER)) {
      throw new FQLSyntaxError(`Expected number after ${operator} at position ${this.peek().position}`, this.peek().position);
    }
    const threshold = parseFloat(this.advance().value);
    if (isNaN(threshold) || threshold < 0 || threshold > 1) {
      throw new FQLSyntaxError(`Score threshold must be between 0 and 1`, this.previous().position);
    }
    return {
      type: "score",
      operator,
      threshold,
      child
    };
  }
  // Helper methods
  match(...types) {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }
  check(type) {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }
  advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }
  isAtEnd() {
    return this.peek().type === lexer.TokenType.EOF;
  }
  peek() {
    return this.tokens[this.current];
  }
  previous() {
    return this.tokens[this.current - 1];
  }
}
exports.FQLParser = FQLParser;
exports.FQLSyntaxError = FQLSyntaxError;
//# sourceMappingURL=parser.cjs.map
