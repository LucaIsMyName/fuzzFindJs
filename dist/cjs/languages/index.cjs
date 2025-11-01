"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const GermanProcessor = require("./german/GermanProcessor.cjs");
const EnglishProcessor = require("./english/EnglishProcessor.cjs");
const SpanishProcessor = require("./spanish/SpanishProcessor.cjs");
const FrenchProcessor = require("./french/FrenchProcessor.cjs");
class LanguageRegistry {
  static processors = /* @__PURE__ */ new Map([
    ["german", new GermanProcessor.GermanProcessor()],
    ["english", new EnglishProcessor.EnglishProcessor()],
    ["spanish", new SpanishProcessor.SpanishProcessor()],
    ["french", new FrenchProcessor.FrenchProcessor()]
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
exports.GermanProcessor = GermanProcessor.GermanProcessor;
exports.EnglishProcessor = EnglishProcessor.EnglishProcessor;
exports.SpanishProcessor = SpanishProcessor.SpanishProcessor;
exports.FrenchProcessor = FrenchProcessor.FrenchProcessor;
exports.LanguageRegistry = LanguageRegistry;
//# sourceMappingURL=index.cjs.map
