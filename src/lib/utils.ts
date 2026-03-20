import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function addArabicArticle(text: string): string {
    if (!text) return text;
    const trimmed = text.trim();
    if (trimmed.startsWith('ال')) return trimmed;
    // Handle cases where adding "ال" might be redundant or special
    // But for simple categories like "مطاعم" or "أطباء", simple prefixing is standard
    return `ال${trimmed}`;
}
