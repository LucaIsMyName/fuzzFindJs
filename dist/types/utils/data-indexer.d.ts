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
    splitOn?: 'word' | 'sentence' | 'paragraph';
    /** Data format (default: 'string') */
    format?: 'string' | 'html' | 'json' | 'base64' | 'url';
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
export declare function dataToIndex(content: string, options?: DataToIndexOptions): string[];
/**
 * Async version for URL fetching
 * @param content - URL or content string
 * @param options - Configuration options
 * @returns Promise<string[]> Array of unique words
 */
export declare function dataToIndexAsync(content: string, options?: DataToIndexOptions): Promise<string[]>;
//# sourceMappingURL=data-indexer.d.ts.map