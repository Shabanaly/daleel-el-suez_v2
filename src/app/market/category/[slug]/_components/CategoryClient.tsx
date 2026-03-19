'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, Plus, MapPin, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketAd, MarketCategory } from '@/lib/types/market';
import AdCard from '@/components/market/cards/AdCard';
import { getMarketAds } from '@/lib/actions/market';
import DynamicIcon from '@/components/common/DynamicIcon';
import SearchAutocomplete, { Suggestion } from '@/components/common/SearchAutocomplete';
import { createClient } from '@/lib/supabase/client';
import AuthRequiredModal from '@/components/auth/AuthRequiredModal';
import { useRouter, useSearchParams } from 'next/navigation';

interface CategoryClientProps {
    category: MarketCategory;
    allCategories: MarketCategory[]; // Kept for prop consistency if needed elsewhere, but not used for slider
    initialAds: MarketAd[];
    initialTotal: number;
    initialQuery?: string;
}

export function CategoryClient({
    category,
    initialAds,
    initialTotal,
    initialQuery = '',
}: CategoryClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [ads, setAds] = useState<MarketAd[]>(initialAds);
    const [total, setTotal] = useState(initialTotal);
    const [loading, setLoading] = useState(false);
    const [conditionFilter, setConditionFilter] = useState<string>('all');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isFirstMount, setIsFirstMount] = useState(true);

    const fetchAds = useCallback(async (query: string) => {
        setLoading(true);
        try {
            const result = await getMarketAds(1, category.slug, query || undefined);
            setAds(result.ads);
            setTotal(result.total);
        } catch (err) {
            console.error('Failed to fetch ads:', err);
        } finally {
            setLoading(false);
        }

        // Update URL
        const params = new URLSearchParams(searchParams.toString());
        if (query) params.set('q', query); else params.delete('q');
        router.replace(`/market/category/${category.slug}?${params.toString()}`, { scroll: false });
    }, [category.slug, router, searchParams]);

    useEffect(() => {
        if (isFirstMount) {
            setIsFirstMount(false);
            return;
        }
        const timer = setTimeout(() => fetchAds(searchQuery), searchQuery ? 400 : 0);
        return () => clearTimeout(timer);
    }, [searchQuery, fetchAds, isFirstMount]);

    const filteredAds = conditionFilter === 'all'
        ? ads
        : ads.filter(ad => ad.condition === conditionFilter);

    const handleCreateAdClick = async (e: React.MouseEvent) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            e.preventDefault();
            setIsAuthModalOpen(true);
        }
    };

    const handleSuggestionSelect = (s: Suggestion) => {
        // If it's a category and it's NOT the current one, navigate
        if (s.slug === category.slug) {
            setSearchQuery(s.name);
            return;
        }

        // Logic to determine if it's a category or product
        // (Similar to MarketClient)
        // For simplicity, we can just navigate to whatever it is
        // But if it's a category, the URL is different
        // In the API, we return slug for both. 
        // We might need to adjust the API to include 'type' in results
        
        // Let's assume if it has a specific icon or if we can find it in 'allCategories'
        // But CategoryClient doesn't have 'allCategories' used anymore.
        // Actually, let's just use the name as searchQuery if we are unsure,
        // or just navigate to the ad if it's a UUID.
        
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.slug);
        if (isUuid) {
            router.push(`/market/${s.slug}`);
        } else {
            // Likely a category
            router.push(`/market/category/${encodeURIComponent(s.slug)}`);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-28 pt-28 overflow-x-hidden" dir="rtl">
            <AuthRequiredModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                title="سجل دخولك أولاً"
                description="يجب عليك تسجيل الدخول لتتمكن من إضافة إعلانات جديدة في سوق السويس."
            />

            <div className="max-w-7xl mx-auto px-4">
                {/* ─── Breadcrumbs ─── */}
                <nav className="flex items-center gap-2 text-sm font-bold text-text-muted mb-8">
                    <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
                    <ChevronLeft className="w-4 h-4" />
                    <Link href="/market" className="hover:text-primary transition-colors">سوق السويس</Link>
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-primary">{category.name}</span>
                </nav>

                {/* ─── Hero Header ─── */}
                <div className="w-full p-6 md:p-10 rounded-3xl bg-surface border border-border-subtle mb-10 shadow-sm flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <DynamicIcon 
                            name={category.icon || 'ShoppingBag'} 
                            className="w-8 h-8 md:w-10 md:h-10 text-primary" 
                            fallback={<ShoppingBag className="w-8 h-8 md:w-10 md:h-10 text-primary" />} 
                        />
                    </div>
                    
                    <div className="flex-1 text-center md:text-start">
                        <h1 className="text-3xl md:text-4xl font-black text-text-primary mb-2">
                            {category.name}
                        </h1>
                        <p className="text-text-muted text-base font-bold flex items-center justify-center md:justify-start gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            يوجد <span className="text-primary">{total} إعلان</span> متاح في هذا التصنيف
                        </p>
                    </div>

                    <Link
                        href="/market/create"
                        onClick={handleCreateAdClick}
                        className="bg-primary hover:bg-primary-hover text-white px-8 h-12 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 shrink-0"
                    >
                        <Plus className="w-5 h-5" />
                        أضف إعلانك
                    </Link>
                </div>

                {/* ─── Search & Filters ─── */}
                <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
                    <div className="w-full md:flex-1 relative group h-14">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
                        <SearchAutocomplete
                            value={searchQuery}
                            onChange={setSearchQuery}
                            onSearch={setSearchQuery}
                            onSuggestionSelect={handleSuggestionSelect}
                            apiEndpoint="/api/autocomplete?type=market"
                            placeholder={`بحث في ${category.name}...`}
                            inputClassName="w-full h-14 pr-12 pl-4 bg-surface border border-border-subtle rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
                        {[
                            { id: 'all', label: 'الكل' },
                            { id: 'new', label: 'جديد' },
                            { id: 'used', label: 'مستعمل' },
                            { id: 'na', label: 'أخرى' },
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setConditionFilter(opt.id)}
                                className={`h-11 px-6 rounded-xl text-sm font-bold transition-all border shrink-0 ${
                                    conditionFilter === opt.id
                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                        : 'bg-surface border-border-subtle text-text-muted hover:border-primary/30 hover:text-primary'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── Results Grid ─── */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-text-primary flex items-center gap-3">
                            {searchQuery ? 'نتائج البحث' : 'أحدث الإعلانات'}
                            <span className="px-3 py-1 rounded-lg bg-primary/10 text-xs text-primary font-black uppercase tracking-wider">
                                {conditionFilter === 'all' ? total : filteredAds.length} نتيجة
                            </span>
                        </h2>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="aspect-4/5 bg-surface border border-border-subtle rounded-[32px] animate-pulse" />
                            ))}
                        </div>
                    ) : filteredAds.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <AnimatePresence mode="popLayout">
                                {filteredAds.map((ad, index) => (
                                    <motion.div
                                        key={ad.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <AdCard ad={ad} priority={index === 0} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="py-24 text-center space-y-6 bg-surface rounded-[40px] border border-dashed border-border-subtle">
                            <div className="w-24 h-24 bg-elevated rounded-full flex items-center justify-center text-5xl mx-auto opacity-80 border border-border-subtle shadow-inner">
                                <DynamicIcon name={category.icon || 'ShoppingBag'} className="w-12 h-12 text-text-muted/30" />
                            </div>
                            <div className="max-w-xs mx-auto space-y-2">
                                <h3 className="text-2xl font-black text-text-primary">
                                    {searchQuery ? `لا توجد نتائج لـ "${searchQuery}"` : 'لا توجد إعلانات هنا'}
                                </h3>
                                <p className="text-text-muted font-bold text-sm">
                                    {searchQuery ? 'جرب البحث بكلمات أبسط أو تصفح الأقسام الأخرى.' : 'لم يتم إضافة إعلانات في هذا القسم حتى الآن.'}
                                </p>
                            </div>
                            <Link 
                                href="/market/create" 
                                className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-primary text-white font-black hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all active:scale-95"
                            >
                                <Plus className="w-5 h-5" />
                                أضف إعلانك الأول
                            </Link>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
