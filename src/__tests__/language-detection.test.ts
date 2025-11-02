import { describe, it, expect } from "vitest";
import { buildFuzzyIndex, getSuggestions } from "../index.js";
import { detectLanguages, detectLanguagesWithConfidence, sampleTextForDetection } from "../utils/language-detection.js";

describe("Feature 11: Language Auto-Detection", () => {
  describe("Detection Heuristics", () => {
    it("should detect German from umlauts", () => {
      const languages = detectLanguages("Müller Köln Zürich");
      expect(languages).toContain("german");
      expect(languages).toContain("english"); // Always includes English
    });

    it("should detect French from accents", () => {
      const languages = detectLanguages("café résumé naïve");
      expect(languages).toContain("french");
      expect(languages).toContain("english");
    });

    it("should detect Spanish from ñ and accents", () => {
      const languages = detectLanguages("niño José mañana");
      expect(languages).toContain("spanish");
      expect(languages).toContain("english");
    });

    it("should detect multiple languages", () => {
      const languages = detectLanguages("Müller café niño hello");
      expect(languages).toContain("german");
      expect(languages).toContain("french");
      expect(languages).toContain("spanish");
      expect(languages).toContain("english");
      expect(languages.length).toBe(4);
    });

    it("should default to English only", () => {
      const languages = detectLanguages("hello world test");
      expect(languages).toEqual(["english"]);
    });

    it("should handle empty text", () => {
      const languages = detectLanguages("");
      expect(languages).toEqual(["english"]);
    });

    it("should handle mixed case", () => {
      const languages = detectLanguages("MÜLLER Café NIÑO");
      expect(languages).toContain("german");
      expect(languages).toContain("french");
      expect(languages).toContain("spanish");
    });
  });

  describe("Confidence Scoring", () => {
    it("should provide confidence scores", () => {
      const result = detectLanguagesWithConfidence("Müller Köln Zürich");
      expect(result.confidence.german).toBeGreaterThan(0.5);
      expect(result.languages).toContain("german");
    });

    it("should identify primary language", () => {
      const result = detectLanguagesWithConfidence("Müller Müller Müller café");
      expect(result.primary).toBe("german"); // More German chars
    });

    it("should handle English-only text", () => {
      const result = detectLanguagesWithConfidence("hello world");
      expect(result.primary).toBe("english");
      expect(result.confidence.english).toBe(0.5);
    });
  });

  describe("Index Building with Auto-Detection", () => {
    it("should auto-detect when no languages specified", () => {
      const index = buildFuzzyIndex(["Müller", "Köln", "Zürich"]);
      
      // Should have detected German
      expect(index.config.languages).toContain("german");
      expect(index.config.languages).toContain("english");
    });

    it("should auto-detect with languages: ['auto']", () => {
      const index = buildFuzzyIndex(["café", "résumé", "naïve"], {
        config: {
          languages: ["auto"],
        },
      });

      expect(index.config.languages).toContain("french");
      expect(index.config.languages).toContain("english");
    });

    it("should detect multiple languages in dataset", () => {
      const index = buildFuzzyIndex(["Müller", "café", "niño", "hello"]);

      expect(index.config.languages).toContain("german");
      expect(index.config.languages).toContain("french");
      expect(index.config.languages).toContain("spanish");
      expect(index.config.languages).toContain("english");
    });

    it("should respect explicit language setting", () => {
      const index = buildFuzzyIndex(["Müller", "café"], {
        config: {
          languages: ["german"], // Explicit - no auto-detection
        },
      });

      expect(index.config.languages).toEqual(["german"]);
      expect(index.config.languages).not.toContain("french");
    });

    it("should work with object arrays", () => {
      const data = [
        { name: "Müller", city: "München" },
        { name: "Dupont", city: "Paris" },
      ];

      const index = buildFuzzyIndex(data, {
        fields: ["name", "city"],
      });

      expect(index.config.languages).toContain("german");
      // May or may not detect French depending on sample
    });
  });

  describe("Text Sampling", () => {
    it("should sample first 100 items by default", () => {
      const words = Array.from({ length: 200 }, (_, i) => `word${i}`);
      const sample = sampleTextForDetection(words);
      
      // Should contain first 100 words
      expect(sample).toContain("word0");
      expect(sample).toContain("word99");
      expect(sample).not.toContain("word150");
    });

    it("should handle small datasets", () => {
      const words = ["Müller", "Köln"];
      const sample = sampleTextForDetection(words);
      
      expect(sample).toContain("Müller");
      expect(sample).toContain("Köln");
    });

    it("should extract text from objects", () => {
      const data = [
        { name: "Müller", city: "München" },
        { name: "Schmidt", city: "Berlin" },
      ];

      const sample = sampleTextForDetection(data);
      expect(sample).toContain("Müller");
      expect(sample).toContain("München");
    });

    it("should handle mixed string and object arrays", () => {
      const data = ["Müller", { name: "café" }, "hello"];
      const sample = sampleTextForDetection(data);
      
      expect(sample).toContain("Müller");
      expect(sample).toContain("café");
      expect(sample).toContain("hello");
    });
  });

  describe("Search Functionality", () => {
    it("should search with auto-detected languages", () => {
      const index = buildFuzzyIndex(["Müller", "Köln", "München"]);
      
      const results = getSuggestions(index, "Muller");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].display).toBe("Müller");
    });

    it("should handle phonetic matching with auto-detected language", () => {
      const index = buildFuzzyIndex(["Schule", "School"], {
        config: {
          features: ["phonetic"],
        },
      });

      const results = getSuggestions(index, "shule");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should work with mixed-language search", () => {
      const index = buildFuzzyIndex(["Müller", "café", "hello"]);

      // German search
      const results1 = getSuggestions(index, "Muller");
      expect(results1.length).toBeGreaterThan(0);

      // French search
      const results2 = getSuggestions(index, "cafe");
      expect(results2.length).toBeGreaterThan(0);

      // English search
      const results3 = getSuggestions(index, "hello");
      expect(results3.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty dataset", () => {
      const index = buildFuzzyIndex([]);
      expect(index.config.languages).toEqual(["english"]);
    });

    it("should handle numbers-only dataset", () => {
      const index = buildFuzzyIndex(["123", "456", "789"]);
      expect(index.config.languages).toEqual(["english"]);
    });

    it("should handle special characters", () => {
      const index = buildFuzzyIndex(["@#$%", "!@#", "***"]);
      expect(index.config.languages).toEqual(["english"]);
    });

    it("should handle very short text", () => {
      const languages = detectLanguages("ü");
      expect(languages).toContain("german");
    });

    it("should handle text with multiple language indicators", () => {
      // Text that could be multiple languages
      const languages = detectLanguages("café Müller niño");
      expect(languages.length).toBeGreaterThan(2);
    });
  });

  describe("Backwards Compatibility", () => {
    it("should not break existing code with explicit languages", () => {
      const index = buildFuzzyIndex(["test"], {
        config: {
          languages: ["english"],
        },
      });

      expect(index.config.languages).toEqual(["english"]);
    });

    it("should work with all existing features", () => {
      const index = buildFuzzyIndex(["Müller", "café"], {
        config: {
          features: ["phonetic", "compound", "synonyms"],
        },
      });

      expect(index.config.languages).toContain("german");
      expect(index.config.languages).toContain("french");
    });

    it("should maintain search quality", () => {
      // With auto-detection
      const index1 = buildFuzzyIndex(["Müller", "Köln"]);
      const results1 = getSuggestions(index1, "Muller");

      // With explicit language
      const index2 = buildFuzzyIndex(["Müller", "Köln"], {
        config: { languages: ["german", "english"] },
      });
      const results2 = getSuggestions(index2, "Muller");

      // Should produce same results
      expect(results1.length).toBe(results2.length);
      expect(results1[0].display).toBe(results2[0].display);
    });
  });

  describe("Performance", () => {
    it("should not significantly slow down index building", () => {
      const words = Array.from({ length: 1000 }, (_, i) => `word${i}`);

      const start = performance.now();
      buildFuzzyIndex(words);
      const time = performance.now() - start;

      expect(time).toBeLessThan(200); // Should be fast
    });

    it("should only sample first 100 words", () => {
      const words = Array.from({ length: 10000 }, (_, i) => `Müller${i}`);

      const start = performance.now();
      const sample = sampleTextForDetection(words, 100);
      const time = performance.now() - start;

      expect(time).toBeLessThan(10); // Very fast sampling
      expect(sample.split(" ").length).toBeLessThanOrEqual(100);
    });
  });

  describe("Real-World Examples", () => {
    it("should detect German healthcare terms", () => {
      const index = buildFuzzyIndex([
        "Hausärzte",      // Has umlaut
        "Hautärzte",      // Has umlaut
        "Krankenhäuser",  // Has umlaut
        "Apotheke",
      ]);

      expect(index.config.languages).toContain("german");
    });

    it("should detect French cuisine terms", () => {
      const index = buildFuzzyIndex([
        "café",
        "crème brûlée",
        "résumé",
        "château",
      ]);

      expect(index.config.languages).toContain("french");
    });

    it("should detect Spanish names", () => {
      const index = buildFuzzyIndex([
        "José",
        "María",
        "Señor",
        "Niño",
      ]);

      expect(index.config.languages).toContain("spanish");
    });

    it("should handle international company names", () => {
      const index = buildFuzzyIndex([
        "Müller GmbH",
        "Café de Paris",
        "José & Sons",
        "Smith Corp",
      ]);

      expect(index.config.languages).toContain("german");
      expect(index.config.languages).toContain("french");
      expect(index.config.languages).toContain("spanish");
      expect(index.config.languages).toContain("english");
    });
  });
});
