'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Heart, Share2 } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toggleLikePost } from '@/features/community/actions/posts.server';
import AuthRequiredModal from '@/features/auth/components/AuthRequiredModal';
import SectionHeader from '@/components/ui/SectionHeader';
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

    return (
        <section className="w-full max-w-7xl mx-auto px-4 pt-0 pb-8 md:pt-0 md:pb-16 overflow-hidden relative border-t border-border-subtle/30">
            {/* Decorative elements */}
            <div className="absolute top-1/4 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />

            <SectionHeader
                title="مجتمع السويس"
                subtitle="شارك معانا "
                icon={MessageSquare}
                href="/community"
                viewAllText="اكتشف المزيد"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post, idx) => {
                    const initialIsLiked = post.isLiked || false;
                    const isLiked = likedPosts[post.id] !== undefined ? likedPosts[post.id] : initialIsLiked;
                    const likesCount = (post.likes_count || 0) + (isLiked && !initialIsLiked ? 1 : 0) - (!isLiked && initialIsLiked ? 1 : 0);

                    return (
                        <Link
                            key={post.id}
                            href={`/community/posts/${post.id}`}
                            className="group/card"
                        >
                            <motion.div
                                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="bg-elevated/50 backdrop-blur-md border border-border-subtle/50 rounded-[32px] p-6 md:p-8 hover:border-primary/20 transition-all duration-300 shadow-sm flex flex-col h-full group-hover/card:bg-surface/80 group-hover/card:shadow-xl group-hover/card:translate-y-[-4px]"
                            >
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 ring-2 ring-primary/10 border border-border-subtle">
                                        {post.author?.avatar_url ? (
                                            <SafeImage
                                                src={post.author.avatar_url}
                                                alt={post.author.full_name || 'User'}
                                                fill
                                                className="object-cover"
                                                sizes="48px"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-base">
                                                {(post.author?.username || post.author?.full_name || '؟')[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-text-primary text-sm mb-0.5">
                                            {post.author?.full_name || 'مستشار سويسي'}
                                        </h4>
                                        <span className="text-[10px] text-text-muted opacity-60 font-bold">
                                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ar })}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-text-primary leading-relaxed mb-6 font-bold text-sm line-clamp-3">
                                    {post.content}
                                </p>

                                {/* Images Preview */}
                                {post.images && post.images.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 mb-6 pointer-events-none">
                                        {post.images.slice(0, 2).map((img, i: number) => (
                                            <div key={i} className={`relative rounded-2xl overflow-hidden border border-border-subtle/50 aspect-4/3 ${post.images?.length === 1 ? 'col-span-2' : ''}`}>
                                                <SafeImage src={img} alt="Preview" fill sizes="(max-width: 768px) 50vw, 300px" className="object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-auto flex items-center justify-between pt-5 border-t border-border-subtle/30">
                                    <div className="flex items-center gap-5">
                                        <button
                                            onClick={(e) => handleLike(e, post.id, initialIsLiked)}
                                            className={`flex items-center gap-2 transition-all active:scale-90 ${isLiked ? 'text-red-500' : 'text-text-muted hover:text-red-500'}`}
                                        >
                                            <Heart className={`w-4.5 h-4.5 ${isLiked ? 'fill-current' : ''}`} />
                                            <span className="text-xs font-black">{Math.max(0, likesCount)}</span>
                                        </button>
                                        <div
                                            onClick={handleInteraction}
                                            className="flex items-center gap-2 text-text-muted hover:text-primary transition-all cursor-pointer"
                                        >
                                            <MessageSquare className="w-4.5 h-4.5" />
                                            <span className="text-xs font-black">
                                                {typeof post.comments_count === 'number'
                                                    ? post.comments_count
                                                    : (Array.isArray(post.comments_count) ? post.comments_count[0]?.count || 0 : 0)}
                                            </span>
                                        </div>
                                    </div>
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <ShareButton
                                            title="دليل السويس - منشور في المجتمع"
                                            text={post.content}
                                            url={`${origin}/community/posts/${post.id}`}
                                            className="p-2 rounded-xl hover:bg-primary/5 text-text-muted hover:text-primary transition-all active:scale-90"
                                        >
                                            <Share2 className="w-4.5 h-4.5" />
                                        </ShareButton>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    );
                })}
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
