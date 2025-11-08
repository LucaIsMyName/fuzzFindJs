const DEFAULT_MATCH_TYPE_SCORES = {
  exact: 1,
  // Perfect matches get full score
  prefix: 0.97,
  // High base for prefixes (will be scaled by length ratio)
  substring: 0.87,
  // Good base for substrings (will be adjusted by position/coverage)
  phonetic: 0.4,
  // Moderate - phonetic is a weaker signal
  fuzzy: 0.7,
  // Good base for fuzzy matches (will be scaled by edit distance)
  fuzzyMin: 0.3,
  // Lower minimum to allow more fuzzy matches through
  synonym: 0.45,
  // Moderate for synonyms (will be scaled by length)
  compound: 0.82,
  // Strong for compound matches (will be scaled by length)
  ngram: 0.28
  // Very low - n-grams are weakest signal, avoid gibberish
};
const DEFAULT_SCORING_MODIFIERS = {
  baseScore: 0,
  // Don't add base score - let match types determine score
  shortWordBoost: 0,
  // Disable boost - was inflating weak matches
  shortWordMaxDiff: 3,
  prefixLengthPenalty: false
};
const DEFAULT_CONFIG = {
  languages: ["english"],
  features: ["phonetic", "compound", "synonyms", "keyboard-neighbors", "partial-words", "missing-letters", "extra-letters", "transpositions"],
  performance: "balanced",
  maxResults: 10,
  minQueryLength: 1,
  // Allow short words (1-2 chars) for better fuzzy matching
  fuzzyThreshold: 0.33,
  // Balanced threshold - filters gibberish while keeping good matches
  maxEditDistance: 2,
  ngramSize: 3,
  enableAlphanumericSegmentation: true,
  // Enabled by default - opt-out for performance if needed
  alphanumericAlphaWeight: 0.7,
  alphanumericNumericWeight: 0.3,
  alphanumericNumericEditDistanceMultiplier: 1.5,
  matchTypeScores: DEFAULT_MATCH_TYPE_SCORES,
  scoringModifiers: DEFAULT_SCORING_MODIFIERS
};
const PERFORMANCE_CONFIGS = {
  fast: {
    performance: "fast",
    features: ["partial-words", "compound", "missing-letters", "extra-letters", "transpositions"],
    maxEditDistance: 3,
    fuzzyThreshold: 0.33,
    // Lower threshold for better recall
    maxResults: 3,
    enableAlphanumericSegmentation: true,
    matchTypeScores: {
      exact: 1,
      prefix: 0.93,
      // High base, will be scaled by length
      substring: 0.77,
      // Moderate base, will be scaled by position/coverage
      fuzzy: 0.65,
      ngram: 0.29,
      fuzzyMin: 0.25
      // Lower minimum for better recall
    }
  },
  balanced: {
    performance: "balanced",
    features: ["phonetic", "compound", "keyboard-neighbors", "partial-words", "missing-letters", "extra-letters", "transpositions"],
    maxEditDistance: 3,
    fuzzyThreshold: 0.33,
    // Slightly higher to filter gibberish n-gram matches
    maxResults: 10,
    enableAlphanumericSegmentation: true,
    matchTypeScores: {
      ngram: 0.27
      // Even lower for balanced mode to avoid gibberish
    }
  },
  comprehensive: {
    performance: "comprehensive",
    features: ["phonetic", "compound", "synonyms", "keyboard-neighbors", "partial-words", "missing-letters", "extra-letters", "transpositions"],
    maxEditDistance: 3,
    fuzzyThreshold: 0.27,
    // Very low threshold for maximum recall
    maxResults: 20,
    enableAlphanumericSegmentation: true,
    matchTypeScores: {
      exact: 1,
      prefix: 0.93,
      // High base (will be scaled down by length ratio)
      substring: 0.8,
      // Good base (will be adjusted by position/coverage)
      fuzzy: 0.65,
      fuzzyMin: 0.15,
      // Very low for maximum recall
      phonetic: 0.45,
      // Moderate for comprehensive matching
      synonym: 0.5,
      compound: 0.75,
      ngram: 0.35
    }
  }
};
const LANGUAGE_FEATURES = {
  german: [
    //
    "phonetic",
    "compound",
    "synonyms",
    "keyboard-neighbors",
    "partial-words",
    "missing-letters",
    "extra-letters"
  ],
  english: [
    //
    "phonetic",
    "synonyms",
    "keyboard-neighbors",
    "partial-words",
    "missing-letters",
    "transpositions"
  ],
  spanish: [
    //
    "phonetic",
    "synonyms",
    "keyboard-neighbors",
    "partial-words",
    "missing-letters"
  ],
  french: [
    //
    "phonetic",
    "synonyms",
    "keyboard-neighbors",
    "partial-words",
    "missing-letters"
  ]
};
function mergeConfig(userConfig = {}) {
  const baseConfig = { ...DEFAULT_CONFIG };
  if (userConfig.performance && userConfig.performance !== "balanced") {
    const performanceConfig = PERFORMANCE_CONFIGS[userConfig.performance];
    Object.assign(baseConfig, performanceConfig);
    if (performanceConfig.matchTypeScores) {
      baseConfig.matchTypeScores = {
        ...DEFAULT_MATCH_TYPE_SCORES,
        ...performanceConfig.matchTypeScores
      };
    }
    if (performanceConfig.scoringModifiers) {
      baseConfig.scoringModifiers = {
        ...DEFAULT_SCORING_MODIFIERS,
        ...performanceConfig.scoringModifiers
      };
    }
  }
  const mergedConfig = { ...baseConfig, ...userConfig };
  if (userConfig.matchTypeScores) {
    mergedConfig.matchTypeScores = {
      ...baseConfig.matchTypeScores,
      ...userConfig.matchTypeScores
    };
  }
  if (userConfig.scoringModifiers) {
    mergedConfig.scoringModifiers = {
      ...baseConfig.scoringModifiers,
      ...userConfig.scoringModifiers
    };
  }
  if (!userConfig.features && userConfig.languages) {
    const recommendedFeatures = /* @__PURE__ */ new Set();
    for (const lang of userConfig.languages) {
      const langFeatures = LANGUAGE_FEATURES[lang] || LANGUAGE_FEATURES.english;
      langFeatures.forEach((feature) => recommendedFeatures.add(feature));
    }
    mergedConfig.features = Array.from(recommendedFeatures);
  }
  return mergedConfig;
}
function validateConfig(config) {
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
export {
  DEFAULT_CONFIG,
  DEFAULT_MATCH_TYPE_SCORES,
  DEFAULT_SCORING_MODIFIERS,
  LANGUAGE_FEATURES,
  PERFORMANCE_CONFIGS,
  mergeConfig,
  validateConfig
};
//# sourceMappingURL=config.js.map
