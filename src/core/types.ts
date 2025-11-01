/**
 * Core type definitions for FuzzyFindJS
 */

export interface SuggestionResult {
  /** Formatted display text with proper capitalization */
  display: string;
  /** Original base word that was matched */
  baseWord: string;
  /** Whether this result came from synonym matching */
  isSynonym: boolean;
  /** Confidence score (0-1, higher is better) */
  score: number;
  /** Language of the matched word */
  language?: string;
}

export interface FuzzyIndex {
  /** Normalized base words */
  base: string[];
  /** Variant mappings for fuzzy matching */
  variantToBase: Map<string, Set<string>>;
  /** Phonetic code mappings */
  phoneticToBase: Map<string, Set<string>>;
  /** N-gram index for partial matching */
  ngramIndex: Map<string, Set<string>>;
  /** Synonym mappings */
  synonymMap: Map<string, Set<string>>;
  /** Language processors used in this index */
  languageProcessors: Map<string, LanguageProcessor>;
  /** Configuration used to build this index */
  config: FuzzyConfig;
}

export interface FuzzyConfig {
  /** Languages to enable (default: ['german']) */
  languages: string[];
  /** Features to enable */
  features: FuzzyFeature[];
  /** Performance mode */
  performance: 'fast' | 'balanced' | 'comprehensive';
  /** Maximum number of results (default: 5) */
  maxResults: number;
  /** Minimum query length (default: 2) */
  minQueryLength: number;
  /** Fuzzy matching threshold (0-1, default: 0.8) */
  fuzzyThreshold: number;
  /** Maximum edit distance for fuzzy matching (default: 2) */
  maxEditDistance: number;
  /** N-gram size for partial matching (default: 3) */
  ngramSize: number;
  /** Custom synonym dictionaries */
  customSynonyms?: Record<string, string[]>;
  /** Custom word normalization function */
  customNormalizer?: (word: string) => string;
}

export type FuzzyFeature = 
  | 'phonetic'           // Phonetic matching
  | 'compound'           // Compound word splitting
  | 'synonyms'           // Synonym matching
  | 'keyboard-neighbors' // Keyboard neighbor typos
  | 'partial-words'      // Partial word matching
  | 'missing-letters'    // Handle missing letters
  | 'extra-letters'      // Handle extra letters
  | 'transpositions';    // Handle letter transpositions

export interface LanguageProcessor {
  /** Language identifier */
  readonly language: string;
  /** Language display name */
  readonly displayName: string;
  /** Supported features for this language */
  readonly supportedFeatures: FuzzyFeature[];
  
  /** Normalize text for this language */
  normalize(text: string): string;
  /** Generate phonetic code */
  getPhoneticCode(word: string): string;
  /** Split compound words (if supported) */
  splitCompoundWords(word: string): string[];
  /** Get word variants (endings, prefixes, etc.) */
  getWordVariants(word: string): string[];
  /** Get built-in synonyms for this language */
  getSynonyms(word: string): string[];
  /** Check if character substitution is valid (keyboard neighbors, etc.) */
  isValidSubstitution(char1: string, char2: string): boolean;
}

export interface SearchMatch {
  /** Original word from dictionary */
  word: string;
  /** Normalized form used for matching */
  normalized: string;
  /** Match type that found this result */
  matchType: MatchType;
  /** Edit distance (for fuzzy matches) */
  editDistance?: number;
  /** Phonetic code (for phonetic matches) */
  phoneticCode?: string;
  /** Language processor that handled this match */
  language: string;
}

export type MatchType = 
  | 'exact'              // Exact match
  | 'prefix'             // Prefix match
  | 'substring'          // Substring match
  | 'fuzzy'              // Fuzzy/edit distance match
  | 'phonetic'           // Phonetic similarity match
  | 'synonym'            // Synonym match
  | 'compound'           // Compound word component match
  | 'ngram';             // N-gram partial match

export interface BuildIndexOptions {
  /** Configuration for the index */
  config?: Partial<FuzzyConfig>;
  /** Language processors to use */
  languageProcessors?: LanguageProcessor[];
  /** Progress callback for large datasets */
  onProgress?: (processed: number, total: number) => void;
}

export interface SearchOptions {
  /** Override max results for this search */
  maxResults?: number;
  /** Override fuzzy threshold for this search */
  fuzzyThreshold?: number;
  /** Filter by specific languages */
  languages?: string[];
  /** Filter by match types */
  matchTypes?: MatchType[];
  /** Include debug information */
  debug?: boolean;
}

export interface DebugInfo {
  /** Query processing steps */
  queryProcessing: {
    original: string;
    normalized: string;
    phoneticCode?: string;
    variants: string[];
  };
  /** All matches found before ranking */
  allMatches: SearchMatch[];
  /** Timing information */
  timing: {
    total: number;
    indexLookup: number;
    fuzzyMatching: number;
    ranking: number;
  };
}

export interface SuggestionResultWithDebug extends SuggestionResult {
  /** Debug information (only included if debug: true) */
  debug?: DebugInfo;
}
