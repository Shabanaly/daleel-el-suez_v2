'use client';


import { Users } from 'lucide-react';
import CommunitySearch from './CommunitySearch';
import CommunityFeed from './CommunityFeed';
import { CommunityPost, CommunityCategory } from '@/features/community/types';
import CreatePostTrigger from './CreatePostTrigger';

interface CommunityClientProps {
    initialPosts: CommunityPost[];
    categories: CommunityCategory[];
    userAvatar?: string | null;
}

export default function CommunityClient({ initialPosts, categories, userAvatar }: CommunityClientProps) {

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
            <CommunitySearch />

            {/* Create Post Area */}
            <div className="mb-8">
                <CreatePostTrigger categories={categories} userAvatar={userAvatar} />
            </div>

            {/* Feed */}
            <CommunityFeed initialPosts={initialPosts} categories={categories} />

        </div>
    );
}
