'use client';

import { useState } from 'react';
import Image from 'next/image';
import CommunityLightbox from './CommunityLightbox';
import { toggleLikePost } from '@/lib/actions/posts';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';

interface PostImagesGridProps {
    post: any;
    initialIsLiked?: boolean;
    initialLikesCount: number;
}

export default function PostImagesGrid({
    post,
    initialIsLiked = false,
    initialLikesCount
}: PostImagesGridProps) {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Local state for lightbox interactions (duplicated from PostActions for sync)
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likesCount, setLikesCount] = useState(initialLikesCount);

    const openLightbox = (index: number) => {
        setSelectedImageIndex(index);
        setIsLightboxOpen(true);
    };

    const handleLike = async () => {
        if (!user) return;
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikesCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));
        try {
            await toggleLikePost(post.id);
        } catch (e) {
            // Rollback
            setIsLiked(!newIsLiked);
            setLikesCount(prev => !newIsLiked ? prev + 1 : Math.max(0, prev - 1));
        }
    };

    const handleComment = () => {
        setIsLightboxOpen(false);
        const params = new URLSearchParams(searchParams.toString());
        params.set('postId', post.id);
        router.push(`/community?${params.toString()}`, { scroll: false });
    };

    if (!post.images || post.images.length === 0) return null;

    return (
        <>
            <div className={`px-4 md:px-6 pb-4 grid gap-1.5 ${post.images.length === 1 ? 'grid-cols-1' :
                post.images.length === 2 ? 'grid-cols-2' :
                    'grid-cols-2'
                }`}>
                {post.images.slice(0, 4).map((img: string, idx: number) => (
                    <div
                        key={idx}
                        onClick={() => openLightbox(idx)}
                        className={`relative rounded-xl overflow-hidden bg-background border border-border-subtle group cursor-pointer transition-transform active:scale-[0.98] ${post.images.length === 1 ? 'aspect-4/3 md:aspect-video' :
                            post.images.length === 3 && idx === 0 ? 'col-span-2 aspect-2/1' :
                                'aspect-square'
                            }`}
                    >
                        <Image
                            src={img}
                            alt={`Post Image ${idx + 1}`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        {idx === 3 && post.images.length > 4 && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center text-white font-black text-2xl">
                                +{post.images.length - 4}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <CommunityLightbox
                images={post.images}
                initialIndex={selectedImageIndex}
                isOpen={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
                post={post}
                isLiked={isLiked}
                likesCount={likesCount}
                onLike={handleLike}
                onComment={handleComment}
            />
        </>
    );
}
