function dataToIndex(content, options = {}) {
  const {
    //
    minLength = 2,
    splitWords = true,
    stopWords = false,
    overlap = 0,
    chunkSize = 0,
    splitOn = "word",
    format = "string",
    removeNumbers = false,
    caseSensitive = false
  } = options;
  let text = content;
  switch (format) {
    case "base64":
      try {
        text = atob(content);
      } catch (e) {
        console.error("Failed to decode base64:", e);
        return [];
      }
      break;
    case "html":
      text = stripHTML(content);
      break;
    case "json":
      text = extractFromJSON(content);
      break;
    case "url":
      throw new Error("URL format requires async. Use dataToIndexAsync() instead.");
  }
  if (chunkSize > 0) {
    const chunks = chunkText(text, chunkSize, overlap, splitOn);
    text = chunks.join(" ");
  }
  let words = [];
  if (splitWords) {
    words = text.split(/[\s\-_.,;:!?()[\]{}'"\/\\]+/).filter((word) => word.length > 0);
  } else {
    words = [text];
  }
  words = words.map((word) => {
    word = word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
    if (!caseSensitive) {
      word = word.toLowerCase();
    }
    return word;
  }).filter((word) => {
    if (word.length < minLength) return false;
    if (removeNumbers && /^\d+$/.test(word)) return false;
    return true;
  });
  if (stopWords && Array.isArray(stopWords)) {
    const stopWordsSet = new Set(stopWords.map((w) => w.toLowerCase()));
    words = words.filter((word) => !stopWordsSet.has(word.toLowerCase()));
  }
  return Array.from(new Set(words));
}
function stripHTML(html) {
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ");
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");
  text = text.replace(/<!--[\s\S]*?-->/g, " ");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
  text = text.replace(/\s+/g, " ").trim();
  return text;
}
function extractFromJSON(jsonString) {
  try {
    let extractValues = function(obj, depth = 0) {
      if (depth > 10) return;
      if (typeof obj === "string") {
        values.push(obj);
      } else if (Array.isArray(obj)) {
        obj.forEach((item) => extractValues(item, depth + 1));
      } else if (typeof obj === "object" && obj !== null) {
        Object.values(obj).forEach((value) => extractValues(value, depth + 1));
      }
    };
    const data = JSON.parse(jsonString);
    const values = [];
    extractValues(data);
    return values.join(" ");
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    return "";
  }
}
function chunkText(text, chunkSize, overlap, splitOn) {
  const chunks = [];
  if (splitOn === "paragraph") {
    const paragraphs = text.split(/\n\n+/);
    let currentChunk = "";
    for (const para of paragraphs) {
      if ((currentChunk + para).length <= chunkSize) {
        currentChunk += (currentChunk ? "\n\n" : "") + para;
      } else {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = para;
      }
    }
    if (currentChunk) chunks.push(currentChunk);
  } else if (splitOn === "sentence") {
    const sentences = text.split(/[.!?]+\s+/);
    let currentChunk = "";
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= chunkSize) {
        currentChunk += (currentChunk ? " " : "") + sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = sentence;
      }
    }
    if (currentChunk) chunks.push(currentChunk);
  } else {
    const words = text.split(/\s+/);
    let currentChunk = "";
    for (const word of words) {
      if ((currentChunk + " " + word).length <= chunkSize) {
        currentChunk += (currentChunk ? " " : "") + word;
      } else {
        if (currentChunk) chunks.push(currentChunk);
        if (overlap > 0 && currentChunk) {
          const overlapWords = currentChunk.split(/\s+/).slice(-Math.ceil(overlap / 10));
          currentChunk = overlapWords.join(" ") + " " + word;
        } else {
          currentChunk = word;
        }
      }
    }
    if (currentChunk) chunks.push(currentChunk);
  }
  return chunks;
}
async function dataToIndexAsync(content, options = {}) {
  const { format = "string" } = options;
  if (format === "url") {
    try {
      const response = await fetch(content);
      const html = await response.text();
      return dataToIndex(html, { ...options, format: "html" });
    } catch (e) {
      console.error("Failed to fetch URL:", e);
      return [];
    }
  }
  return dataToIndex(content, options);
}
export {
  dataToIndex,
  dataToIndexAsync
};
//# sourceMappingURL=data-indexer.js.map
