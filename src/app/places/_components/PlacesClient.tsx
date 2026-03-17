'use client';

import { useEffect } from 'react';

import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Place } from '@/lib/types/places';
import { usePlacesFilter } from '@/hooks/usePlacesFilter';
import { PlaceCard } from './PlaceCard';
import { Pagination } from '@/components/common/Pagination';

import { AreaWithDistrict } from '@/lib/actions/areas';
import SectionHeader from '@/components/ui/SectionHeader';

interface PlacesClientProps {
    initialPlaces: Place[];
    totalCount: number;
    categories: string[];
    areas: AreaWithDistrict[];
    districts: any[];
}

export function PlacesClient({ initialPlaces, totalCount, categories, areas, districts }: PlacesClientProps) {
    // 🧠 Here we use our custom hook. All logic is encapsulated inside it!
    const {
        query, setQuery,
        activeCategory, setActiveCategory,
        activeDistrict, setActiveDistrict,
        activeArea, setActiveArea,
        sortBy, setSortBy,
        page, setPage,
        showFilters, setShowFilters,
        filtered, hasActiveFilters, clearFilters,
        availableAreas,
        isPending,
        total
    } = usePlacesFilter(initialPlaces, totalCount, categories, areas, districts);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        // Removed window.scrollTo from here to prevent premature jumping
    };

    // 🌊 Intelligent Scroll: Scroll to top ONLY when new data has arrived and transition is finished
    useEffect(() => {
        if (!isPending) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [isPending, page]); // Triggers when transition ends or page state changes

    return (
        <div className="w-full min-h-screen pt-20 md:pt-28 pb-10">

            {/* ── Advanced Search Hub Header ───────────────────────────────── */}
            <div className="w-full max-w-5xl mx-auto px-4 mb-8 md:mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col gap-4 md:gap-6"
                >
                    {/* Search & Filter toggle row */}
                    <div className="flex gap-3 md:gap-4 items-center">
                        <div className="relative flex-1 group">
                            <div className="absolute inset-0 bg-primary/10 dark:bg-primary/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                            <div className="relative h-14 md:h-16 flex items-center bg-surface/90 border-2 border-border-subtle rounded-2xl md:rounded-xl shadow-lg focus-within:border-primary/50 transition-all duration-300 overflow-hidden">
                                <Search className="absolute right-5 w-5 h-5 md:w-6 md:h-6 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder="ابحث عن مكان، نشاط، أو منطقة في السويس..."
                                    className="w-full h-full bg-transparent border-none outline-none text-text-primary placeholder-text-muted/60 pr-14 md:pr-16 pl-6 text-base md:text-xl font-bold"
                                />
                                {query && (
                                    <button
                                        onClick={() => setQuery('')}
                                        className="absolute left-4 w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-elevated transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filter toggle */}
                        <button
                            onClick={() => setShowFilters(v => !v)}
                            className={`relative h-14 md:h-16 w-14 md:w-16 rounded-2xl md:rounded-xl border-2 transition-all duration-300 shrink-0 shadow-lg flex items-center justify-center ${showFilters || hasActiveFilters
                                ? 'bg-primary border-primary text-white shadow-primary/25'
                                : 'bg-surface/90 border-border-subtle text-text-muted hover:border-primary/40 hover:text-text-primary'
                                }`}
                        >
                            <SlidersHorizontal className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 ${showFilters ? 'rotate-90' : ''}`} />
                            {hasActiveFilters && (
                                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-accent rounded-full shadow-lg shadow-accent/50 animate-pulse border-2 border-white dark:border-surface" />
                            )}
                        </button>
                    </div>

                    {/* Category Chips - Horizontal Scrollable */}
                    <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-background to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-background to-transparent z-10 pointer-events-none" />

                        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 -mx-4 px-4 scroll-smooth">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`shrink-0 px-5 md:px-7 py-2.5 md:py-3 rounded-full text-sm md:text-base font-bold transition-all duration-300 border-2 ${activeCategory === cat
                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                        : 'bg-surface text-text-muted border-border-subtle hover:bg-elevated hover:text-text-primary hover:border-primary/30'
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
                            <div className="mt-6 p-6 rounded-[32px] bg-surface/80 dark:bg-surface/50 shadow-inner space-y-8 border border-border-subtle backdrop-blur-3xl">
                                {/* District filter (Primary) */}
                                <div>
                                    <label className="text-xs font-black text-text-secondary mb-3 block uppercase tracking-wide">تصفية حسب الحي</label>
                                    <div className="flex flex-wrap gap-2.5">
                                        <button
                                            onClick={() => setActiveDistrict('كل الأحياء')}
                                            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border ${activeDistrict === 'كل الأحياء'
                                                ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                                                : 'bg-surface text-text-muted border-border-subtle hover:border-border hover:text-text-primary'
                                                }`}
                                        >
                                            كل الأحياء
                                        </button>
                                        {districts.map(d => (
                                            <button
                                                key={d.id}
                                                onClick={() => setActiveDistrict(d.name)}
                                                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border ${activeDistrict === d.name
                                                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                                                    : 'bg-surface text-text-muted border-border-subtle hover:border-border hover:text-text-primary'
                                                    }`}
                                            >
                                                {d.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Area filter (Secondary - filtered by district) */}
                                <div>
                                    <label className="text-xs font-black text-text-secondary mb-3 block uppercase tracking-wide">المناطق المتاحة</label>
                                    <div className="flex flex-wrap gap-2.5">
                                        <button
                                            onClick={() => setActiveArea('كل المناطق')}
                                            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border ${activeArea === 'كل المناطق'
                                                ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                                                : 'bg-surface text-text-muted border-border-subtle hover:border-border hover:text-text-primary'
                                                }`}
                                        >
                                            كل المناطق
                                        </button>
                                        {availableAreas.map(area => (
                                            <button
                                                key={area.id}
                                                onClick={() => setActiveArea(area.name)}
                                                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border ${activeArea === area.name
                                                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                                                    : 'bg-surface text-text-muted border-border-subtle hover:border-border hover:text-text-primary'
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
                                    <label className="text-xs font-black text-text-secondary mb-3 block uppercase tracking-wide">ترتيب النتائج</label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {[
                                            { value: 'trending', label: 'الأكثر رواجاً' },
                                            { value: 'newest', label: 'الأحدث' },
                                            { value: 'name', label: 'الاسم (أ-ي)' }
                                        ].map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setSortBy(opt.value as any)}
                                                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border ${sortBy === opt.value
                                                    ? 'bg-accent text-white border-accent shadow-md shadow-accent/20'
                                                    : 'bg-surface text-text-muted border-border-subtle hover:border-accent hover:text-accent'
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
                <div className="flex items-center gap-3 px-5 py-2.5 bg-surface/80 border border-border-subtle shadow-sm rounded-2xl">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-primary font-black text-lg md:text-xl leading-none">{filtered.length}</span>
                        <span className="text-text-secondary font-bold text-sm">مكان</span>
                    </div>

                    {(activeCategory !== 'الكل' || activeDistrict !== 'كل الأحياء' || activeArea !== 'كل المناطق') && (
                        <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-text-muted border-r-2 border-border-subtle pr-3 mr-1">
                            {activeCategory !== 'الكل' && <span>{activeCategory}</span>}
                            {activeDistrict !== 'كل الأحياء' && <span> · {activeDistrict}</span>}
                            {activeArea !== 'كل المناطق' && <span> · {activeArea}</span>}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Places Grid ───────────────────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-4 relative">
                {/* Loading Overlay */}
                <AnimatePresence>
                    {isPending && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-20 bg-base/40 backdrop-blur-[2px] rounded-3xl flex items-center justify-center"
                        >
                            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="popLayout">
                    {filtered.length > 0 ? (
                        <>
                            <motion.div
                                layout
                                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 ${isPending ? 'opacity-50 grayscale-[0.2]' : ''} transition-all duration-500`}
                            >
                                {filtered.map((place, idx) => (
                                    <PlaceCard key={place.id} place={place} index={idx} />
                                ))}
                            </motion.div>

                            {/* ── Pagination Controls ────────────────────────────────── */}
                            <Pagination 
                                currentPage={page}
                                totalPages={Math.ceil(total / 20)}
                                onPageChange={handlePageChange}
                                isPending={isPending}
                            />
                        </>
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
