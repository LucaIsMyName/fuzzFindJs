"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const lexer = require("./lexer.cjs");
const parser = require("./parser.cjs");
const executor = require("./executor.cjs");
function isFQLQuery(query) {
  const trimmed = query.trim();
  return trimmed.startsWith("fql(") && trimmed.endsWith(")");
}
function extractFQLQuery(query) {
  const trimmed = query.trim();
  if (!isFQLQuery(trimmed)) {
    throw new Error("Not a valid FQL query. Must be wrapped in fql(...)");
  }
  return trimmed.slice(4, -1).trim();
}
function executeFQLQuery(index, query, maxResults, options = {}) {
  try {
    const fqlQuery = extractFQLQuery(query);
    const lexer$1 = new lexer.FQLLexer();
    const tokens = lexer$1.tokenize(fqlQuery);
    const parser$1 = new parser.FQLParser();
    const ast = parser$1.parse(tokens);
    const executor$1 = new executor.FQLExecutor(index, options);
    const results = executor$1.execute(ast);
    const limit = maxResults || options.maxResults || 10;
    return results.slice(0, limit);
  } catch (error) {
    if (error instanceof parser.FQLSyntaxError || error instanceof executor.FQLTimeoutError) {
      throw error;
    }
    throw new Error(`FQL execution error: ${error.message}`);
  }
}
exports.FQLLexer = lexer.FQLLexer;
exports.TokenType = lexer.TokenType;
exports.FQLParser = parser.FQLParser;
exports.FQLSyntaxError = parser.FQLSyntaxError;
exports.FQLExecutor = executor.FQLExecutor;
exports.FQLTimeoutError = executor.FQLTimeoutError;
exports.executeFQLQuery = executeFQLQuery;
exports.extractFQLQuery = extractFQLQuery;
exports.isFQLQuery = isFQLQuery;
//# sourceMappingURL=index.cjs.map
