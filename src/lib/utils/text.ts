/**
 * Utility functions for Arabic text normalization
 */

/**
 * Normalizes Arabic text to improve search matching:
 * 1. Removes diacritics (Tashkeel)
 * 2. Normalizes Alef forms (أ, إ, آ, ا) to plain Alef (ا)
 * 3. Normalizes Yeh forms (ي, ى) to Yeh (ي)
 * 4. Normalizes Teh Marbuta (ة) to Heh (ه)
 * 5. Normalizes Waw forms (ؤ, و) to Waw (و)
 * 6. Converts to lowercase (for English characters mixed in)
 */
export function normalizeArabicText(text: string): string {
    if (!text) return '';

    return text
        // Convert to lowercase first (handles English text)
        .toLowerCase()
        // Remove diacritics (Tashkeel)
        .replace(/[\u064B-\u065F]/g, '')
        // Normalize Alef
        .replace(/[أإآ]/g, 'ا')
        // Normalize Yeh
        .replace(/ى/g, 'ي')
        // Normalize Teh Marbuta to Heh
        .replace(/ة/g, 'ه')
        // Normalize Waw with Hamza
        .replace(/ؤ/g, 'و')
        // Normalize Yeh with Hamza
        .replace(/ئ/g, 'ي')
        // Remove extra spaces
        .trim();
}

/**
 * Checks if search text is part of target text, ignoring Arabic specifics
 */
export function fuzzyMatchArabic(target: string, search: string): boolean {
    if (!target || !search) return false;

    const normalizedTarget = normalizeArabicText(target);
    const normalizedSearch = normalizeArabicText(search);

    return normalizedTarget.includes(normalizedSearch);
}
