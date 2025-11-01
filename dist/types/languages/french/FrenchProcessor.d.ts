import { BaseLanguageProcessor } from "../base/LanguageProcessor.js";
import type { FuzzyFeature } from "../../core/types.js";
/**
 * French language processor with specialized features:
 * - Accent normalization (à, é, è, ê, ç, etc.)
 * - French phonetic patterns
 * - Common French word endings
 * - French synonym support
 */
export declare class FrenchProcessor extends BaseLanguageProcessor {
    readonly language = "french";
    readonly displayName = "Fran\u00E7ais";
    readonly supportedFeatures: FuzzyFeature[];
    /**
     * French text normalization with accent handling
     */
    normalize(text: string): string;
    /**
     * French phonetic matching
     */
    getPhoneticCode(word: string): string;
    /**
     * French word endings
     */
    protected getCommonEndings(): string[];
    /**
     * French synonyms
     */
    getSynonyms(word: string): string[];
    /**
     * French keyboard layout (AZERTY)
     */
    protected getKeyboardNeighbors(): Record<string, string[]>;
}
//# sourceMappingURL=FrenchProcessor.d.ts.map