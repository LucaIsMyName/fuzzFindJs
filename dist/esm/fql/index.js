import { FQLLexer } from "./lexer.js";
import { TokenType } from "./lexer.js";
import { FQLParser, FQLSyntaxError } from "./parser.js";
import { FQLExecutor, FQLTimeoutError } from "./executor.js";
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
    const lexer = new FQLLexer();
    const tokens = lexer.tokenize(fqlQuery);
    const parser = new FQLParser();
    const ast = parser.parse(tokens);
    const executor = new FQLExecutor(index, options);
    const results = executor.execute(ast);
    const limit = maxResults || options.maxResults || 10;
    return results.slice(0, limit);
  } catch (error) {
    if (error instanceof FQLSyntaxError || error instanceof FQLTimeoutError) {
      throw error;
    }
    throw new Error(`FQL execution error: ${error.message}`);
  }
}
export {
  FQLExecutor,
  FQLLexer,
  FQLParser,
  FQLSyntaxError,
  FQLTimeoutError,
  TokenType,
  executeFQLQuery,
  extractFQLQuery,
  isFQLQuery
};
//# sourceMappingURL=index.js.map
