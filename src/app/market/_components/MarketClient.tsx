"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight, Search, Plus, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MarketAd, MarketCategory } from "@/lib/types/market";
import AdCard from "@/components/market/cards/AdCard";
import { getMarketAds } from "@/lib/actions/market";

import DynamicIcon from "@/components/common/DynamicIcon";

import { createClient } from "@/lib/supabase/client";
import AuthRequiredModal from "@/components/auth/AuthRequiredModal";

export function MarketClient({ initialCategories = [] }: { initialCategories: MarketCategory[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [ads, setAds] = useState<MarketAd[]>([]);
    const [totalAds, setTotalAds] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const categories = [
        { id: 'all', name: 'الكل', slug: 'all', icon: 'LayoutGrid', adCount: 0 },
        ...initialCategories
    ];

    useEffect(() => {
        const fetchAds = async () => {
            setLoading(true);
            try {
                const result = await getMarketAds(1, selectedCategory === 'all' ? undefined : selectedCategory, searchQuery);
                setAds(result.ads);
                setTotalAds(result.total);
            } catch (error) {
                console.error("Failed to fetch ads:", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchAds, searchQuery ? 500 : 0);
        return () => clearTimeout(timer);
    }, [selectedCategory, searchQuery]);

    const handleCreateAdClick = async (e: React.MouseEvent) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            e.preventDefault();
            setIsAuthModalOpen(true);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20 pt-20 overflow-x-hidden">
            <AuthRequiredModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
                title="سجل دخولك أولاً"
                description="يجب عليك تسجيل الدخول لتتمكن من إضافة إعلانات جديدة في سوق السويس."
            />
            {/* ─── Header Section ─── */}
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border-subtle">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
                   <div className="flex items-center gap-3">
                        <Link href="/" className="p-2 -mr-2 text-text-muted hover:text-text-primary transition-colors">
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <h1 className="text-lg font-black text-text-primary hidden md:block">سوق السويس</h1>
                   </div>

                   <div className="flex-1 max-w-2xl relative group">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text"
                            placeholder="بتدور على إيه النهاردة؟"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pr-10 pl-4 bg-surface border border-border-subtle rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            dir="rtl"
                        />
                   </div>

                   <Link 
                        href="/market/create"
                        onClick={handleCreateAdClick}
                        className="bg-primary hover:bg-primary-hover text-white px-4 h-10 rounded-full flex items-center gap-2 text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">أضف إعلانك</span>
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* ─── Categories Section ─── */}
                <section className="mb-10 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-black text-text-primary">التصنيفات</h2>
                        <button className="text-primary text-xs font-bold flex items-center gap-1">
                            <SlidersHorizontal className="w-3 h-3" />
                            تصفية دقيقة
                        </button>
                    </div>
                    
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 mask-fade-edges">
                        {categories.map((cat) => {
                            const isActive = selectedCategory === cat.slug;
                            const content = (
                                <>
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                                        isActive
                                            ? 'bg-primary text-white shadow-xl shadow-primary/30'
                                            : 'bg-surface border border-border-subtle'
                                    }`}>
                                        <DynamicIcon
                                            name={cat.icon || 'ShoppingBag'}
                                            className="w-6 h-6"
                                            fallback={<ShoppingBag className="w-6 h-6" />}
                                        />
                                    </div>
                                    <span className={`text-[11px] font-bold whitespace-nowrap ${isActive ? 'font-black' : ''}`}>
                                        {cat.name}
                                    </span>
                                </>
                            );

                            if (cat.id === 'all') {
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory('all')}
                                        className={`flex flex-col items-center gap-2 min-w-[70px] shrink-0 transition-all ${
                                            isActive ? 'text-primary scale-105' : 'text-text-muted hover:text-text-secondary'
                                        }`}
                                    >
                                        {content}
                                    </button>
                                );
                            }

                            return (
                                <Link
                                    key={cat.id}
                                    href={`/market/category/${cat.slug}`}
                                    className={`flex flex-col items-center gap-2 min-w-[70px] shrink-0 transition-all ${
                                        isActive ? 'text-primary scale-105' : 'text-text-muted hover:text-text-secondary'
                                    }`}
                                >
                                    {content}
                                </Link>
                            );
                        })}
                    </div>

                </section>

                {/* ─── Results Section ─── */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-black text-text-primary flex items-center gap-2">
                             {searchQuery ? "نتائج البحث" : "أحدث الإعلانات"}
                             <span className="px-2 py-0.5 rounded-md bg-elevated text-[10px] text-text-muted font-bold">
                                {totalAds} نتيجة
                             </span>
                        </h2>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="aspect-4/5 bg-surface border border-border-subtle rounded-3xl animate-pulse" />
                            ))}
                        </div>
                    ) : ads.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <AnimatePresence mode="popLayout">
                                {ads.map((ad, index) => (
                                    <motion.div
                                        key={ad.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                    >
                                        <AdCard ad={ad} priority={index === 0} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-elevated rounded-full flex items-center justify-center mb-4 text-text-muted/30">
                                <Search className="w-10 h-10" />
                            </div>
                            <h3 className="text-lg font-bold text-text-primary mb-2">مفيش نتائج</h3>
                            <p className="text-text-muted text-sm max-w-xs mx-auto">
                                {searchQuery ? `مش لاقيين حاجة لـ "${searchQuery}"` : "القسم ده لسه مفيش فيه إعلانات، كن أول من ينشر!"}
                            </p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
