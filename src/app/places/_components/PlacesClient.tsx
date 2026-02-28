'use client';

import { Search, SlidersHorizontal, X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Place } from '@/lib/types/places';
import { usePlacesFilter } from '@/hooks/usePlacesFilter';
import { PlaceCard } from './PlaceCard';

import { AreaWithDistrict } from '@/lib/actions/areas';

interface PlacesClientProps {
    initialPlaces: Place[];
    categories: string[];
    areas: AreaWithDistrict[];
    districts: any[];
}

export function PlacesClient({ initialPlaces, categories, areas, districts }: PlacesClientProps) {
    // 🧠 Here we use our custom hook. All logic is encapsulated inside it!
    const {
        query, setQuery,
        activeCategory, setActiveCategory,
        activeDistrict, setActiveDistrict,
        activeArea, setActiveArea,
        sortBy, setSortBy,
        showFilters, setShowFilters,
        filtered, hasActiveFilters, clearFilters,
        availableAreas
    } = usePlacesFilter(initialPlaces, categories, areas, districts);

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
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/30 shadow-primary/20 dark:shadow-primary/30 shrink-0">
                        <MapPin className="w-8 h-8 md:w-10 md:h-10 text-primary opacity-80" />
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
                            <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                            <div className="relative h-14 rounded-2xl glass-panel bg-surface/90 dark:bg-surface/40 border border-border-subtle flex items-center overflow-hidden shadow-lg shadow-black/5 dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] focus-within:border-primary/50 transition-all duration-300">
                                <Search className="absolute right-5 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
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
                                ? 'bg-primary text-white border-primary-hover shadow-primary/25'
                                : 'glass-panel bg-surface/90 dark:bg-surface/40 border-border-subtle text-text-muted hover:border-primary/40 hover:text-text-primary'
                                }`}
                        >
                            <SlidersHorizontal className={`w-5 h-5 transition-transform duration-300 ${showFilters ? 'rotate-90' : ''}`} />
                            {hasActiveFilters && (
                                <span className="absolute -top-1 -left-1 w-4 h-4 bg-accent rounded-full border-2 border-base shadow-accent/50" />
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
                                        ? 'bg-primary text-white border-primary-hover shadow-primary/30'
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
                            <div className="mt-4 p-5 rounded-[32px] glass-panel space-y-7 border-primary/10 dark:border-primary/20">
                                {/* District filter (Primary) */}
                                <div>
                                    <label className="text-[10px] font-black text-text-muted mb-3 block uppercase tracking-widest opacity-60">تصفية حسب الحي</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setActiveDistrict('كل الأحياء')}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeDistrict === 'كل الأحياء'
                                                ? 'bg-primary/10 text-primary border-primary/30'
                                                : 'bg-background/40 text-text-muted border-border-subtle hover:border-primary/20'
                                                }`}
                                        >
                                            كل الأحياء
                                        </button>
                                        {districts.map(d => (
                                            <button
                                                key={d.id}
                                                onClick={() => setActiveDistrict(d.name)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeDistrict === d.name
                                                    ? 'bg-primary/10 text-primary border-primary/30'
                                                    : 'bg-background/40 text-text-muted border-border-subtle hover:border-primary/20'
                                                    }`}
                                            >
                                                {d.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Area filter (Secondary - filtered by district) */}
                                <div>
                                    <label className="text-[10px] font-black text-text-muted mb-3 block uppercase tracking-widest opacity-60">المناطق المتاحة</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setActiveArea('كل المناطق')}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeArea === 'كل المناطق'
                                                ? 'bg-primary/10 text-primary border-primary/30'
                                                : 'bg-background/40 text-text-muted border-border-subtle hover:border-primary/20'
                                                }`}
                                        >
                                            كل المناطق
                                        </button>
                                        {availableAreas.map(area => (
                                            <button
                                                key={area.id}
                                                onClick={() => setActiveArea(area.name)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeArea === area.name
                                                    ? 'bg-primary/10 text-primary border-primary/30'
                                                    : 'bg-background/40 text-text-muted border-border-subtle hover:border-primary/20'
                                                    }`}
                                            >
                                                {area.name}
                                            </button>
                                        ))}
                                    </div>
                                    {availableAreas.length === 0 && activeDistrict !== 'كل الأحياء' && (
                                        <p className="text-[10px] text-text-muted mt-2 italic">لا توجد مناطق مدرجة لهذا الحي حالياً</p>
                                    )}
                                </div>

                                {/* Sort */}
                                <div>
                                    <label className="text-[10px] font-black text-text-muted mb-3 block uppercase tracking-widest opacity-60">ترتيب النتائج</label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { value: 'trending', label: 'الأكثر رواجاً' },
                                            { value: 'newest', label: 'الأحدث' },
                                            { value: 'rating', label: 'الأعلى تقييماً' },
                                            { value: 'reviews', label: 'الأكثر تعليقاً' },
                                            { value: 'name', label: 'الاسم (أ-ي)' }
                                        ].map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setSortBy(opt.value as any)}
                                                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all border ${sortBy === opt.value
                                                    ? 'bg-accent/10 text-accent border-accent/30'
                                                    : 'bg-background/40 text-text-muted border-border-subtle hover:border-accent/20'
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
                                        className="w-full py-3 rounded-2xl bg-accent/5 text-accent text-xs font-black hover:bg-accent/10 flex items-center justify-center gap-2 border border-accent/10 transition-all mt-2"
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
                <p className="text-text-muted text-sm leading-relaxed">
                    <span className="text-text-primary font-bold">{filtered.length}</span> مكان
                    {activeCategory !== 'الكل' && <span> في {activeCategory}</span>}
                    {activeDistrict !== 'كل الأحياء' && <span> · {activeDistrict}</span>}
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
                                className="px-6 py-2.5 rounded-full bg-primary/15 text-primary border border-primary/40 hover:bg-primary/25 transition-all text-sm font-medium"
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
