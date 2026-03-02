'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Heart, Share2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { toggleLikePost } from '@/lib/actions/posts';
import AuthRequiredModal from '@/components/auth/AuthRequiredModal';
import ShareButton from '@/components/ui/ShareButton';
import { useEffect, useState } from 'react';

interface CommunityTeaserProps {
    posts: any[];
}

export default function CommunityTeaser({ posts }: CommunityTeaserProps) {
    const { user } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    // If no posts, don't render the section
    if (!posts || posts.length === 0) return null;

    const handleLike = async (e: React.MouseEvent, postId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }

        const isLiked = likedPosts[postId] !== undefined ? likedPosts[postId] : false;
        setLikedPosts(prev => ({ ...prev, [postId]: !isLiked }));

        try {
            await toggleLikePost(postId);
        } catch (error) {
            setLikedPosts(prev => ({ ...prev, [postId]: isLiked }));
        }
    };

    const handleInteraction = (e: React.MouseEvent) => {
        if (!user) {
            e.preventDefault();
            e.stopPropagation();
            setIsAuthModalOpen(true);
        }
    };
    return (
        <section className="w-full max-w-5xl mx-auto px-4 py-24 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-1/4 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-4xl font-black text-text-primary tracking-tight">نبض مجتمع السويس</h2>
                        <p className="text-text-muted font-bold text-xs md:text-sm mt-1 opacity-70">شارك تجربتك واكتشف ما يقوله أهل المدينة</p>
                    </div>
                </div>
                <Link href="/community" className="px-6 py-3 rounded-full bg-surface border border-border-subtle hover:border-primary/30 text-sm font-bold text-text-primary transition-all flex items-center gap-2 group">
                    انضم للمناقشة <ArrowRight className="w-4 h-4 group-hover:translate-x-[-4px] transition-transform" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post, idx) => (
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
                                        <Image
                                            src={post.author.avatar_url}
                                            alt={post.author.full_name || 'User'}
                                            fill
                                            className="object-cover"
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
                                    {post.images.slice(0, 2).map((img: string, i: number) => (
                                        <div key={i} className={`relative rounded-2xl overflow-hidden border border-border-subtle/50 aspect-4/3 ${post.images?.length === 1 ? 'col-span-2' : ''}`}>
                                            <Image src={img} alt="Preview" fill className="object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-auto flex items-center justify-between pt-5 border-t border-border-subtle/30">
                                <div className="flex items-center gap-5">
                                    <button
                                        onClick={(e) => handleLike(e, post.id)}
                                        className={`flex items-center gap-2 transition-all active:scale-90 ${likedPosts[post.id] === true || post.isLiked ? 'text-accent' : 'text-text-muted hover:text-accent'}`}
                                    >
                                        <Heart className={`w-4.5 h-4.5 ${(likedPosts[post.id] === true || post.isLiked) ? 'fill-current' : ''}`} />
                                        <span className="text-xs font-black">{(post.likes_count || 0) + (likedPosts[post.id] ? 1 : 0)}</span>
                                    </button>
                                    <div
                                        onClick={handleInteraction}
                                        className="flex items-center gap-2 text-text-muted hover:text-primary transition-all cursor-pointer"
                                    >
                                        <MessageSquare className="w-4.5 h-4.5" />
                                        <span className="text-xs font-black">{post.commentCount || 0}</span>
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
                ))}
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
