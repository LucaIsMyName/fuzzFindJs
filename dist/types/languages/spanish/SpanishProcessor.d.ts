import { BaseLanguageProcessor } from "../base/LanguageProcessor.js";
import type { FuzzyFeature } from "../../core/types.js";
/**
 * Spanish language processor with specialized features:
 * - Accent normalization (á, é, í, ó, ú, ñ)
 * - Spanish phonetic patterns
 * - Common Spanish word endings
 * - Spanish synonym support
 */
export declare class SpanishProcessor extends BaseLanguageProcessor {
    readonly language = "spanish";
    readonly displayName = "Espa\u00F1ol";
    readonly supportedFeatures: FuzzyFeature[];
    /**
     * Spanish text normalization with accent handling
     */
    normalize(text: string): string;
    /**
     * Spanish phonetic matching
     */
    getPhoneticCode(word: string): string;
    /**
     * Spanish word endings
     */
    protected getCommonEndings(): string[];
    /**
     * Spanish synonyms
     */
    getSynonyms(word: string): string[];
}
//# sourceMappingURL=SpanishProcessor.d.ts.map