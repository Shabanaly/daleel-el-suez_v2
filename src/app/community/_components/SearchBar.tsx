'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { useDebounce } from '../../../lib/hooks/useDebounce';

export default function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const [query, setQuery] = useState(initialQuery);
    const [isPending, setIsPending] = useState(false);

    const debouncedQuery = useDebounce(query, 500);

    const handleSearch = useCallback((searchTerm: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (searchTerm) {
            params.set('q', searchTerm);
        } else {
            params.delete('q');
        }

        // Preserve category if exists
        const category = searchParams.get('category');
        if (category) params.set('category', category);

        setIsPending(true);
        router.push(`/community?${params.toString()}`);
    }, [router, searchParams]);

    useEffect(() => {
        // Only trigger if the debounced query actually changed from what's in the URL
        if (debouncedQuery !== initialQuery) {
            setTimeout(() => handleSearch(debouncedQuery), 0);
        }
    }, [debouncedQuery, handleSearch, initialQuery]);

    useEffect(() => {
        // If the URL changes (e.g. browser back), sync the local state
        setTimeout(() => {
            setQuery(initialQuery);
            setIsPending(false);
        }, 0);
    }, [initialQuery]);

    return (
        <div className="relative w-full mb-8">
            <div className="relative group">
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
                    {isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Search className="w-5 h-5" />
                    )}
                </div>

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ابحث عن المنشورات، الأسئلة، أو المواضيع..."
                    className="w-full h-14 pr-12 pl-12 bg-surface text-right border border-border-subtle rounded-2xl font-bold text-text-primary placeholder:text-text-muted/40 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                    dir="rtl"
                />

                {query && (
                    <button
                        onClick={() => setQuery('')}
                        className="absolute inset-y-0 left-4 flex items-center text-text-muted hover:text-text-primary transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
}
