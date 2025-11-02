/**
 * FQL Abstract Syntax Tree (AST) Node Types
 */

export type FQLNode = TermNode | PhraseNode | AndNode | OrNode | NotNode | FilterNode | FieldNode | ScoreNode | LangNode;

/**
 * Simple term node
 */
export interface TermNode {
  type: "term";
  value: string;
}

/**
 * Quoted phrase node
 */
export interface PhraseNode {
  type: "phrase";
  value: string;
}

/**
 * AND operator node (intersection)
 */
export interface AndNode {
  type: "and";
  left: FQLNode;
  right: FQLNode;
}

/**
 * OR operator node (union)
 */
export interface OrNode {
  type: "or";
  left: FQLNode;
  right: FQLNode;
}

/**
 * NOT operator node (exclusion)
 */
export interface NotNode {
  type: "not";
  child: FQLNode;
}

/**
 * Match type filter node
 */
export interface FilterNode {
  type: "filter";
  filterType: "exact" | "fuzzy" | "phonetic" | "prefix" | "regex" | "compound";
  value: string;
}

/**
 * Field selector node
 */
export interface FieldNode {
  type: "field";
  field: string;
  child: FQLNode;
}

/**
 * Score filter node
 */
export interface ScoreNode {
  type: "score";
  operator: ">" | "<" | ">=" | "<=";
  threshold: number;
  child: FQLNode;
}

/**
 * Language filter node
 */
export interface LangNode {
  type: "lang";
  language: string;
  child: FQLNode;
}

/**
 * Helper to check node type
 */
export function isTermNode(node: FQLNode): node is TermNode {
  return node.type === "term";
}

export function isPhraseNode(node: FQLNode): node is PhraseNode {
  return node.type === "phrase";
}

export function isAndNode(node: FQLNode): node is AndNode {
  return node.type === "and";
}

export function isOrNode(node: FQLNode): node is OrNode {
  return node.type === "or";
}

export function isNotNode(node: FQLNode): node is NotNode {
  return node.type === "not";
}

export function isFilterNode(node: FQLNode): node is FilterNode {
  return node.type === "filter";
}

export function isFieldNode(node: FQLNode): node is FieldNode {
  return node.type === "field";
}

export function isScoreNode(node: FQLNode): node is ScoreNode {
  return node.type === "score";
}

export function isLangNode(node: FQLNode): node is LangNode {
  return node.type === "lang";
}
