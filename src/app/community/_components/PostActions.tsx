'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { toggleLikePost } from '@/lib/actions/posts';
import { useAuth } from '@/hooks/useAuth';
import AuthRequiredModal from '@/components/auth/AuthRequiredModal';
import ShareButton from '@/components/ui/ShareButton';
import { useDialog } from '@/components/providers/DialogProvider';
import { useRouter, useSearchParams } from 'next/navigation';

interface PostActionsProps {
    postId: string;
    initialLikesCount: number;
    initialIsLiked?: boolean;
    commentsCount: number;
    postContent?: string;
    origin: string;
}

export default function PostActions({
    postId,
    initialLikesCount,
    initialIsLiked = false,
    commentsCount,
    postContent,
    origin
}: PostActionsProps) {
    const { user } = useAuth();
    const { showAlert } = useDialog();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likesCount, setLikesCount] = useState(initialLikesCount);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }

        // Optimistic UI
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikesCount((prev) => newIsLiked ? prev + 1 : Math.max(0, prev - 1));

        try {
            const result = await toggleLikePost(postId);
            if (result.error) {
                // Rollback
                setIsLiked(!newIsLiked);
                setLikesCount((prev) => !newIsLiked ? prev + 1 : Math.max(0, prev - 1));
            }
        } catch (error) {
            // Rollback
            setIsLiked(!newIsLiked);
            setLikesCount((prev) => !newIsLiked ? prev + 1 : Math.max(0, prev - 1));
        }
    };

    const handleCommentClick = (e: React.MouseEvent) => {
        e.preventDefault();
        // Use URL params for comments sheet to make it SSR compatible & shareable
        const params = new URLSearchParams(searchParams.toString());
        params.set('postId', postId);
        router.push(`/community?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="px-6 py-4 border-t border-border-subtle/50 flex items-center justify-between">
            <div className="flex items-center gap-6">
                <button
                    onClick={handleLike}
                    className={`group flex items-center gap-2 transition-all active:scale-90 ${isLiked ? 'text-accent' : 'text-text-muted opacity-80 hover:text-accent'
                        }`}
                >
                    <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm font-black">{likesCount}</span>
                </button>

                <button
                    onClick={handleCommentClick}
                    className="flex items-center gap-2 text-text-muted opacity-80 hover:text-primary transition-all active:scale-90"
                >
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-sm font-black">{commentsCount}</span>
                </button>
            </div>

            <ShareButton
                title="دليل السويس - منشور في المجتمع"
                text={postContent || 'اكتشف هذا المنشور في مجتمع السويس'}
                url={`${origin}/community#post-${postId}`}
                className="flex items-center gap-2 p-2 px-4 rounded-xl hover:bg-primary/5 text-text-muted transition-all active:scale-90"
                onSuccess={() => showAlert({
                    title: 'تم بنجاح!',
                    message: 'تم نسخ رابط المنشور للمشاركة. ✨',
                    type: 'success'
                })}
            >
                <Share2 className="w-5 h-5 group-hover:text-primary transition-colors" />
                <span className="text-sm font-bold group-hover:text-primary transition-colors">مشاركة</span>
            </ShareButton>

            <AuthRequiredModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                title="تسجيل الدخول مطلوب"
                description="يجب تسجيل الدخول للتفاعل مع المنشورات والمجتمع"
            />
        </div>
    );
}
