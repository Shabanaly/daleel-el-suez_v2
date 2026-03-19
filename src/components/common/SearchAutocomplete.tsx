'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search, Clock, X, TrendingUp, ArrowRight } from 'lucide-react';
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
    apiEndpoint?: string;
    onSuggestionSelect?: (suggestion: Suggestion) => void;
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
    apiEndpoint = '/api/autocomplete',
    onSuggestionSelect,
}: SearchAutocompleteProps) {
    const [open, setOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Mobile overlay hash management (intercept back button)
    useEffect(() => {
        if (!isMobile) return;
        
        const handleHashChange = () => {
            if (window.location.hash !== '#search' && open) {
                setOpen(false);
                onChange('');
            }
        };

        if (open) {
            if (window.location.hash !== '#search') {
                window.history.pushState(null, '', window.location.pathname + window.location.search + '#search');
            }
            window.addEventListener('hashchange', handleHashChange);
            document.body.style.overflow = 'hidden';
        } else {
            if (window.location.hash === '#search') {
                window.history.back();
            }
            document.body.style.overflow = '';
        }

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
            document.body.style.overflow = '';
        };
    }, [open, isMobile]);

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

    const isOpen = isMobile ? open : ((open && !value.trim() && history.length > 0) || (open && value.trim().length > 0));

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
        fetch(`${apiEndpoint}?q=${encodeURIComponent(debouncedValue)}`)
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
        (item: string | Suggestion) => {
            if (typeof item === 'string') {
                onChange(item);
                saveToHistory(item);
                setHistory(getHistory());
                setOpen(false);
                onSearch(item);
            } else {
                saveToHistory(item.name);
                setHistory(getHistory());
                setOpen(false);
                if (onSuggestionSelect) {
                    onSuggestionSelect(item);
                } else {
                    onChange(item.name);
                    onSearch(item.name);
                }
            }
        },
        [onChange, onSearch, onSuggestionSelect]
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
    const showSuggestions = open && value.trim().length > 0;

    const dropdownContent = (
        <AnimatePresence>
            {isOpen && dropdownRect && (
                <motion.div
                    data-autocomplete-dropdown="true"
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    style={isMobile ? {
                        position: 'fixed',
                        inset: 0,
                        zIndex: 999999
                    } : {
                        position: 'fixed',
                        top: dropdownRect.bottom + 8,
                        left: dropdownRect.left,
                        width: dropdownRect.width,
                        zIndex: 999999
                    }}
                    className={isMobile 
                        ? "bg-background flex flex-col" 
                        : "bg-surface border border-border-subtle rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-y-auto max-h-[60vh]"
                    }
                    dir="rtl"
                >
                    {isMobile && (
                        <div className="flex items-center gap-3 p-3 border-b border-border-subtle bg-surface shadow-sm shrink-0">
                            <button onClick={() => { setOpen(false); onChange(''); }} className="p-2 -mr-2 text-text-muted hover:bg-elevated rounded-full transition-colors">
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <input
                                autoFocus
                                type="text"
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={placeholder}
                                className="flex-1 bg-transparent border-none outline-none text-base font-bold text-text-primary h-10"
                            />
                            {value && (
                                <button onClick={() => onChange('')} className="p-1.5 text-text-muted hover:bg-elevated rounded-full transition-colors">
                                   <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}
                    
                    <div className={isMobile ? "flex-1 overflow-y-auto pt-2" : ""}>
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
                                                className={`p-1 rounded-md hover:bg-border-subtle text-text-muted transition-opacity ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
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
                            ) : suggestions.length > 0 ? (
                                <ul>
                                    {suggestions.map((s) => (
                                        <li key={s.slug}>
                                            <button
                                                type="button"
                                                onClick={() => handleSelect(s)}
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
                            ) : (
                                <div className="px-4 py-6 text-center">
                                    <span className="text-sm font-bold text-text-muted">لا توجد نتائج مطابقة لبحثك</span>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {isMobile && !showHistory && !showSuggestions && (
                        <div className="flex flex-col items-center justify-center h-40 mt-10 text-text-muted/50">
                            <Search className="w-12 h-12 mb-4 opacity-30" />
                            <span className="text-sm font-bold">عن إيه بتبحث النهاردة؟</span>
                        </div>
                    )}

                    </div>

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
