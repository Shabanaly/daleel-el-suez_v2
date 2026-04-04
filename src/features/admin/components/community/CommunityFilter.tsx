'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface CommunityFilterProps {
    onFilterChange: (searchTerm: string) => void;
}

export function CommunityFilter({ onFilterChange }: CommunityFilterProps) {
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
        onFilterChange(debouncedSearch);
    }, [debouncedSearch, onFilterChange]);

    return (
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full group">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    placeholder="البحث في منشورات المجتمع..."
                    className="w-full bg-elevated/40 border border-border-subtle rounded-2xl py-3 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-muted font-medium"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            
            <button className="flex items-center gap-2 px-5 py-3 bg-success/10 border border-success/20 rounded-2xl text-success hover:bg-success/20 active:scale-95 transition-all text-xs font-black uppercase">
                <SlidersHorizontal className="w-4 h-4" />
                تصفية متقدمة
            </button>
        </div>
    );
}
