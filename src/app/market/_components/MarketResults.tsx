"use client";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdCard from "@/components/market/cards/AdCard";
import { MarketAd } from "@/lib/types/market";

interface MarketResultsProps {
    searchQuery: string;
    totalAds: number;
    loading: boolean;
    ads: MarketAd[];
}

export default function MarketResults({ searchQuery, totalAds, loading, ads }: MarketResultsProps) {
    if (!loading && ads.length === 0 && !searchQuery) return null;

    return (
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="aspect-4/5 bg-surface border border-border-subtle rounded-[32px] animate-pulse" />
                    ))}
                </div>
            ) : ads.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {ads.map((ad: MarketAd, index: number) => (
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
    );
}
