'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/providers/AuthProvider';

// Import sub-components
import HeroBackground from './hero/HeroBackground';
import HeroMobileProfile from './hero/HeroMobileProfile';
import HeroSearch from './hero/HeroSearch';
import HeroCategories from './hero/HeroCategories';

interface HeroCategory {
    id: string | number;
    name: string;
    icon: string;
}

export default function Hero({ categories = [] }: { categories?: HeroCategory[] }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();

    // Map the first 5 dynamic categories for the quick links
    const heroCategories = categories.map((cat: HeroCategory) => ({
        name: cat.name,
        icon: cat.icon,
        href: `/places?category=${encodeURIComponent(cat.name)}`
    })).slice(0, 5);



    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/places?q=${encodeURIComponent(searchTerm.trim())}`);
        } else {
            router.push('/places');
        }
    };

    const handleTagClick = (tag: string) => {
        setSearchTerm(tag);
        router.push(`/places?q=${encodeURIComponent(tag)}`);
    };

    return (
        <section className="relative w-full flex flex-col items-center justify-center overflow-hidden pt-20 pb-12 md:pt-32 md:pb-24 min-h-[70vh] md:min-h-screen bg-background">

            <HeroBackground />

            {/* ── Content ────────────────────────────────────────────────── */}
            <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center">

                <HeroMobileProfile user={user} />

                {/* ── Headline ────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8 md:mb-12"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-bold mb-4 md:mb-6"
                    >
                        🚀 الدليل الرسمي والأول لمدينة السويس
                    </motion.div>
                    <h1 className="text-5xl md:text-9xl font-black tracking-tighter text-text-primary leading-[1.1]">
                        دليل <span className="text-primary drop-shadow-[0_0_20px_rgba(37,99,235,0.3)] dark:drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">السويس</span>
                    </h1>
                    <p className="text-sm md:text-2xl text-text-muted mt-4 md:mt-6 font-medium max-w-2xl mx-auto leading-relaxed opacity-90">
                        اكتشف أفضل الخدمات، الأماكن، والقصص في قلب السويس. كل ما تحتاجه في مكان واحد.
                    </p>
                </motion.div>

                <HeroSearch
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onSearch={handleSearch}
                    onTagClick={handleTagClick}
                />

                <HeroCategories categories={heroCategories} />
            </div>
        </section>
    );
}
