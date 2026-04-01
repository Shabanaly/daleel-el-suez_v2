'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import SearchAutocomplete from '@/components/common/SearchAutocomplete';

interface HeroSearchProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onSearch: (e?: React.FormEvent) => void;
}

export default function HeroSearch({ searchTerm, setSearchTerm, onSearch }: HeroSearchProps) {
    const router = useRouter();

    const handleSelect = (term: string) => {
        if (term.trim()) {
            router.push(`/places?q=${encodeURIComponent(term.trim())}`);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-2xl mb-8 md:mb-10 px-4 md:px-0"
        >
            <form onSubmit={onSearch}>
                <motion.div
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="group relative flex items-center w-full h-14 md:h-18 bg-surface/90 dark:bg-elevated/90 backdrop-blur-2xl border border-border-subtle md:border-2 md:border-border-subtle/60 rounded-2xl md:rounded-3xl shadow-xl shadow-black/5 dark:shadow-primary/10 focus-within:border-primary/40 transition-all duration-500"
                >
                    {/* Autocomplete input — self-stretch fills the row height */}
                    <div className="flex-1 min-w-0 self-stretch flex items-center">
                        <SearchAutocomplete
                            value={searchTerm}
                            onChange={setSearchTerm}
                            onSearch={handleSelect}
                            onSuggestionSelect={(item) => {
                                if (item.url) router.push(item.url);
                            }}
                            placeholder="ابحث عن مطعم، صيدلية، كافيه..."
                            inputClassName="w-full h-full bg-transparent border-none outline-none text-text-primary flex items-center placeholder:text-text-muted/50 px-6 md:px-8 text-sm md:text-lg font-bold rounded-2xl md:rounded-3xl"
                        />
                    </div>

                    <div className="pe-2 md:pe-3 h-full flex items-center shrink-0">
                        <button
                            type="submit"
                            className="h-10 md:h-12 px-5 md:px-10 bg-primary hover:bg-primary-hover text-white text-sm md:text-lg font-black rounded-xl md:rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center relative overflow-hidden group/btn"
                        >
                            <span className="relative z-10 hidden md:block">بحث</span>
                            <svg className="relative z-10 block md:hidden w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        </button>
                    </div>
                </motion.div>
            </form>
        </motion.div>
    );
}
