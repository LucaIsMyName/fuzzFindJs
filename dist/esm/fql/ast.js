function isTermNode(node) {
  return node.type === "term";
}
function isPhraseNode(node) {
  return node.type === "phrase";
}
function isAndNode(node) {
  return node.type === "and";
}
function isOrNode(node) {
  return node.type === "or";
}
function isNotNode(node) {
  return node.type === "not";
}
function isFilterNode(node) {
  return node.type === "filter";
}
function isFieldNode(node) {
  return node.type === "field";
}
function isScoreNode(node) {
  return node.type === "score";
}
function isLangNode(node) {
  return node.type === "lang";
}
export {
  isAndNode,
  isFieldNode,
  isFilterNode,
  isLangNode,
  isNotNode,
  isOrNode,
  isPhraseNode,
  isScoreNode,
  isTermNode
};
//# sourceMappingURL=ast.js.map
