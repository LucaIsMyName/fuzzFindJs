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
export declare function isTermNode(node: FQLNode): node is TermNode;
export declare function isPhraseNode(node: FQLNode): node is PhraseNode;
export declare function isAndNode(node: FQLNode): node is AndNode;
export declare function isOrNode(node: FQLNode): node is OrNode;
export declare function isNotNode(node: FQLNode): node is NotNode;
export declare function isFilterNode(node: FQLNode): node is FilterNode;
export declare function isFieldNode(node: FQLNode): node is FieldNode;
export declare function isScoreNode(node: FQLNode): node is ScoreNode;
export declare function isLangNode(node: FQLNode): node is LangNode;
//# sourceMappingURL=ast.d.ts.map