'use client';

import { Search, SlidersHorizontal, X, MapPin, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Place } from '@/lib/types/places';
import { usePlacesFilter } from '@/hooks/usePlacesFilter';
import { PlaceCard } from './PlaceCard';

import { AreaWithDistrict } from '@/lib/actions/areas';
import SectionHeader from '@/components/ui/SectionHeader';

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
        page, setPage,
        showFilters, setShowFilters,
        filtered, hasActiveFilters, clearFilters,
        availableAreas,
        isPending
    } = usePlacesFilter(initialPlaces, categories, areas, districts);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="w-full min-h-screen pt-20 md:pt-28 pb-10">

            {/* ── Page Header ──────────────────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-4 mb-8 md:mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <SectionHeader
                        title="الأماكن"
                        subtitle="اكتشف أفضل الأماكن والأنشطة في مدينة السويس"
                        icon={MapPin}
                    />
                </motion.div>
            </div>

            {/* ── Search & Filter Bar ──────────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-4 mb-8 md:mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex flex-col gap-6"
                >
                    <div className="flex gap-3 md:gap-4 items-center">
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
                                    className="w-full h-full bg-transparent border-none outline-none text-text-primary placeholder-text-muted/60 pr-16 pl-6 text-[16px] md:text-lg font-medium"
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

                        <div className="flex overflow-x-auto hide-scrollbar gap-1 pb-1 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`shrink-0 px-6 py-2.5 md:px-7 rounded-xl text-sm font-bold transition-all duration-300 border ${activeCategory === cat
                                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                                        : 'bg-surface/50 text-text-muted border-border-subtle hover:bg-surface hover:text-text-primary'
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
                            <div className="mt-12 md:mt-16 flex items-center justify-between md:justify-center md:gap-8 px-2 md:px-0">
                                <button
                                    disabled={page === 1 || isPending}
                                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                                    className="group flex items-center justify-center gap-2 h-12 w-12 md:w-auto md:px-6 rounded-2xl md:rounded-full bg-surface/80 border border-border-subtle hover:border-primary/40 hover:bg-surface text-text-muted hover:text-primary disabled:opacity-40 disabled:hover:border-border-subtle disabled:hover:text-text-muted disabled:hover:bg-surface/80 disabled:cursor-not-allowed transition-all shadow-sm"
                                    aria-label="الصفحة السابقة"
                                >
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    <span className="hidden md:inline font-bold text-sm">السابق</span>
                                </button>

                                <div className="flex items-center">
                                    <span className="hidden md:block text-text-muted text-sm font-medium ml-3">صفحة</span>
                                    <div className="w-14 h-14 md:w-12 md:h-12 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 font-black rounded-[20px] md:rounded-full text-xl md:text-lg shadow-inner">
                                        {page}
                                    </div>
                                </div>

                                <button
                                    disabled={filtered.length < 20 || isPending}
                                    onClick={() => handlePageChange(page + 1)}
                                    className="group flex items-center justify-center gap-2 h-12 w-12 md:w-auto md:px-6 rounded-2xl md:rounded-full bg-surface/80 border border-border-subtle hover:border-primary/40 hover:bg-surface text-text-muted hover:text-primary disabled:opacity-40 disabled:hover:border-border-subtle disabled:hover:text-text-muted disabled:hover:bg-surface/80 disabled:cursor-not-allowed transition-all shadow-sm"
                                    aria-label="الصفحة التالية"
                                >
                                    <span className="hidden md:inline font-bold text-sm">التالي</span>
                                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                </button>
                            </div>
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
