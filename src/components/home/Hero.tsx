'use client';


import { motion } from 'framer-motion';

// Import sub-components
import HeroBackground from './hero/HeroBackground';
import HeroSearch from '@/features/search/components/HeroSearch';
import HeroAdsCarousel from './hero/HeroAdsCarousel';
import HeroCategories from '@/features/places/components/HeroCategories';

import type { Category } from '@/lib/types/category';
import type { HeroAd } from '@/features/marketing/types/hero-ads';

export default function Hero({ categories = [], ads = [] }: { categories?: Category[], ads?: HeroAd[] }) {
    return (
        <section className="relative w-full flex flex-col items-center justify-center overflow-hidden pt-4 pb-0 md:pt-6 md:pb-0 min-h-[60vh] bg-background">

            <HeroBackground />

            {/* ── Content ────────────────────────────────────────────────── */}
            <div className="relative z-10 w-full max-w-6xl px-4 flex flex-col items-center">

                {/* ── Headline ────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-6 md:mb-12"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-bold mb-3 md:mb-6"
                    >
                        🚀 الدليل الرسمي والأول لمدينة السويس
                    </motion.div>
                    <h1 className="text-4xl md:text-9xl font-black tracking-tighter text-text-primary leading-[1.1]">
                        دليل <span className="text-primary drop-shadow-[0_0_35px_rgba(var(--primary-rgb),0.3)] dark:drop-shadow-[0_0_50px_rgba(59,130,246,0.4)]">السويس</span>
                    </h1>
                    <p className="text-xs md:text-2xl text-text-primary mt-3 md:mt-6 font-bold max-w-2xl mx-auto leading-relaxed opacity-90">
                        اكتشف أفضل الخدمات، الأماكن، والقصص في قلب السويس. كل ما تحتاجه في مكان واحد.
                    </p>
                </motion.div>

                <HeroSearch />
            </div>

            {/* ── Promo Ads — Full-width (outside container) ── */}
            <div className="relative z-10 w-full">
                <HeroAdsCarousel ads={ads} />
            </div>

            {/* ── Categories — back inside container ── */}
            <div className="relative z-10 w-full max-w-6xl px-4 flex flex-col items-center">
                <HeroCategories categories={categories} />
            </div>
        </section>
    );
}
