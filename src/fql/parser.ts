/**
 * FQL Parser
 * Converts tokens into an Abstract Syntax Tree (AST)
 */

import type { Token } from "./lexer.js";
import { TokenType } from "./lexer.js";
import type { FQLNode, TermNode, PhraseNode, AndNode, OrNode, NotNode, FilterNode, FieldNode, ScoreNode, LangNode } from "./ast.js";

export class FQLSyntaxError extends Error {
  public position: number;
  
  constructor(message: string, position: number) {
    super(message);
    this.name = "FQLSyntaxError";
    this.position = position;
  }
}

export class FQLParser {
  private tokens: Token[] = [];
  private current: number = 0;

  /**
   * Parse tokens into an AST
   */
  parse(tokens: Token[]): FQLNode {
    this.tokens = tokens;
    this.current = 0;

    if (this.tokens.length === 0 || this.tokens[0].type === TokenType.EOF) {
      throw new FQLSyntaxError("Empty query", 0);
    }

    const ast = this.parseExpression();

    // Ensure we consumed all tokens
    if (!this.isAtEnd()) {
      throw new FQLSyntaxError(`Unexpected token '${this.peek().value}' at position ${this.peek().position}`, this.peek().position);
    }

    return ast;
  }

  /**
   * expression → or_expr
   */
  private parseExpression(): FQLNode {
    return this.parseOrExpression();
  }

  /**
   * or_expr → and_expr ( OR and_expr )*
   */
  private parseOrExpression(): FQLNode {
    let left = this.parseAndExpression();

    while (this.match(TokenType.OR)) {
      const right = this.parseAndExpression();
      left = {
        type: "or",
        left,
        right,
      } as OrNode;
    }

    return left;
  }

  /**
   * and_expr → not_expr ( AND not_expr )*
   */
  private parseAndExpression(): FQLNode {
    let left = this.parseNotExpression();

    while (this.match(TokenType.AND)) {
      const right = this.parseNotExpression();
      left = {
        type: "and",
        left,
        right,
      } as AndNode;
    }

    return left;
  }

  /**
   * not_expr → NOT? primary
   */
  private parseNotExpression(): FQLNode {
    if (this.match(TokenType.NOT)) {
      const child = this.parsePrimary();
      return {
        type: "not",
        child,
      } as NotNode;
    }

    return this.parsePrimary();
  }

  /**
   * primary → filter | field | lang | score | term | phrase | grouped
   */
  private parsePrimary(): FQLNode {
    // Grouped expression: ( expression )
    if (this.match(TokenType.LPAREN)) {
      const expr = this.parseExpression();
      if (!this.match(TokenType.RPAREN)) {
        throw new FQLSyntaxError(`Expected ')' at position ${this.peek().position}`, this.peek().position);
      }
      return expr;
    }

    // Filter: EXACT:value, FUZZY:value, etc.
    if (this.check(TokenType.EXACT) || this.check(TokenType.FUZZY) || this.check(TokenType.PHONETIC) || this.check(TokenType.PREFIX) || this.check(TokenType.REGEX) || this.check(TokenType.COMPOUND)) {
      return this.parseFilter();
    }

    // Language: LANG:german term
    if (this.check(TokenType.LANG)) {
      return this.parseLang();
    }

    // Quoted phrase
    if (this.check(TokenType.QUOTED)) {
      const token = this.advance();
      const phrase: PhraseNode = {
        type: "phrase",
        value: token.value,
      };

      // Check for SCORE filter after phrase
      if (this.check(TokenType.SCORE)) {
        return this.parseScore(phrase);
      }

      return phrase;
    }

    // Term (could be field:value or just term)
    if (this.check(TokenType.TERM)) {
      const token = this.advance();

      // Check if it's a field selector: term:expression
      if (this.match(TokenType.COLON)) {
        const child = this.parsePrimary();
        const field: FieldNode = {
          type: "field",
          field: token.value,
          child,
        };
        return field;
      }

      // Just a regular term
      const term: TermNode = {
        type: "term",
        value: token.value,
      };

      // Check for SCORE filter after term
      if (this.check(TokenType.SCORE)) {
        return this.parseScore(term);
      }

      return term;
    }

    throw new FQLSyntaxError(`Unexpected token '${this.peek().value}' at position ${this.peek().position}`, this.peek().position);
  }

  /**
   * filter → (EXACT|FUZZY|PHONETIC|PREFIX|REGEX|COMPOUND) COLON value
   */
  private parseFilter(): FQLNode {
    const filterToken = this.advance();
    const filterType = filterToken.value.toLowerCase() as "exact" | "fuzzy" | "phonetic" | "prefix" | "regex" | "compound";

    if (!this.match(TokenType.COLON)) {
      throw new FQLSyntaxError(`Expected ':' after ${filterToken.value} at position ${this.peek().position}`, this.peek().position);
    }

    let value: string;

    if (this.check(TokenType.QUOTED)) {
      value = this.advance().value;
    } else if (this.check(TokenType.TERM)) {
      value = this.advance().value;
    } else {
      throw new FQLSyntaxError(`Expected value after ${filterToken.value}: at position ${this.peek().position}`, this.peek().position);
    }

    const filter: FilterNode = {
      type: "filter",
      filterType,
      value,
    };

    // Check for SCORE filter after filter
    if (this.check(TokenType.SCORE)) {
      return this.parseScore(filter);
    }

    return filter;
  }

  /**
   * lang → LANG COLON TERM expression
   */
  private parseLang(): LangNode {
    this.advance(); // Consume LANG

    if (!this.match(TokenType.COLON)) {
      throw new FQLSyntaxError(`Expected ':' after LANG at position ${this.peek().position}`, this.peek().position);
    }

    if (!this.check(TokenType.TERM)) {
      throw new FQLSyntaxError(`Expected language name after LANG: at position ${this.peek().position}`, this.peek().position);
    }

    const language = this.advance().value;
    const child = this.parsePrimary();

    return {
      type: "lang",
      language,
      child,
    };
  }

  /**
   * score → expression SCORE (>|<|>=|<=) NUMBER
   */
  private parseScore(child: FQLNode): ScoreNode {
    this.advance(); // Consume SCORE

    if (!this.check(TokenType.SCORE_OP)) {
      throw new FQLSyntaxError(`Expected score operator (>, <, >=, <=) at position ${this.peek().position}`, this.peek().position);
    }

    const operator = this.advance().value as ">" | "<" | ">=" | "<=";

    if (!this.check(TokenType.NUMBER)) {
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
      child,
    };
  }

  // Helper methods

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }
}
