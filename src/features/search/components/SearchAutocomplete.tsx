'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { Search, Clock, X, TrendingUp, ChevronRight, MapPin, ShoppingBag, LayoutGrid, type LucideIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { SafeImage } from '@/components/common/SafeImage';
import { API_ENDPOINTS } from '@/constants/api';

// HISTORY_KEY removed — segmented key via historyKey useMemo is used instead
const MAX_HISTORY = 6;

export interface Suggestion {
    name: string;
    slug: string;
    icon: string;
    type?: 'place' | 'ad' | 'category';
    image?: string | null;
    url: string;
    meta?: string | null;
}

interface SearchAutocompleteProps {
    value: string;
    onChange: (v: string) => void;
    onSearch: (term: string) => void;
    placeholder?: string;
    inputClassName?: string;
    apiEndpoint?: string;
    onSuggestionSelect?: (suggestion: Suggestion) => void;
    searchType?: 'market' | 'places' | 'default';
}

/* ── Highlight Match Component ─────────────────────────── */
const HighlightMatch = ({ text, match }: { text: string; match: string }) => {
    if (!match.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${match})`, 'gi'));
    return (
        <span>
            {parts.map((part, i) =>
                part.toLowerCase() === match.toLowerCase() ? (
                    <span key={i} className="text-primary font-bold">{part}</span>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </span>
    );
};

/* ── Skeleton Loader Component ─────────────────────────── */
const SearchSkeleton = () => (
    <div className="space-y-4 px-4 py-3 animate-pulse">
        {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-elevated-hover rounded-lg" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 bg-elevated-hover rounded w-3/4" />
                    <div className="h-2 bg-elevated-hover rounded w-1/2 opacity-50" />
                </div>
            </div>
        ))}
    </div>
);

const IconRenderer = ({ iconName, className }: { iconName: string, className?: string }) => {
    if (!iconName) return null;
    const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[iconName];
    if (Icon) {
        return <Icon className={className || "w-4 h-4"} />;
    }
    if (iconName.length <= 4) return <span className="text-xl leading-none">{iconName}</span>;
    const DefaultIcon = LucideIcons.HelpCircle;
    return <DefaultIcon className={className || "w-4 h-4"} />;
};

/* ── Result Group Component ─────────────────────────── */
interface ResultGroupProps {
    title: string;
    icon: LucideIcon;
    items: Suggestion[];
    renderItem: (s: Suggestion) => React.ReactNode;
}

const ResultGroup = ({ title, icon: Icon, items, renderItem }: ResultGroupProps) => {
    if (items.length === 0) return null;
    return (
        <div>
            <div className="flex items-center gap-2 px-4 py-1.5">
                <Icon className="w-3.5 h-3.5 text-text-muted" />
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{title}</span>
            </div>
            <ul>{items.map(s => renderItem(s))}</ul>
        </div>
    );
};

/* ── component ─────────────────────────────────────────── */
export default function SearchAutocomplete({
    value,
    onChange,
    onSearch,
    placeholder = 'ابحث عن مكان أو خدمة...',
    inputClassName = '',
    apiEndpoint = API_ENDPOINTS.AUTOCOMPLETE,
    onSuggestionSelect,
    searchType = 'places',
}: SearchAutocompleteProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [history, setHistory] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [displayedResults, setDisplayedResults] = useState(10);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Internal client-side Cache to prevent redundant network requests
    const cacheRef = useRef<Map<string, Suggestion[]>>(new Map());
    const isNavigatingRef = useRef(false);
    const openRef = useRef(open);
    openRef.current = open;
    // Always-fresh ref to onChange — lets us call it inside effects without stale closure
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    // Always-fresh ref to onSearch — used to clear URL when closing without searching
    const onSearchRef = useRef(onSearch);
    onSearchRef.current = onSearch;

    // Segemented History Key based on context (market/places)
    const historyKey = useMemo(() => `daleel_search_history_${searchType}_v3`, [searchType]);

    const getLocalHistory = useCallback((): Suggestion[] => {
        if (typeof window === 'undefined') return [];
        try {
            const raw = localStorage.getItem(historyKey);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch { return []; }
    }, [historyKey]);

    const addToHistory = useCallback((item: Suggestion) => {
        if (!item || !item.name) return;
        const prev = getLocalHistory().filter((h) => h.url !== item.url);
        const next = [item, ...prev].slice(0, MAX_HISTORY);
        localStorage.setItem(historyKey, JSON.stringify(next));
    }, [historyKey, getLocalHistory]);

    const removeFromHistoryLocal = useCallback((url: string) => {
        const next = getLocalHistory().filter((h) => h.url !== url);
        localStorage.setItem(historyKey, JSON.stringify(next));
        setHistory(next);
    }, [historyKey, getLocalHistory]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            // Also update dropdown position on resize (replaces the duplicate listener in Effect 4)
            if (containerRef.current) {
                setDropdownRect(containerRef.current.getBoundingClientRect());
            }
        };
        // Run once immediately on mount
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    useEffect(() => {
        if (!isMobile) return;
        const handleHashChange = () => {
            if (window.location.hash !== '#search' && open) {
                setOpen(false);
            }
        };
        if (open) {
            isNavigatingRef.current = false;
            if (window.location.hash !== '#search') {
                window.history.pushState(null, '', window.location.pathname + window.location.search + '#search');
            }
            window.addEventListener('hashchange', handleHashChange);
            document.body.style.overflow = 'hidden';
        } else {
            if (window.location.hash === '#search' && !isNavigatingRef.current) {
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
    // True while the user is typing but debounce hasn't fired yet — prevents flash of "no results"
    const isDebouncing = value.trim() !== debouncedValue.trim();

    const handleFocus = () => {
        setHistory(getLocalHistory());
        setOpen(true);
    };

    useEffect(() => {
        const handler = (e: MouseEvent | TouchEvent) => {
            const target = e.target as HTMLElement;
            if (!containerRef.current?.contains(target) && !target.closest('[data-autocomplete-dropdown]')) {
                if (openRef.current) {
                    setOpen(false);
                }
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

    const updateDropdownPosition = useCallback(() => {
        if (containerRef.current) {
            setDropdownRect(containerRef.current.getBoundingClientRect());
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            updateDropdownPosition();
            // Only scroll — resize is handled by the unified listener in Effect 1
            window.addEventListener('scroll', updateDropdownPosition, true);
            return () => {
                window.removeEventListener('scroll', updateDropdownPosition, true);
            };
        }
    }, [isOpen, updateDropdownPosition]);

    useEffect(() => {
        const term = debouncedValue.trim();
        if (!term) {
            setSuggestions([]);
            setLoading(false);
            setDisplayedResults(10);
            return;
        }

        // 1. Check local in-memory cache first
        const cacheId = `${searchType}:${term}`;
        if (cacheRef.current.has(cacheId)) {
            setSuggestions(cacheRef.current.get(cacheId)!);
            setDisplayedResults(10);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setDisplayedResults(10); // Reset pagination on new search

        const separator = apiEndpoint.includes('?') ? '&' : '?';
        fetch(`${apiEndpoint}${separator}q=${encodeURIComponent(term)}`)
            .then((r) => r.json())
            .then((data) => {
                if (!cancelled) {
                    setSuggestions(data);
                    // Store in cache
                    cacheRef.current.set(cacheId, data);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [debouncedValue, apiEndpoint, searchType]);

    const handleSelect = useCallback(
        (item: Suggestion) => {
            isNavigatingRef.current = true; // Mark that we are navigating
            addToHistory(item);
            setHistory(getLocalHistory());
            setOpen(false);

            if (onSuggestionSelect) {
                onSuggestionSelect(item);
            } else if (item.url) {
                router.push(item.url);
                onChange(item.name);
            } else {
                onChange(item.name);
                onSearch(item.name);
            }
        },
        [onChange, onSearch, onSuggestionSelect, router, addToHistory, getLocalHistory]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const term = (e.target as HTMLInputElement).value.trim();
            // Prevent mobile hash navigation from firing history.back() and cancelling the search
            isNavigatingRef.current = true;
            setOpen(false);
            setSuggestions([]); // Prevent dropdown re-opening after Enter
            onSearch(term);
        }
        if (e.key === 'Escape') {
            setOpen(false);
            setSuggestions([]);
            onChange('');
            onSearch(''); // clears ?q= from URL
        }
    };

    const handleRemoveHistory = (url: string, e: React.MouseEvent) => {
        e.stopPropagation();
        removeFromHistoryLocal(url);
    };

    const showHistory = open && !value.trim() && history.length > 0;
    const showSuggestions = open && value.trim().length > 0;

    // Use sliced mapping for pagination
    const visibleSuggestions = useMemo(() => suggestions.slice(0, displayedResults), [suggestions, displayedResults]);

    const groupedResults = useMemo(() => {
        return {
            categories: visibleSuggestions.filter(s => s.type === 'category'),
            places: visibleSuggestions.filter(s => s.type === 'place'),
            ads: visibleSuggestions.filter(s => s.type === 'ad'),
        };
    }, [visibleSuggestions]);

    const renderItem = (s: Suggestion, isHistory = false) => (
        <li key={s.url + (isHistory ? '-hist' : '')} className="flex items-stretch group">
            <button
                type="button"
                onClick={() => handleSelect(s)}
                className="flex-1 flex items-center gap-3 px-4 py-2.5 text-right hover:bg-elevated transition-all relative overflow-hidden"
            >
                <div className="flex shrink-0 w-10 h-10 items-center justify-center rounded-xl bg-elevated-hover overflow-hidden border border-border-subtle/50 group-hover:border-primary/30 transition-colors">
                    {s.type !== 'category' && s.image ? (
                        <SafeImage
                            src={s.image}
                            alt={s.name}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-300"
                            fallback={<IconRenderer iconName={s.icon} className="w-5 h-5 text-text-muted" />}
                        />
                    ) : (
                        <IconRenderer iconName={s.icon} className="w-5 h-5 text-text-muted transition-transform group-hover:scale-110" />
                    )}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-bold text-text-primary truncate">
                        <HighlightMatch text={s.name} match={value} />
                    </span>
                    {s.meta && (
                        <span className="text-[11px] text-text-muted/80 font-medium flex items-center gap-1">
                            {s.type === 'place' && <MapPin className="w-2.5 h-2.5" />}
                            {s.type === 'ad' && <ShoppingBag className="w-2.5 h-2.5" />}
                            {s.type === 'category' && <LayoutGrid className="w-2.5 h-2.5" />}
                            {s.meta}
                        </span>
                    )}
                </div>
                {!isHistory && (
                    <ChevronRight className="w-3.5 h-3.5 text-text-muted opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all ltr:rotate-0 rtl:rotate-180" />
                )}
            </button>
            {isHistory && (
                <button
                    type="button"
                    onClick={(e) => handleRemoveHistory(s.url, e)}
                    className={`px-3 rounded-lg hover:bg-danger/10 hover:text-danger text-text-muted transition-all ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </li>
    );

    const dropdownContent = (
        <AnimatePresence>
            {isOpen && dropdownRect && (
                <motion.div
                    data-autocomplete-dropdown="true"
                    initial={{ opacity: 0, scale: 0.95, y: isMobile ? 20 : -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: isMobile ? 20 : -10 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    style={isMobile ? {
                        position: 'fixed',
                        inset: 0,
                        zIndex: 999999
                    } : {
                        position: 'fixed',
                        top: dropdownRect.bottom + 4,
                        left: dropdownRect.left,
                        width: dropdownRect.width,
                        zIndex: 999999
                    }}
                    className={isMobile
                        ? "bg-background flex flex-col"
                        : "bg-surface border border-border-subtle rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[70vh]"
                    }
                    dir="rtl"
                >
                    {isMobile && (
                        <div className="flex flex-col border-b border-border-subtle bg-surface/80 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-3 p-4">
                                <button onClick={() => { setOpen(false); onChange(''); }} className="p-2 -mr-1 text-text-muted hover:bg-elevated rounded-xl transition-colors">
                                    <ChevronRight className="w-6 h-6 rtl:rotate-0 ltr:rotate-180" />
                                </button>
                                <input
                                    autoFocus
                                    type="text"
                                    enterKeyHint="search"
                                    value={value}
                                    onChange={(e) => onChange(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={placeholder}
                                    className="flex-1 bg-transparent border-none outline-none text-lg font-bold text-text-primary h-10"
                                />
                                {value && (
                                    <button onClick={() => onChange('')} className="p-2 text-text-muted hover:bg-elevated rounded-xl transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                        {showHistory && (
                            <section>
                                <div className="flex items-center justify-between px-4 pt-2 pb-1">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-text-muted" />
                                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">عمليات البحث الأخيرة</span>
                                    </div>
                                    <button
                                        onClick={() => { localStorage.removeItem(historyKey); setHistory([]); }}
                                        className="text-[10px] font-bold text-primary hover:underline"
                                    >
                                        مسح الكل
                                    </button>
                                </div>
                                <ul>{history.map(s => renderItem(s, true))}</ul>
                                <div className="h-2 border-b border-border-subtle/50 mb-2 mx-4" />
                            </section>
                        )}

                        {showSuggestions && (
                            <>
                                {(loading || isDebouncing) && <SearchSkeleton />}

                                {!loading && suggestions.length > 0 && (
                                    <div className="space-y-4">
                                        <ResultGroup
                                            title="الأقسام"
                                            icon={LayoutGrid}
                                            items={groupedResults.categories}
                                            renderItem={renderItem}
                                        />
                                        <ResultGroup
                                            title="الأماكن"
                                            icon={MapPin}
                                            items={groupedResults.places}
                                            renderItem={renderItem}
                                        />
                                        <ResultGroup
                                            title="السوق"
                                            icon={ShoppingBag}
                                            items={groupedResults.ads}
                                            renderItem={renderItem}
                                        />

                                        {/* Load More Button */}
                                        {displayedResults < suggestions.length && (
                                            <div className="px-4 py-2 border-t border-border-subtle/50">
                                                <button
                                                    onClick={() => setDisplayedResults(prev => prev + 10)}
                                                    className="w-full py-2.5 text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors border border-primary/20"
                                                >
                                                    عرض المزيد من النتائج
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!loading && !isDebouncing && suggestions.length === 0 && debouncedValue.trim() && (
                                    <div className="px-4 py-8 text-center flex flex-col items-center gap-3">
                                        <div className="p-4 bg-elevated-hover rounded-full">
                                            <Search className="w-8 h-8 text-text-muted opacity-20" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-text-primary">لا توجد نتائج مطابقة</p>
                                            <p className="text-xs text-text-muted">جرب البحث بكلمات أخرى أو تحقق من الإملاء</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {!showSuggestions && !showHistory && !loading && (
                            <div className="px-4 py-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-bold text-text-primary">مشهور الآن في السويس</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {['مطاعم', 'كافيهات', 'صيدليات', 'عقارات', 'سيارات'].map(trend => (
                                        <button
                                            key={trend}
                                            onClick={() => { onChange(trend); onSearch(trend); }}
                                            className="px-3 py-1.5 bg-elevated-hover hover:bg-primary/10 hover:text-primary rounded-xl text-xs font-bold transition-all"
                                        >
                                            {trend}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {!isMobile && (
                        <div className="p-3 border-t border-border-subtle bg-elevated/30 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-[10px] font-bold text-text-muted uppercase">
                                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-surface border border-border-subtle rounded shadow-sm">Enter</kbd> للبحث</span>
                                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-surface border border-border-subtle rounded shadow-sm">Esc</kbd> للإغلاق</span>
                            </div>
                            <div className="text-[10px] font-bold text-primary flex items-center gap-1">
                                دليلك الأول في السويس <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div ref={containerRef} className="relative w-full h-full rounded-2xl">
            <input
                type="text"
                enterKeyHint="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                autoComplete="off"
                className={`block leading-none transition-all focus:ring-2 focus:ring-primary/20 rounded-[inherit] ${inputClassName}`}
                dir="rtl"
            />
            {/* Clear Button */}
            {value && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onChange('');
                        onSearch('');
                        setOpen(false);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-colors z-100"
                    aria-label="مسح البحث"
                >
                    <X className="w-5 h-5" />
                </button>
            )}
            {typeof window !== 'undefined' && createPortal(dropdownContent, document.body)}
        </div>
    );
}
