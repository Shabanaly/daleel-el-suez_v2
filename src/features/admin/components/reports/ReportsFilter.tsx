'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
 
 

import { Search, SlidersHorizontal, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface ReportsFilterProps {
    onFilterChange: (searchTerm: string) => void;
}

export function ReportsFilter({ onFilterChange }: ReportsFilterProps) {
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
                    placeholder="البحث في البلاغات (السبب، التفاصيل)..."
                    className="w-full bg-elevated/40 border border-border-subtle rounded-2xl py-3 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-muted font-medium"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            
            <div className="flex items-center gap-2 px-5 py-3 bg-error/10 border border-error/20 rounded-2xl text-error transition-all text-xs font-black uppercase">
                <Filter className="w-4 h-4" />
                تصفية متقدمة
            </div>
        </div>
    );
}
