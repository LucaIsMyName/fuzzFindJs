/**
 * Language auto-detection utility
 * Uses character-based heuristics to detect languages in text
 */
export interface LanguageDetectionResult {
    /** Detected languages */
    languages: string[];
    /** Confidence scores for each language (0-1) */
    confidence: Record<string, number>;
    /** Primary language (highest confidence) */
    primary: string;
}
/**
 * Detect languages from text using character-based heuristics
 * Detects multiple languages if present in the same text
 *
 * @param text - Text to analyze
 * @returns Array of detected language codes
 *
 * @example
 * detectLanguages('Müller café hello')
 * // → ['english', 'german', 'french']
 */
export declare function detectLanguages(text: string): string[];
/**
 * Detect languages with confidence scores
 * Provides more detailed information about language detection
 *
 * @param text - Text to analyze
 * @returns Detection result with confidence scores
 */
export declare function detectLanguagesWithConfidence(text: string): LanguageDetectionResult;
/**
 * Sample text from a dataset for language detection
 * Takes first N items to avoid processing entire large datasets
 *
 * @param words - Array of words or objects
 * @param sampleSize - Number of items to sample (default: 100)
 * @returns Combined sample text
 */
export declare function sampleTextForDetection(words: (string | any)[], sampleSize?: number): string;
/**
 * Check if a language code is valid
 */
export declare function isValidLanguage(lang: string): boolean;
/**
 * Normalize language codes
 * Handles common variations and aliases
 */
export declare function normalizeLanguageCode(lang: string): string;
//# sourceMappingURL=language-detection.d.ts.map