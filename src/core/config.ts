import type {
  //
  FuzzyConfig,
  FuzzyFeature,
  MatchTypeScores,
  ScoringModifiers,
} from "./types.js";

/**
 * Default match type scores
 * These values determine the base score for each match type
 */
export const DEFAULT_MATCH_TYPE_SCORES: MatchTypeScores = {
  exact: 1.0,
  prefix: 0.9,
  substring: 0.85,     // Slightly lower than prefix
  phonetic: 0.8,       // Slightly lower
  fuzzy: 0.9,          // High base score but will be penalized by distance
  fuzzyMin: 0.3,       // Not too low
  synonym: 0.75,       // Good score for synonyms
  compound: 0.9,       // Good score for compound words
  ngram: 0.8,          // Good score for n-gram matching
};

/**
 * Default scoring modifiers
 * These values control additional scoring behavior
 */
export const DEFAULT_SCORING_MODIFIERS: ScoringModifiers = {
  baseScore: 0.6,
  shortWordBoost: 0.1,
  shortWordMaxDiff: 3,
  prefixLengthPenalty: false,
};

/**
 * Default configuration for FuzzyFindJS
 * Provides sensible defaults that work out of the box
 */
export const DEFAULT_CONFIG: FuzzyConfig = {
  languages: ["english"],
  features: ["phonetic", "compound", "synonyms", "keyboard-neighbors", "partial-words", "missing-letters", "extra-letters", "transpositions"],
  performance: "balanced",
  maxResults: 10,
  minQueryLength: 2,
  fuzzyThreshold: 0.75,
  maxEditDistance: 2,
  ngramSize: 3,
  enableAlphanumericSegmentation: true, // Enabled by default - opt-out for performance if needed
  alphanumericAlphaWeight: 0.7,
  alphanumericNumericWeight: 0.3,
  alphanumericNumericEditDistanceMultiplier: 1.5,
  matchTypeScores: DEFAULT_MATCH_TYPE_SCORES,
  scoringModifiers: DEFAULT_SCORING_MODIFIERS,
};

/**
 * Performance-optimized configurations
 */
export const PERFORMANCE_CONFIGS: Record<string, Partial<FuzzyConfig>> = {
  fast: {
    performance: "fast",
    features: ["partial-words", "missing-letters"],
    maxEditDistance: 1,
    fuzzyThreshold: 0.9,
    maxResults: 3,
    enableAlphanumericSegmentation: true, // Enabled in fast mode
    matchTypeScores: {
      exact: 1.0,
      prefix: 0.95,      // Higher - prioritize exact/prefix in fast mode
      substring: 0.7,    // Lower - less important
      fuzzy: 1.0,
      fuzzyMin: 0.5,     // Higher minimum - stricter matching
    },
  },
  balanced: {
    performance: "balanced",
    features: ["phonetic", "partial-words", "missing-letters", "keyboard-neighbors"],
    maxEditDistance: 2,
    fuzzyThreshold: 0.75,
    maxResults: 5,
    enableAlphanumericSegmentation: true, // Enabled in balanced mode
    // Uses default scoring
  },
  comprehensive: {
    performance: "comprehensive",
    features: ["phonetic", "compound", "synonyms", "keyboard-neighbors", "partial-words", "missing-letters", "extra-letters", "transpositions"],
    maxEditDistance: 3,
    fuzzyThreshold: 0.7,
    maxResults: 10,
    enableAlphanumericSegmentation: true, // Enabled in comprehensive mode
    matchTypeScores: {
      phonetic: 0.75,    // Higher - more weight on phonetic
      synonym: 0.65,     // Higher - more weight on synonyms
      fuzzyMin: 0.2,     // Lower - more lenient
    },
  },
};

/**
 * Language-specific feature recommendations
 */
export const LANGUAGE_FEATURES: Record<string, FuzzyFeature[]> = {
  german: [
    //
    "phonetic",
    "compound",
    "synonyms",
    "keyboard-neighbors",
    "partial-words",
    "missing-letters",
    "extra-letters",
  ],
  english: [
    //
    "phonetic",
    "synonyms",
    "keyboard-neighbors",
    "partial-words",
    "missing-letters",
    "transpositions",
  ],
  spanish: [
    //
    "phonetic",
    "synonyms",
    "keyboard-neighbors",
    "partial-words",
    "missing-letters",
  ],
  french: [
    //
    "phonetic",
    "synonyms",
    "keyboard-neighbors",
    "partial-words",
    "missing-letters",
  ],
};

/**
 * Merge user configuration with defaults
 */
export function mergeConfig(userConfig: Partial<FuzzyConfig> = {}): FuzzyConfig {
  const baseConfig = { ...DEFAULT_CONFIG };

  // Apply performance preset if specified
  if (userConfig.performance && userConfig.performance !== "balanced") {
    const performanceConfig = PERFORMANCE_CONFIGS[userConfig.performance];
    Object.assign(baseConfig, performanceConfig);
    
    // Deep merge scoring configs from performance preset
    if (performanceConfig.matchTypeScores) {
      baseConfig.matchTypeScores = {
        ...DEFAULT_MATCH_TYPE_SCORES,
        ...performanceConfig.matchTypeScores,
      };
    }
    if (performanceConfig.scoringModifiers) {
      baseConfig.scoringModifiers = {
        ...DEFAULT_SCORING_MODIFIERS,
        ...performanceConfig.scoringModifiers,
      };
    }
  }

  // Apply user overrides
  const mergedConfig = { ...baseConfig, ...userConfig };

  // Deep merge user scoring configs
  if (userConfig.matchTypeScores) {
    mergedConfig.matchTypeScores = {
      ...baseConfig.matchTypeScores,
      ...userConfig.matchTypeScores,
    };
  }
  if (userConfig.scoringModifiers) {
    mergedConfig.scoringModifiers = {
      ...baseConfig.scoringModifiers,
      ...userConfig.scoringModifiers,
    };
  }

  // Auto-adjust features based on languages if not explicitly set
  if (!userConfig.features && userConfig.languages) {
    const recommendedFeatures = new Set<FuzzyFeature>();

    for (const lang of userConfig.languages) {
      const langFeatures = LANGUAGE_FEATURES[lang] || LANGUAGE_FEATURES.english;
      langFeatures.forEach((feature) => recommendedFeatures.add(feature));
    }

    mergedConfig.features = Array.from(recommendedFeatures);
  }

  return mergedConfig;
}

/**
 * Validate configuration
 */
export function validateConfig(config: FuzzyConfig): void {
  if (config.maxResults < 1) {
    throw new Error("maxResults must be at least 1");
  }

  if (config.minQueryLength < 1) {
    throw new Error("minQueryLength must be at least 1");
  }

  if (config.fuzzyThreshold < 0 || config.fuzzyThreshold > 1) {
    throw new Error("fuzzyThreshold must be between 0 and 1");
  }

  if (config.maxEditDistance < 0) {
    throw new Error("maxEditDistance must be non-negative");
  }

  if (config.ngramSize < 2) {
    throw new Error("ngramSize must be at least 2");
  }

  if (config.languages.length === 0) {
    throw new Error("At least one language must be specified");
  }
}
