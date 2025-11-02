"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
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
exports.detectLanguages = detectLanguages;
exports.sampleTextForDetection = sampleTextForDetection;
//# sourceMappingURL=language-detection.cjs.map
