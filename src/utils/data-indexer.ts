/**
 * Data Indexer Utility
 * Extract unique words from various data formats for fuzzy search indexing
 */

export interface DataToIndexOptions {
  /** Minimum word length to include (default: 2) */
  minLength?: number;
  /** Split text into words (default: true) */
  splitWords?: boolean;
  /** Remove stop words (default: false) */
  stopWords?: string[] | false;
  /** Overlap between chunks in characters (default: 0) */
  overlap?: number;
  /** Size of each chunk in characters (default: 0 = no chunking) */
  chunkSize?: number;
  /** Split strategy for chunking (default: 'word') */
  splitOn?: "word" | "sentence" | "paragraph";
  /** Data format (default: 'string') */
  format?: "string" | "html" | "json" | "base64" | "url";
  /** Remove numbers (default: false) */
  removeNumbers?: boolean;
  /** Case sensitive (default: false) */
  caseSensitive?: boolean;
}

/**
 * Extract unique words from various data formats
 * Returns an array of unique words that can be used as a dictionary for fuzzy search
 *
 * @param content - The content to extract words from
 * @param options - Configuration options
 * @returns Array of unique words (no duplicates)
 *
 * @example
 * // Simple text
 * const words = dataToIndex("Hello world! Hello again.");
 * // → ['hello', 'world', 'again']
 *
 * @example
 * // HTML content
 * const words = dataToIndex("<h1>Title</h1><p>Content here</p>", { format: 'html' });
 * // → ['title', 'content', 'here']
 *
 * @example
 * // JSON data
 * const data = [{ name: "John", city: "NYC" }, { name: "Jane", city: "LA" }];
 * const words = dataToIndex(JSON.stringify(data), { format: 'json' });
 * // → ['john', 'nyc', 'jane', 'la']
 */
export function dataToIndex(
  //
  content: string,
  options: DataToIndexOptions = {}
): string[] {
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
    caseSensitive = false,
  } = options;

  let text = content;

  // Step 1: Handle different formats
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
      // URL format requires async, so we'll throw an error
      throw new Error("URL format requires async. Use dataToIndexAsync() instead.");

    case "string":
    default:
      // Already a string, no conversion needed
      break;
  }

  // Step 2: Apply chunking if specified
  if (chunkSize > 0) {
    const chunks = chunkText(text, chunkSize, overlap, splitOn);
    text = chunks.join(" ");
  }

  // Step 3: Extract words
  let words: string[] = [];

  if (splitWords) {
    // Split on whitespace and punctuation
    words = text.split(/[\s\-_.,;:!?()[\]{}'"\/\\]+/).filter((word) => word.length > 0);
  } else {
    words = [text];
  }

  // Step 4: Clean and filter words
  words = words
    .map((word) => {
      // Remove leading/trailing punctuation (but preserve unicode letters)
      word = word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");

      // Convert case
      if (!caseSensitive) {
        word = word.toLowerCase();
      }

      return word;
    })
    .filter((word) => {
      // Filter by minimum length
      if (word.length < minLength) return false;

      // Filter numbers if requested
      if (removeNumbers && /^\d+$/.test(word)) return false;

      return true;
    });

  // Step 5: Remove stop words if specified
  if (stopWords && Array.isArray(stopWords)) {
    const stopWordsSet = new Set(stopWords.map((w) => w.toLowerCase()));
    words = words.filter((word) => !stopWordsSet.has(word.toLowerCase()));
  }

  // Step 6: Remove duplicates and return
  return Array.from(new Set(words));
}

/**
 * Strip HTML tags and extract text content
 */
function stripHTML(html: string): string {
  // Remove script and style tags with their content
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ");
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, " ");

  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");

  // Normalize whitespace
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

/**
 * Extract string values from JSON
 */
function extractFromJSON(jsonString: string): string {
  try {
    const data = JSON.parse(jsonString);
    const values: string[] = [];

    function extractValues(obj: any, depth: number = 0): void {
      // Limit recursion depth to prevent stack overflow
      if (depth > 10) return;

      if (typeof obj === "string") {
        values.push(obj);
      } else if (Array.isArray(obj)) {
        obj.forEach((item) => extractValues(item, depth + 1));
      } else if (typeof obj === "object" && obj !== null) {
        Object.values(obj).forEach((value) => extractValues(value, depth + 1));
      }
    }

    extractValues(data);
    return values.join(" ");
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    return "";
  }
}

/**
 * Chunk text into smaller pieces
 */
function chunkText(
  //
  text: string,
  chunkSize: number,
  overlap: number,
  splitOn: "word" | "sentence" | "paragraph"
): string[] {
  const chunks: string[] = [];

  if (splitOn === "paragraph") {
    // Split on double newlines
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
    // Split on sentence boundaries
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
    // Split on words (default)
    const words = text.split(/\s+/);
    let currentChunk = "";

    for (const word of words) {
      if ((currentChunk + " " + word).length <= chunkSize) {
        currentChunk += (currentChunk ? " " : "") + word;
      } else {
        if (currentChunk) chunks.push(currentChunk);

        // Add overlap
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

/**
 * Async version for URL fetching
 * @param content - URL or content string
 * @param options - Configuration options
 * @returns Promise<string[]> Array of unique words
 */
export async function dataToIndexAsync(
  //
  content: string,
  options: DataToIndexOptions = {}
): Promise<string[]> {
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
