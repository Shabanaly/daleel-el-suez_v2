'use client';

import { useState } from 'react';
import { Filter } from 'lucide-react';
import SearchAutocomplete from '@/features/search/components/SearchAutocomplete';

interface PlacesSearchHeaderProps {
    initialQuery: string;
    onSearch: (term: string) => void;
    onOpenFilters: () => void;
    hasActiveFilters: boolean;
}

export function PlacesSearchHeader({ 
    initialQuery, 
    onSearch, 
    onOpenFilters, 
    hasActiveFilters 
}: PlacesSearchHeaderProps) {
    const [searchQuery, setSearchQuery] = useState(initialQuery);

    return (
        <div className="flex gap-3 md:gap-4 items-center">
            <div className="relative flex-1 group">
                <div className="absolute inset-0 bg-primary/10 dark:bg-primary/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 rounded-2xl md:rounded-3xl" />
                <div className="relative self-stretch flex items-center bg-surface/90 dark:bg-elevated/90 backdrop-blur-2xl border-2 border-border-subtle/60 rounded-2xl md:rounded-3xl shadow-xl shadow-black/5 dark:shadow-primary/10 transition-all duration-300 h-14 md:h-18">
                    <SearchAutocomplete
                        value={searchQuery}
                        onChange={setSearchQuery}
                        onSearch={onSearch}
                        searchType="places"
                        placeholder="ابحث عن مكان، نشاط، أو منطقة في السويس..."
                        inputClassName="w-full h-full bg-transparent border-none outline-none text-text-primary flex items-center placeholder-text-muted/60 pr-6 md:pr-10 pl-6 text-base md:text-xl font-bold rounded-2xl md:rounded-3xl"
                    />
                </div>
            </div>

            {/* Filter toggle */}
            <button
                onClick={onOpenFilters}
                className={`relative h-14 md:h-18 w-14 md:w-18 rounded-2xl md:rounded-3xl border-2 transition-all duration-300 shrink-0 shadow-lg flex items-center justify-center ${hasActiveFilters
                    ? 'bg-primary border-primary text-white shadow-primary/25'
                    : 'bg-surface/90 border-border-subtle/60 text-text-muted hover:border-primary/40 hover:text-text-primary'
                    }`}
            >
                <Filter className="w-5 h-5 md:w-6 md:h-6" />
                {hasActiveFilters && (
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-accent rounded-full shadow-lg shadow-accent/50 animate-pulse border-2 border-white dark:border-surface" />
                )}
            </button>
        </div>
    );
}
