'use client';

import { useState } from 'react';
import PostCard from './PostCard';
import CommentsSheet from './CommentsSheet';
import { Users } from 'lucide-react';

interface CommunityFeedProps {
    initialPosts: any[];
}

export default function CommunityFeed({ initialPosts }: CommunityFeedProps) {
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

    return (
        <>
            <div className="space-y-6">
                {initialPosts.length > 0 ? (
                    initialPosts.map((post: any) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onCommentClick={() => setSelectedPostId(post.id)}
                        />
                    ))
                ) : (
                    <div className="bg-surface border border-dashed border-border-subtle rounded-[32px] p-12 text-center">
                        <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-text-muted opacity-30" />
                        </div>
                        <h3 className="text-xl font-black text-text-primary mb-2">لا يوجد منشورات بعد</h3>
                        <p className="text-text-muted font-bold text-sm">كن أول من يشارك في هذا القسم!</p>
                    </div>
                )}
            </div>

            {/* Centralized Comments Sheet */}
            <CommentsSheet
                postId={selectedPostId}
                onClose={() => setSelectedPostId(null)}
            />
        </>
    );
}
