// Text utility functions

/**
 * Truncate text to a specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Capitalize the first letter of a string
 */
export function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert text to title case
 */
export function toTitleCase(text: string): string {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Remove extra whitespace and normalize text
 */
export function normalizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Extract words from text for search/filtering
 */
export function extractWords(text: string): string[] {
  return normalizeText(text.toLowerCase())
    .split(' ')
    .filter(word => word.length > 0);
}

/**
 * Check if text contains search term (case-insensitive)
 */
export function containsSearchTerm(text: string, searchTerm: string): boolean {
  if (!searchTerm.trim()) return true;
  
  const normalizedText = text.toLowerCase();
  const normalizedSearch = searchTerm.toLowerCase().trim();
  
  return normalizedText.includes(normalizedSearch);
}

/**
 * Highlight search terms in text (returns array of text segments)
 */
export function highlightSearchTerm(text: string, searchTerm: string): Array<{text: string, highlighted: boolean}> {
  if (!searchTerm.trim()) {
    return [{ text, highlighted: false }];
  }
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => ({
    text: part,
    highlighted: index % 2 === 1
  }));
}

/**
 * Generate a slug from text (for IDs, URLs, etc.)
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Format prayer text with proper line breaks and indentation
 */
export function formatPrayerText(text: string): string {
  return text
    .replace(/\n\s*\n/g, '\n\n') // Normalize double line breaks
    .replace(/^\s+|\s+$/g, '') // Trim whitespace
    .replace(/\s+/g, ' ') // Normalize spaces
    .replace(/\. ([A-Z])/g, '.\n\n$1') // Add breaks after sentences starting with capitals
    .replace(/Amen\./g, '\n\nAmen.');
}

/**
 * Extract Bible references from text
 */
export function extractBibleReferences(text: string): string[] {
  const bibleBookPattern = /(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song of Songs|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation)\s+\d+(?::\d+)?(?:-\d+(?::\d+)?)?/gi;
  
  return text.match(bibleBookPattern) || [];
}

/**
 * Clean and normalize prayer content for search
 */
export function normalizePrayerContent(content: string): string {
  return content
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

/**
 * Get reading time estimate in minutes
 */
export function getReadingTimeEstimate(text: string, wordsPerMinute: number = 200): number {
  const wordCount = extractWords(text).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Split text into paragraphs
 */
export function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0);
}

/**
 * Format verse references (e.g., "John 3:16" -> "John 3:16")
 */
export function formatVerseReference(reference: string): string {
  return reference
    .replace(/(\d+):(\d+)-(\d+):(\d+)/g, '$1:$2-$3:$4') // Range with chapters
    .replace(/(\d+):(\d+)-(\d+)/g, '$1:$2-$3') // Range within chapter
    .replace(/(\d+):(\d+)/g, '$1:$2') // Single verse
    .trim();
}

/**
 * Create excerpt from text with highlighted search term
 */
export function createExcerpt(text: string, searchTerm: string, maxLength: number = 150): string {
  if (!searchTerm.trim()) {
    return truncateText(text, maxLength);
  }
  
  const normalizedText = text.toLowerCase();
  const normalizedSearch = searchTerm.toLowerCase();
  const index = normalizedText.indexOf(normalizedSearch);
  
  if (index === -1) {
    return truncateText(text, maxLength);
  }
  
  // Try to center the search term in the excerpt
  const start = Math.max(0, index - Math.floor(maxLength / 2));
  const end = Math.min(text.length, start + maxLength);
  
  let excerpt = text.substring(start, end);
  
  // Add ellipsis if needed
  if (start > 0) excerpt = '...' + excerpt;
  if (end < text.length) excerpt = excerpt + '...';
  
  return excerpt;
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return extractWords(text).length;
}

/**
 * Count characters in text (excluding whitespace)
 */
export function countCharacters(text: string, includeSpaces: boolean = false): number {
  if (includeSpaces) {
    return text.length;
  }
  return text.replace(/\s/g, '').length;
}

/**
 * Validate and clean user input text
 */
export function sanitizeUserInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 1000); // Limit length
}