import type { LanguageProcessor } from '../core/types.js';
import { GermanProcessor } from './german/GermanProcessor.js';
import { EnglishProcessor } from './english/EnglishProcessor.js';
import { SpanishProcessor } from './spanish/SpanishProcessor.js';
import { FrenchProcessor } from './french/FrenchProcessor.js';

/**
 * Registry of all available language processors
 */
export class LanguageRegistry {
  private static processors = new Map<string, LanguageProcessor>([
    ['german', new GermanProcessor()],
    ['english', new EnglishProcessor()],
    ['spanish', new SpanishProcessor()],
    ['french', new FrenchProcessor()]
  ]);

  /**
   * Get a language processor by name
   */
  static getProcessor(language: string): LanguageProcessor | undefined {
    return this.processors.get(language.toLowerCase());
  }

  /**
   * Get multiple language processors
   */
  static getProcessors(languages: string[]): LanguageProcessor[] {
    return languages
      .map(lang => this.getProcessor(lang))
      .filter((processor): processor is LanguageProcessor => processor !== undefined);
  }

  /**
   * Get all available language names
   */
  static getAvailableLanguages(): string[] {
    return Array.from(this.processors.keys());
  }

  /**
   * Register a custom language processor
   */
  static registerProcessor(processor: LanguageProcessor): void {
    this.processors.set(processor.language.toLowerCase(), processor);
  }

  /**
   * Check if a language is supported
   */
  static isSupported(language: string): boolean {
    return this.processors.has(language.toLowerCase());
  }

  /**
   * Get processor info for all languages
   */
  static getProcessorInfo(): Array<{
    language: string;
    displayName: string;
    supportedFeatures: string[];
  }> {
    return Array.from(this.processors.values()).map(processor => ({
      language: processor.language,
      displayName: processor.displayName,
      supportedFeatures: processor.supportedFeatures
    }));
  }
}

// Export individual processors for direct use
export { GermanProcessor } from './german/GermanProcessor.js';
export { EnglishProcessor } from './english/EnglishProcessor.js';
export { SpanishProcessor } from './spanish/SpanishProcessor.js';
export { FrenchProcessor } from './french/FrenchProcessor.js';
export { BaseLanguageProcessor } from './base/LanguageProcessor.js';
