'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchAutocomplete from '@/features/search/components/SearchAutocomplete';
import { ROUTES, ROUTE_HELPERS } from '@/constants';
import { API_ENDPOINTS } from '@/constants/api';

export default function CommunitySearch() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

    const handleSearch = (term: string) => {
        const params = new URLSearchParams();
        if (term.trim()) params.set('q', term.trim());
        router.push(`${ROUTES.COMMUNITY}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="mb-8 relative group h-14 md:h-18">
            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none z-10 transition-colors group-focus-within:text-primary">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
            </div>
            <SearchAutocomplete
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                onSuggestionSelect={(s) => router.push(ROUTE_HELPERS.COMMUNITY_POST(s.slug))}
                placeholder="ابحث في مجتمع السويس..."
                apiEndpoint={API_ENDPOINTS.COMMUNITY_AUTOCOMPLETE}
                inputClassName="w-full h-full pr-14 pl-6 bg-surface/90 dark:bg-elevated/90 backdrop-blur-2xl text-right border-2 border-border-subtle/60 rounded-2xl md:rounded-3xl font-bold text-text-primary placeholder:text-text-muted/40 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-base md:text-lg shadow-xl shadow-black/5 dark:shadow-primary/10"
            />
        </div>
    );
}
