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
export function detectLanguages(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return ['english']; // Default fallback
  }

  const detected = new Set<string>();

  // Always include English as base language
  detected.add('english');

  // German indicators: ä, ö, ü, ß
  if (/[äöüßÄÖÜ]/.test(text)) {
    detected.add('german');
  }

  // French indicators: é, è, ê, à, ç, œ, etc.
  if (/[àâäæçéèêëïîôùûüÿœÀÂÄÆÇÉÈÊËÏÎÔÙÛÜŸŒ]/.test(text)) {
    detected.add('french');
  }

  // Spanish indicators: ñ, á, é, í, ó, ú, ¿, ¡
  if (/[áéíóúñüÁÉÍÓÚÑÜ¿¡]/.test(text)) {
    detected.add('spanish');
  }

  return Array.from(detected);
}

/**
 * Detect languages with confidence scores
 * Provides more detailed information about language detection
 * 
 * @param text - Text to analyze
 * @returns Detection result with confidence scores
 */
export function detectLanguagesWithConfidence(text: string): LanguageDetectionResult {
  if (!text || text.trim().length === 0) {
    return {
      languages: ['english'],
      confidence: { english: 1.0 },
      primary: 'english',
    };
  }

  const confidence: Record<string, number> = {
    english: 0.5, // Base confidence for English
  };

  const textLength = text.length;

  // Count German characters
  const germanChars = (text.match(/[äöüßÄÖÜ]/g) || []).length;
  if (germanChars > 0) {
    confidence.german = Math.min(1.0, 0.5 + (germanChars / textLength) * 10);
  }

  // Count French characters
  const frenchChars = (text.match(/[àâäæçéèêëïîôùûüÿœÀÂÄÆÇÉÈÊËÏÎÔÙÛÜŸŒ]/g) || []).length;
  if (frenchChars > 0) {
    confidence.french = Math.min(1.0, 0.5 + (frenchChars / textLength) * 10);
  }

  // Count Spanish characters
  const spanishChars = (text.match(/[áéíóúñüÁÉÍÓÚÑÜ¿¡]/g) || []).length;
  if (spanishChars > 0) {
    confidence.spanish = Math.min(1.0, 0.5 + (spanishChars / textLength) * 10);
  }

  // Determine languages (confidence > 0.5)
  const languages = Object.entries(confidence)
    .filter(([_, conf]) => conf >= 0.5)
    .map(([lang]) => lang);

  // Find primary language (highest confidence)
  const primary = Object.entries(confidence)
    .sort(([, a], [, b]) => b - a)[0][0];

  return {
    languages,
    confidence,
    primary,
  };
}

/**
 * Sample text from a dataset for language detection
 * Takes first N items to avoid processing entire large datasets
 * 
 * @param words - Array of words or objects
 * @param sampleSize - Number of items to sample (default: 100)
 * @returns Combined sample text
 */
export function sampleTextForDetection(
  //
  words: (string | any)[], sampleSize: number = 100): string {
  const sample = words.slice(0, Math.min(sampleSize, words.length));
  
  return sample
    .map(item => {
      if (typeof item === 'string') {
        return item;
      } else if (typeof item === 'object' && item !== null) {
        // Extract text from object fields
        return Object.values(item)
          .filter(v => typeof v === 'string')
          .join(' ');
      }
      return '';
    })
    .join(' ');
}

/**
 * Check if a language code is valid
 */
export function isValidLanguage(lang: string): boolean {
  const validLanguages = ['english', 'german', 'french', 'spanish', 'auto'];
  return validLanguages.includes(lang.toLowerCase());
}

/**
 * Normalize language codes
 * Handles common variations and aliases
 */
export function normalizeLanguageCode(lang: string): string {
  const normalized = lang.toLowerCase().trim();
  
  // Handle aliases
  const aliases: Record<string, string> = {
    'en': 'english',
    'de': 'german',
    'fr': 'french',
    'es': 'spanish',
    'eng': 'english',
    'deu': 'german',
    'fra': 'french',
    'esp': 'spanish',
  };
  
  return aliases[normalized] || normalized;
}
