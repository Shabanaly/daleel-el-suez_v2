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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="w-full max-w-2xl mb-8 md:mb-10 px-4 md:px-0"
            >
                <motion.div
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="group relative flex items-center w-full h-14 md:h-18 bg-surface/90 dark:bg-elevated/90 backdrop-blur-2xl border border-border-subtle md:border-2 md:border-border-subtle/60 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl shadow-black/5 dark:shadow-primary/10 focus-within:border-primary/40 focus-within:ring-8 focus-within:ring-primary/5 transition-all duration-500"
                >
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ابحث عن مطعم، صيدلية، كافيه..."
                        className="flex-1 min-w-0 h-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted/50 px-6 md:px-8 text-sm md:text-lg font-bold"
                    />

                    <div className="pe-2 md:pe-3 h-full flex items-center">
                        <button
                            type="submit"
                            className="h-10 md:h-12 px-5 md:px-10 bg-primary hover:bg-primary-hover text-white text-sm md:text-lg font-black rounded-xl md:rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center shrink-0 relative overflow-hidden group/btn"
                        >
                            <span className="relative z-10 hidden md:block">بحث</span>
                            <Search className="relative z-10 block md:hidden w-5 h-5" />
                            {/* Simple glow effect */}
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        </button>
                    </div>
                </motion.div>
            </motion.form>

            {/* ── Trending Searches ──────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-8 md:mb-12 px-2"
            >
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface/50 border border-border-subtle/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-[10px] md:text-xs font-black text-text-muted uppercase tracking-tight">شائع:</span>
                </div>
                {TRENDING_TAGS.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => onTagClick(tag)}
                        className="px-4 py-1.5 rounded-full bg-surface/60 backdrop-blur-md border border-border-subtle/60 text-[11px] md:text-xs font-bold text-text-muted hover:text-primary hover:border-primary/40 hover:bg-surface hover:translate-y-[-2px] transition-all duration-300 shadow-sm"
                    >
                        {tag}
                    </button>
                ))}
            </motion.div>
        </>
    );
}
