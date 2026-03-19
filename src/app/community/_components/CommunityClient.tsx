'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users } from 'lucide-react';
import SearchAutocomplete from '@/components/common/SearchAutocomplete';
import CommunityFeed from './CommunityFeed';
import CreatePostTrigger from './CreatePostTrigger';

interface Category {
    id: number;
    name: string;
    icon: string;
}

interface CommunityClientProps {
    initialPosts: any[];
    categories: Category[];
    userAvatar?: string | null;
}

export default function CommunityClient({ initialPosts, categories, userAvatar }: CommunityClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const q = searchParams.get('q') || '';
    const [searchQuery, setSearchQuery] = useState(q);

    const handleSearch = (term: string) => {
        const params = new URLSearchParams();
        if (term.trim()) params.set('q', term.trim());
        router.push(`/community?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex flex-col w-full h-full relative">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-primary/10">
                        <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight">مجتمع السويس</h1>
                        <p className="text-text-muted font-bold text-xs md:text-sm mt-0.5">تواصل مع جيرانك واعرف أخبار مدينتك</p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none z-10">
                    <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                </div>
                <SearchAutocomplete
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSearch={handleSearch}
                    onSuggestionSelect={(s) => router.push(`/community/posts/${s.slug}`)}
                    placeholder="ابحث في مجتمع السويس..."
                    apiEndpoint="/api/community-autocomplete"
                    inputClassName="w-full h-14 pr-12 pl-4 bg-surface text-right border border-border-subtle rounded-2xl font-bold text-text-primary placeholder:text-text-muted/40 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                />
            </div>

            {/* Create Post Area */}
            <div className="mb-8">
                <CreatePostTrigger categories={categories} userAvatar={userAvatar} />
            </div>

            {/* Feed */}
            <CommunityFeed initialPosts={initialPosts} categories={categories} />

        </div>
    );
}
