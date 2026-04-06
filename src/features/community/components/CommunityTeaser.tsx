'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Heart, Share2 } from 'lucide-react';
import CustomLink from '@/components/customLink/customLink';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toggleLikePost } from '@/features/community/actions/posts.server';
import AuthRequiredModal from '@/features/auth/components/AuthRequiredModal';
import { CommunityPost } from '@/features/community/types';
import { SafeImage } from '@/components/common/SafeImage';
import ShareButton from '@/components/ui/ShareButton';
import { useEffect, useState, useTransition } from 'react';

interface CommunityTeaserProps {
    posts: CommunityPost[];
}

export default function CommunityTeaser({ posts }: CommunityTeaserProps) {
    const { user } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
    const [origin, setOrigin] = useState('');
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setTimeout(() => setOrigin(window.location.origin), 0);
    }, []);

    // If no posts, don't render the section
    if (!posts || posts.length === 0) return null;

    const handleLike = async (e: React.MouseEvent, postId: string, initialIsLiked: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }

        const currentIsLiked = likedPosts[postId] !== undefined ? likedPosts[postId] : initialIsLiked;
        setLikedPosts(prev => ({ ...prev, [postId]: !currentIsLiked }));

        startTransition(async () => {
            try {
                await toggleLikePost(postId);
            } catch {
                setLikedPosts(prev => ({ ...prev, [postId]: currentIsLiked }));
            }
        });
    };

    const handleInteraction = (e: React.MouseEvent) => {
        if (!user) {
            e.preventDefault();
            e.stopPropagation();
            setIsAuthModalOpen(true);
        }
    };

    // We take exactly 3 posts to match the requested 3-column layout ideally
    const displayPosts = posts.slice(0, 3);

    return (
        <section className="w-full bg-background pt-4 pb-4 md:pt-8 md:pb-8 overflow-hidden relative">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                {/* Header Section */}
                <div className="w-full mb-8 md:mb-10 flex flex-col items-start gap-2">
                    <h2 className="text-3xl font-black tracking-tight text-text-primary md:text-4xl">
                        أحدث مشاركات المجتمع
                    </h2>
                    <p className="text-base text-text-muted font-medium w-full max-w-3xl">
                        تابع نقاشات أهل السويس، وتعرف على أحدث التقييمات والأخبار المحلية لحظة بلحظة.
                    </p>
                </div>

                {/* Posts Grid */}
                <div className="w-full grid grid-cols-1 gap-6 md:grid-cols-2">
                    {displayPosts.map((post) => {
                        const initialIsLiked = post.isLiked || false;
                        const isLiked = likedPosts[post.id] !== undefined ? likedPosts[post.id] : initialIsLiked;
                        const likesCount = (post.likes_count || 0) + (isLiked && !initialIsLiked ? 1 : 0) - (!isLiked && initialIsLiked ? 1 : 0);

                        return (
                            <motion.article 
                                key={post.id} 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="flex max-w-xl flex-col items-start justify-between group"
                            >
                                {/* Author Profile, Date and Tag */}
                                <div className="flex items-center gap-x-3 w-full mb-4">
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0 border border-border-subtle">
                                        {post.author?.avatar_url ? (
                                            <SafeImage
                                                alt={post.author.full_name || 'User'}
                                                src={post.author.avatar_url}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-primary font-black uppercase text-sm">
                                                {(post.author?.username || post.author?.full_name || '؟')[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-text-primary text-sm truncate">
                                            {post.author?.full_name || 'مستشار سويسي'}
                                        </p>
                                        <time dateTime={post.created_at} className="text-text-muted text-xs font-semibold block mt-0.5">
                                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ar })}
                                        </time>
                                    </div>
                                    
                                    <CustomLink
                                        href="/community"
                                        className="relative z-10 rounded-full bg-primary/10 px-3 py-1 font-bold text-primary hover:bg-primary/20 transition-colors text-xs shrink-0"
                                    >
                                        مجتمع السويس
                                    </CustomLink>
                                </div>

                                {/* Post Content (Replacing Title/Description) */}
                                <div className="relative w-full grow">
                                    <h3 className="text-lg/8 font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-4">
                                        <CustomLink href={`/community/posts/${post.id}`}>
                                            <span className="absolute inset-0 z-0" />
                                            {post.content}
                                        </CustomLink>
                                    </h3>
                                    
                                    {/* Preview Image if exists */}
                                    {post.images && post.images.length > 0 && (
                                        <div className="mt-4 relative w-full h-40 rounded-2xl overflow-hidden border border-border-subtle z-10 cursor-pointer">
                                            <SafeImage 
                                                src={post.images[0]} 
                                                alt="Post attachment" 
                                                fill 
                                                className="object-cover group-hover:scale-105 transition-transform duration-500" 
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Footer: Interactions */}
                                <div className="relative mt-6 flex items-center justify-start gap-6 w-full z-10 border-t border-border-subtle/50 pt-4">
                                    <button
                                        onClick={(e) => handleLike(e, post.id, initialIsLiked)}
                                        className={`flex items-center gap-1.5 transition-all active:scale-90 relative z-20 ${isLiked ? 'text-red-500' : 'text-text-muted hover:text-red-500'}`}
                                    >
                                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                        <span className="text-xs font-black">{Math.max(0, likesCount)}</span>
                                    </button>
                                    <div
                                        onClick={handleInteraction}
                                        className="flex items-center gap-1.5 text-text-muted hover:text-primary transition-all cursor-pointer relative z-20"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        <span className="text-xs font-black">
                                            {typeof post.comments_count === 'number'
                                                ? post.comments_count
                                                : (Array.isArray(post.comments_count) ? post.comments_count[0]?.count || 0 : 0)}
                                        </span>
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </div>

            <AuthRequiredModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                title="سجل دخولك للتفاعل"
                description="يجب تسجيل الدخول لتتمكن من التفاعل والتعليق مع مجتمع السويس."
            />
        </section>
    );
}

