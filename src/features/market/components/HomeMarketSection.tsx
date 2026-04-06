"use client";

import SectionHeader from '@/components/ui/SectionHeader';
import { ShoppingBag } from 'lucide-react';
import AdCard from '@/features/market/components/AdCard';
import { MarketAd } from '@/features/market/types';

interface HomeMarketSectionProps {
    ads: MarketAd[];
}

export default function HomeMarketSection({ ads }: HomeMarketSectionProps) {
    if (!ads || ads.length === 0) return null;

    return (
        <section className="w-full max-w-7xl mx-auto px-4 relative overflow-hidden pt-0 pb-8 md:pt-0 md:pb-16">
             {/* Ambient Background Glow */}
             <div className="absolute top-0 right-1/3 w-72 h-72 bg-primary/5 rounded-full blur-[110px] pointer-events-none" />
             <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-accent/2 rounded-full blur-[100px] pointer-events-none" />
             
             <SectionHeader
                title="سوق السويس"
                subtitle="اكتشف أحدث العروض والمنتجات المتاحة في مدينتك"
                icon={ShoppingBag}
                href="/market"
            />

            <div className="flex overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 gap-6 md:gap-8 pb-10">
                {ads.map((ad, idx) => (
                    <div key={ad.id} className="min-w-[260px] md:min-w-0 flex-1">
                        <AdCard ad={ad} priority={idx < 4} />
                    </div>
                ))}
            </div>
        </section>
    );
}
