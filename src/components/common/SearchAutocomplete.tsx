'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search, Clock, X, TrendingUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useDebounce } from '@/lib/hooks/useDebounce';

const HISTORY_KEY = 'daleel_search_history';
const MAX_HISTORY = 5;

interface Suggestion {
    name: string;
    slug: string;
    icon: string;
}

interface SearchAutocompleteProps {
    value: string;
    onChange: (v: string) => void;
    onSearch: (term: string) => void;
    placeholder?: string;
    inputClassName?: string;
}

const IconRenderer = ({ iconName, className }: { iconName: string, className?: string }) => {
    if (!iconName) return null;
    const Icon = (LucideIcons as any)[iconName];
    if (Icon) {
        return <Icon className={className || "w-4 h-4"} />;
    }
    // Fallback to emoji if string is short
    if (iconName.length <= 4) return <span className="text-xl leading-none">{iconName}</span>;
    // Default fallback
    const DefaultIcon = LucideIcons.HelpCircle;
    return <DefaultIcon className={className || "w-4 h-4"} />;
};

/* ── helpers for localStorage history ─────────────────── */
function getHistory(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
    } catch {
        return [];
    }
}

function saveToHistory(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    const prev = getHistory().filter((h) => h !== trimmed);
    const next = [trimmed, ...prev].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

function removeFromHistory(term: string) {
    const next = getHistory().filter((h) => h !== term);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

/* ── component ─────────────────────────────────────────── */
export default function SearchAutocomplete({
    value,
    onChange,
    onSearch,
    placeholder = 'ابحث...',
    inputClassName = '',
}: SearchAutocompleteProps) {
    const [open, setOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    const debouncedValue = useDebounce(value, 300);

    /* load history on focus */
    const handleFocus = () => {
        setHistory(getHistory());
        setOpen(true);
    };

    /* close on outside click */
    useEffect(() => {
        const handler = (e: MouseEvent | TouchEvent) => {
            // Also need to check if click is inside the portal dropdown
            // To simplify, if it's outside the container AND outside any portal element (which we can identify by a specific ID or class)
            // But usually, clicking a suggestion triggers handleSelect which closes it anyway.
            // Let's just use the containerRef and a specific data attribute for the dropdown
            const target = e.target as HTMLElement;
            if (!containerRef.current?.contains(target) && !target.closest('[data-autocomplete-dropdown]')) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        document.addEventListener('touchstart', handler);
        return () => {
            document.removeEventListener('mousedown', handler);
            document.removeEventListener('touchstart', handler);
        };
    }, []);

    const isOpen = (open && !value.trim() && history.length > 0) || (open && value.trim().length > 0 && (suggestions.length > 0 || loading));

    /* position update for portal */
    const updateDropdownPosition = useCallback(() => {
        if (containerRef.current) {
            setDropdownRect(containerRef.current.getBoundingClientRect());
            setIsMobile(window.innerWidth < 768);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            updateDropdownPosition();
            window.addEventListener('scroll', updateDropdownPosition, true);
            window.addEventListener('resize', updateDropdownPosition);
            return () => {
                window.removeEventListener('scroll', updateDropdownPosition, true);
                window.removeEventListener('resize', updateDropdownPosition);
            };
        }
    }, [isOpen, updateDropdownPosition]);


    /* fetch suggestions when debounced value changes */
    useEffect(() => {
        if (!debouncedValue.trim()) {
            setSuggestions([]);
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        fetch(`/api/autocomplete?q=${encodeURIComponent(debouncedValue)}`)
            .then((r) => r.json())
            .then((data) => {
                if (!cancelled) {
                    setSuggestions(data);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [debouncedValue]);

    /* when user picks an item */
    const handleSelect = useCallback(
        (term: string) => {
            onChange(term);
            saveToHistory(term);
            setHistory(getHistory());
            setOpen(false);
            onSearch(term);
        },
        [onChange, onSearch]
    );

    /* keyboard: Enter */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveToHistory(value);
            setOpen(false);
            onSearch(value);
        }
        if (e.key === 'Escape') setOpen(false);
    };

    const handleRemoveHistory = (term: string, e: React.MouseEvent) => {
        e.stopPropagation();
        removeFromHistory(term);
        setHistory(getHistory());
    };

    const showHistory = open && !value.trim() && history.length > 0;
    const showSuggestions = open && value.trim().length > 0 && (suggestions.length > 0 || loading);

    const dropdownContent = (
        <AnimatePresence>
            {isOpen && dropdownRect && (
                <motion.div
                    data-autocomplete-dropdown="true"
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    style={{
                        position: 'fixed',
                        top: dropdownRect.bottom + 8,
                        left: isMobile ? 16 : dropdownRect.left,
                        width: isMobile ? 'calc(100vw - 32px)' : dropdownRect.width,
                        zIndex: 999999
                    }}
                    className="bg-surface border border-border-subtle rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-y-auto max-h-[60vh]"
                    dir="rtl"
                >
                    {/* ── History Section ── */}
                    {showHistory && (
                        <div>
                            <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                                <Clock className="w-3.5 h-3.5 text-text-muted" />
                                <span className="text-xs font-bold text-text-muted tracking-wide">عمليات البحث الأخيرة</span>
                            </div>
                            <ul>
                                {history.map((term) => (
                                    <li key={term}>
                                        <button
                                            type="button"
                                            onClick={() => handleSelect(term)}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-right hover:bg-elevated transition-colors group"
                                        >
                                            <Search className="w-4 h-4 text-text-muted shrink-0" />
                                            <span className="flex-1 text-sm font-semibold text-text-primary">{term}</span>
                                            <span
                                                role="button"
                                                onClick={(e) => handleRemoveHistory(term, e)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-border-subtle text-text-muted"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* ── Suggestions Section ── */}
                    {showSuggestions && (
                        <div>
                            <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                                <span className="text-xs font-bold text-text-muted tracking-wide">اقتراحات</span>
                            </div>

                            {loading ? (
                                <div className="flex items-center gap-2 px-4 py-3">
                                    <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                    <span className="text-sm text-text-muted">جاري البحث...</span>
                                </div>
                            ) : (
                                <ul>
                                    {suggestions.map((s) => (
                                        <li key={s.slug}>
                                            <button
                                                type="button"
                                                onClick={() => handleSelect(s.name)}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-right hover:bg-elevated transition-colors"
                                            >
                                                <span className="flex shrink-0 w-6 items-center justify-center text-text-secondary">
                                                    <IconRenderer iconName={s.icon} className="w-4 h-4" />
                                                </span>
                                                <span className="flex-1 text-sm font-semibold text-text-primary">{s.name}</span>
                                                <Search className="w-3.5 h-3.5 text-text-muted shrink-0 opacity-50" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    {/* bottom padding */}
                    <div className="h-2" />
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div ref={containerRef} className="relative w-full h-full">
            {/* Input */}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                autoComplete="off"
                className={`block leading-none ${inputClassName}`}
                dir="rtl"
            />

            {/* Dropdown Portal */}
            {typeof window !== 'undefined' && createPortal(dropdownContent, document.body)}
        </div>
    );
}
