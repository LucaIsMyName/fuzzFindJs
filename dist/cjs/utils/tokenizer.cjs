"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const WORD_BOUNDARY_PATTERN = /[\s\-_.,;:!?()[\]{}'"\/\\#@$%^&*+=<>|~`]+/;
function tokenize(text, options = {}) {
  const { keepEmpty = false, minLength = 0, lowercase = false } = options;
  let tokens = text.split(WORD_BOUNDARY_PATTERN);
  if (!keepEmpty) {
    tokens = tokens.filter((token) => token.length > 0);
  }
  if (minLength > 0) {
    tokens = tokens.filter((token) => token.length >= minLength);
  }
  if (lowercase) {
    tokens = tokens.map((token) => token.toLowerCase());
  }
  return tokens;
}
exports.WORD_BOUNDARY_PATTERN = WORD_BOUNDARY_PATTERN;
exports.tokenize = tokenize;
//# sourceMappingURL=tokenizer.cjs.map
