'use client';

import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroSearchProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onSearch: (e?: React.FormEvent) => void;
}

export default function HeroSearch({ searchTerm, setSearchTerm, onSearch }: HeroSearchProps) {
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
        </>
    );
}
