"use client";
import { Flame, Clock } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import AdCard from "@/components/market/cards/AdCard";
import { MarketAd } from "@/lib/types/market";

interface MarketHighlightsProps {
    trendingAds: MarketAd[];
    latestAds: MarketAd[];
}

export default function MarketHighlights({ trendingAds, latestAds }: MarketHighlightsProps) {
    if (trendingAds.length === 0 && latestAds.length === 0) return null;

    return (
        <div className="space-y-16 mb-16">
            {/* Trending Section - Horizontal Scroll on Mobile */}
            {trendingAds.length > 0 && (
                <section className="relative overflow-visible">
                    <SectionHeader 
                        title="الاكثر رواجاَ"
                        subtitle="الإعلانات التي تحظى بأكبر قدر من الاهتمام حالياً"
                        icon={Flame}
                    />
                    <div className="flex overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 gap-4 md:gap-6 pb-4">
                        {trendingAds.map((ad: MarketAd, idx: number) => (
                            <div key={ad.id} className="min-w-[200px] md:min-w-0">
                                <AdCard ad={ad} priority={idx < 4} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Newest Section - Grid Layout */}
            {latestAds.length > 0 && (
                <section className="relative overflow-visible">
                    <SectionHeader 
                        title="أحدث الإعلانات"
                        subtitle="اكتشف آخر ما تمت إضافته في سوق السويس"
                        icon={Clock}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {latestAds.map((ad: MarketAd) => (
                            <div key={ad.id}>
                                <AdCard ad={ad} />
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
