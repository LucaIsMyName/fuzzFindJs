function detectLanguages(text) {
  if (!text || text.trim().length === 0) {
    return ["english"];
  }
  const detected = /* @__PURE__ */ new Set();
  detected.add("english");
  if (/[äöüßÄÖÜ]/.test(text)) {
    detected.add("german");
  }
  if (/[àâäæçéèêëïîôùûüÿœÀÂÄÆÇÉÈÊËÏÎÔÙÛÜŸŒ]/.test(text)) {
    detected.add("french");
  }
  if (/[áéíóúñüÁÉÍÓÚÑÜ¿¡]/.test(text)) {
    detected.add("spanish");
  }
  return Array.from(detected);
}
function detectLanguagesWithConfidence(text) {
  if (!text || text.trim().length === 0) {
    return {
      languages: ["english"],
      confidence: { english: 1 },
      primary: "english"
    };
  }
  const confidence = {
    english: 0.5
    // Base confidence for English
  };
  const textLength = text.length;
  const germanChars = (text.match(/[äöüßÄÖÜ]/g) || []).length;
  if (germanChars > 0) {
    confidence.german = Math.min(1, 0.5 + germanChars / textLength * 10);
  }
  const frenchChars = (text.match(/[àâäæçéèêëïîôùûüÿœÀÂÄÆÇÉÈÊËÏÎÔÙÛÜŸŒ]/g) || []).length;
  if (frenchChars > 0) {
    confidence.french = Math.min(1, 0.5 + frenchChars / textLength * 10);
  }
  const spanishChars = (text.match(/[áéíóúñüÁÉÍÓÚÑÜ¿¡]/g) || []).length;
  if (spanishChars > 0) {
    confidence.spanish = Math.min(1, 0.5 + spanishChars / textLength * 10);
  }
  const languages = Object.entries(confidence).filter(([_, conf]) => conf >= 0.5).map(([lang]) => lang);
  const primary = Object.entries(confidence).sort(([, a], [, b]) => b - a)[0][0];
  return {
    languages,
    confidence,
    primary
  };
}
function sampleTextForDetection(words, sampleSize = 100) {
  const sample = words.slice(0, Math.min(sampleSize, words.length));
  return sample.map((item) => {
    if (typeof item === "string") {
      return item;
    } else if (typeof item === "object" && item !== null) {
      return Object.values(item).filter((v) => typeof v === "string").join(" ");
    }
    return "";
  }).join(" ");
}
function isValidLanguage(lang) {
  const validLanguages = ["english", "german", "french", "spanish", "auto"];
  return validLanguages.includes(lang.toLowerCase());
}
function normalizeLanguageCode(lang) {
  const normalized = lang.toLowerCase().trim();
  const aliases = {
    "en": "english",
    "de": "german",
    "fr": "french",
    "es": "spanish",
    "eng": "english",
    "deu": "german",
    "fra": "french",
    "esp": "spanish"
  };
  return aliases[normalized] || normalized;
}
export {
  detectLanguages,
  detectLanguagesWithConfidence,
  isValidLanguage,
  normalizeLanguageCode,
  sampleTextForDetection
};
//# sourceMappingURL=language-detection.js.map
