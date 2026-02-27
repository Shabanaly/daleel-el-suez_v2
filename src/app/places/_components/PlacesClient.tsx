'use client';

import { Search, SlidersHorizontal, X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Place } from '@/lib/types/places';
import { SORT_OPTIONS } from '@/lib/data/places';
import { usePlacesFilter } from '@/hooks/usePlacesFilter';
import { PlaceCard } from './PlaceCard';

interface PlacesClientProps {
    initialPlaces: Place[];
    categories: string[];
    areas: string[];
}

export function PlacesClient({ initialPlaces, categories, areas }: PlacesClientProps) {
    // 🧠 Here we use our custom hook. All logic is encapsulated inside it!
    const {
        query, setQuery,
        activeCategory, setActiveCategory,
        activeArea, setActiveArea,
        sortBy, setSortBy,
        showFilters, setShowFilters,
        filtered, hasActiveFilters, clearFilters
    } = usePlacesFilter(initialPlaces, categories, areas);

    return (
        <div className="w-full min-h-screen pt-20 md:pt-28 pb-10">

            {/* ── Page Header ──────────────────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-4 mb-6 md:mb-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col md:flex-row md:items-center gap-4 md:gap-5"
                >
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary-600/10 dark:bg-primary-600/20 flex items-center justify-center border border-primary-500/30 shadow-[0_0_20px_rgba(8,145,178,0.2)] dark:shadow-[0_0_30px_rgba(8,145,178,0.3)] shrink-0">
                        <MapPin className="w-8 h-8 md:w-10 md:h-10 text-primary-500 drop-shadow-[0_0_8px_rgba(8,124,247,0.4)]" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black text-text-primary mb-1 md:mb-2 tracking-tight">
                            استعرض الأماكن
                        </h1>
                        <p className="text-text-muted md:text-lg font-medium opacity-80">
                            اكتشف أفضل الأماكن والأنشطة في مدينة السويس
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* ── Search & Filter Bar ──────────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-4 mb-6 md:mb-10">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex flex-col gap-4"
                >
                    <div className="flex gap-2.5 md:gap-4 items-center">
                        {/* Search Unit */}
                        <div className="relative flex-1 group">
                            <div className="absolute inset-0 bg-primary-500/5 dark:bg-primary-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                            <div className="relative h-14 rounded-2xl glass-panel bg-surface/90 dark:bg-surface/40 border border-border-subtle flex items-center overflow-hidden shadow-lg shadow-black/5 dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] focus-within:border-primary-500/50 transition-all duration-300">
                                <Search className="absolute right-5 w-5 h-5 text-text-muted group-focus-within:text-primary-500 transition-colors pointer-events-none" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder="ابحث عن مكان، تصنيف، أو منطقة..."
                                    className="w-full h-full bg-transparent border-none outline-none text-text-primary placeholder-text-muted/60 pr-14 pl-5 text-[16px] md:text-lg font-medium"
                                />
                                {query && (
                                    <button
                                        onClick={() => setQuery('')}
                                        className="absolute left-4 w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-elevated/50 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filter toggle */}
                        <button
                            onClick={() => setShowFilters(v => !v)}
                            className={`relative h-14 w-14 rounded-2xl flex items-center justify-center border transition-all duration-300 shrink-0 shadow-lg ${showFilters || hasActiveFilters
                                ? 'bg-primary-600 text-white border-primary-500 shadow-primary-500/25'
                                : 'glass-panel bg-surface/90 dark:bg-surface/40 border-border-subtle text-text-muted hover:border-primary-500/40 hover:text-text-primary'
                                }`}
                        >
                            <SlidersHorizontal className={`w-5 h-5 transition-transform duration-300 ${showFilters ? 'rotate-90' : ''}`} />
                            {hasActiveFilters && (
                                <span className="absolute -top-1 -left-1 w-4 h-4 bg-accent rounded-full border-2 border-base shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                            )}
                        </button>
                    </div>

                    {/* ── Category Chips (Moved here for better UX) ───────────────── */}
                    <div className="relative">
                        {/* Scroll Shadow Indicators */}
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-base to-transparent z-10 pointer-events-none md:hidden" />
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-base to-transparent z-10 pointer-events-none md:hidden" />

                        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${activeCategory === cat
                                        ? 'bg-primary-600 text-white border-primary-500 shadow-[0_4px_12px_rgba(8,124,247,0.3)]'
                                        : 'bg-surface/50 text-text-muted border-border-subtle hover:bg-surface hover:text-text-secondary'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Expandable Filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-4 p-5 rounded-[32px] glass-panel space-y-5 border-primary-500/10 dark:border-primary-500/20">
                                {/* Area filter */}
                                <div>
                                    <label className="text-[10px] font-black text-text-muted mb-3 block uppercase tracking-widest opacity-60">تصفية حسب المنطقة</label>
                                    <div className="flex flex-wrap gap-2">
                                        {areas.map(area => (
                                            <button
                                                key={area}
                                                onClick={() => setActiveArea(area)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeArea === area
                                                    ? 'bg-primary-500/10 text-primary-500 border-primary-500/30'
                                                    : 'bg-base/40 text-text-muted border-border-subtle hover:border-primary-500/20'
                                                    }`}
                                            >
                                                {area}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sort */}
                                <div>
                                    <label className="text-[10px] font-black text-text-muted mb-3 block uppercase tracking-widest opacity-60">ترتيب النتائج</label>
                                    <div className="flex gap-2">
                                        {SORT_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setSortBy(opt.value as any)}
                                                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all border ${sortBy === opt.value
                                                    ? 'bg-accent/10 text-accent border-accent/30'
                                                    : 'bg-base/40 text-text-muted border-border-subtle hover:border-accent/20'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="w-full py-3 rounded-2xl bg-rose-500/5 text-rose-500 text-xs font-black hover:bg-rose-500/10 flex items-center justify-center gap-2 border border-rose-500/10 transition-all mt-2"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        <span>مسح جميع الفلاتر</span>
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Results Count ─────────────────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-4 mb-6 flex items-center justify-between">
                <p className="text-text-muted text-sm">
                    <span className="text-text-primary font-bold">{filtered.length}</span> مكان
                    {activeCategory !== 'الكل' && <span> في {activeCategory}</span>}
                    {activeArea !== 'كل المناطق' && <span> · {activeArea}</span>}
                </p>
            </div>

            {/* ── Places Grid ───────────────────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-4">
                <AnimatePresence mode="popLayout">
                    {filtered.length > 0 ? (
                        <motion.div
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                        >
                            {filtered.map((place, idx) => (
                                <PlaceCard key={place.id} place={place} index={idx} />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center py-24 text-center"
                        >
                            <span className="text-6xl mb-4">🔍</span>
                            <h2 className="text-xl font-bold text-text-primary mb-2">مفيش نتائج</h2>
                            <p className="text-text-muted text-sm mb-6">
                                جرب تغير الفلاتر أو ابحث بكلمة تانية
                            </p>
                            <button
                                onClick={clearFilters}
                                className="px-6 py-2.5 rounded-full bg-primary-600/15 text-primary-400 border border-primary-500/40 hover:bg-primary-600/25 transition-all text-sm font-medium"
                            >
                                مسح الفلاتر
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
