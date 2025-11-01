import type { LanguageProcessor } from "../core/types.js";
/**
 * Registry of all available language processors
 */
export declare class LanguageRegistry {
    private static processors;
    /**
     * Get a language processor by name
     */
    static getProcessor(language: string): LanguageProcessor | undefined;
    /**
     * Get multiple language processors
     */
    static getProcessors(languages: string[]): LanguageProcessor[];
    /**
     * Get all available language names
     */
    static getAvailableLanguages(): string[];
    /**
     * Register a custom language processor
     */
    static registerProcessor(processor: LanguageProcessor): void;
    /**
     * Check if a language is supported
     */
    static isSupported(language: string): boolean;
    /**
     * Get processor info for all languages
     */
    static getProcessorInfo(): Array<{
        language: string;
        displayName: string;
        supportedFeatures: string[];
    }>;
}
export { GermanProcessor } from "./german/GermanProcessor.js";
export { EnglishProcessor } from "./english/EnglishProcessor.js";
export { SpanishProcessor } from "./spanish/SpanishProcessor.js";
export { FrenchProcessor } from "./french/FrenchProcessor.js";
export { BaseLanguageProcessor } from "./base/LanguageProcessor.js";
//# sourceMappingURL=index.d.ts.map