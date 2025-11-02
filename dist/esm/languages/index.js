import { GermanProcessor } from "./german/GermanProcessor.js";
import { EnglishProcessor } from "./english/EnglishProcessor.js";
import { SpanishProcessor } from "./spanish/SpanishProcessor.js";
import { FrenchProcessor } from "./french/FrenchProcessor.js";
import { BaseLanguageProcessor } from "./base/LanguageProcessor.js";
class LanguageRegistry {
  static processors = /* @__PURE__ */ new Map([
    ["german", new GermanProcessor()],
    ["english", new EnglishProcessor()],
    ["spanish", new SpanishProcessor()],
    ["french", new FrenchProcessor()]
  ]);
  /**
   * Get a language processor by name
   */
  static getProcessor(language) {
    return this.processors.get(language.toLowerCase());
  }
  /**
   * Get multiple language processors
   */
  static getProcessors(languages) {
    return languages.map((lang) => this.getProcessor(lang)).filter((processor) => processor !== void 0);
  }
  /**
   * Get all available language names
   */
  static getAvailableLanguages() {
    return Array.from(this.processors.keys());
  }
  /**
   * Register a custom language processor
   */
  static registerProcessor(processor) {
    this.processors.set(processor.language.toLowerCase(), processor);
  }
  /**
   * Check if a language is supported
   */
  static isSupported(language) {
    return this.processors.has(language.toLowerCase());
  }
  /**
   * Get processor info for all languages
   */
  static getProcessorInfo() {
    return Array.from(this.processors.values()).map((processor) => ({
      language: processor.language,
      displayName: processor.displayName,
      supportedFeatures: processor.supportedFeatures
    }));
  }
}
export {
  BaseLanguageProcessor,
  EnglishProcessor,
  FrenchProcessor,
  GermanProcessor,
  LanguageRegistry,
  SpanishProcessor
};
//# sourceMappingURL=index.js.map
