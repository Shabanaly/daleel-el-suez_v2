'use client';

import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

const TRENDING_TAGS = ['مطاعم سمك', 'كافيهات', 'عيادات', 'محلات ملابس'];

interface HeroSearchProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onSearch: (e?: React.FormEvent) => void;
    onTagClick: (tag: string) => void;
}

export default function HeroSearch({ searchTerm, setSearchTerm, onSearch, onTagClick }: HeroSearchProps) {
    return (
        <>
            {/* ── Search Bar ───────────────────────────────────────────── */}
            <motion.form
                onSubmit={onSearch}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full max-w-2xl mb-6 md:mb-8"
            >
                <div className="group relative flex items-center w-full h-14 md:h-20 bg-surface border border-border-subtle rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.2)] focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all duration-500">
                    <div className="ps-4 md:ps-8 text-text-muted group-focus-within:text-primary transition-colors">
                        <Search className="w-5 h-5 md:w-6 md:h-6" />
                    </div>

                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ابحث عن مطعم، صيدلية..."
                        className="flex-1 min-w-0 h-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted/40 px-3 text-sm md:text-lg font-bold"
                    />

                    <button
                        type="submit"
                        className="h-full px-6 md:px-16 bg-primary hover:bg-primary-hover text-white text-sm md:text-xl font-black transition-all active:scale-95 flex items-center justify-center shrink-0"
                    >
                        بحث
                    </button>
                </div>
            </motion.form>

            {/* ── Trending Searches ──────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-4 md:mb-8"
            >
                <span className="text-xs font-bold text-text-muted/60 uppercase tracking-tighter">شائع الآن:</span>
                {TRENDING_TAGS.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => {
                            onTagClick(tag);
                        }}
                        className="px-3 py-1 rounded-lg bg-surface border border-border-subtle/40 text-xs font-bold text-text-muted hover:text-primary hover:border-primary/30 transition-all"
                    >
                        {tag}
                    </button>
                ))}
            </motion.div>
        </>
    );
}
