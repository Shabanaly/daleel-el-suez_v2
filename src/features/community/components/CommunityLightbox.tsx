'use client';

import { useState, useEffect } from 'react';
import LightboxComponent from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { useDialog } from '@/components/providers/DialogProvider';
import ShareButton from '@/components/ui/ShareButton';
import { CommunityPost } from '@/features/community/types';

// CSS imports
import 'yet-another-react-lightbox/styles.css';

interface CommunityLightboxProps {
    images: string[];
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
    post: CommunityPost;
    isLiked: boolean;
    likesCount: number;
    onLike: (e: React.MouseEvent) => void;
    onComment: () => void;
}

export default function CommunityLightbox({
    images,
    initialIndex,
    isOpen,
    onClose,
    post,
    isLiked,
    likesCount,
    onLike,
    onComment
}: CommunityLightboxProps) {
    const { showAlert } = useDialog();
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
    }, []);

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    // Format images for the lightbox
    const slides = images.map((src) => ({ src }));

    if (!isOpen) return null;

    return (
        <LightboxComponent
            open={isOpen}
            close={onClose}
            index={currentIndex}
            slides={slides}
            plugins={[Zoom]}
            on={{
                view: ({ index }) => setCurrentIndex(index),
            }}
            render={{
                buttonPrev: images.length <= 1 ? () => null : undefined,
                buttonNext: images.length <= 1 ? () => null : undefined,
                controls: () => (
                    <div
                        className="absolute bottom-0 inset-x-0 p-6 md:p-10 bg-linear-to-t from-black/80 to-transparent pt-20 flex flex-col items-center gap-4 z-1000 pointer-events-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {post.content && (
                            <p className="text-white/90 text-sm font-bold max-w-2xl text-center line-clamp-2 md:line-clamp-none pointer-events-auto mb-2">
                                {post.content}
                            </p>
                        )}

                        <div className="flex items-center gap-6 pointer-events-auto">
                            <button
                                onClick={onLike}
                                className={`flex items-center gap-2 px-6 h-14 rounded-2xl transition-all active:scale-90 border ${isLiked
                                    ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20'
                                    : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                                    }`}
                            >
                                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                                <span className="text-base font-black">{likesCount}</span>
                            </button>

                    <button
                        onClick={onComment}
                        className="flex items-center gap-2 px-6 h-14 rounded-2xl bg-white/10 text-white border border-white/10 hover:bg-white/20 transition-all active:scale-90 shadow-lg"
                    >
                        <MessageCircle className="w-6 h-6" />
                        <span className="text-base font-black">
                            {Array.isArray(post.comments_count) ? post.comments_count[0]?.count || 0 : (post.comments_count || 0)}
                        </span>
                    </button>

                            <ShareButton
                                title="دليل السويس - منشور في المجتمع"
                                text={post.content || 'اكتشف هذا المنشور في مجتمع السويس'}
                                url={`${origin}/community#post-${post.id}`}
                                className="flex items-center gap-2 px-6 h-14 rounded-2xl bg-white/10 text-white border border-white/10 hover:bg-white/20 transition-all active:scale-90 shadow-lg"
                                onSuccess={() => showAlert({
                                    title: 'تم النسخ!',
                                    message: 'تم نسخ رابط المنشور للحافظة بنجاح. ✨',
                                    type: 'success'
                                })}
                            >
                                <Share2 className="w-6 h-6" />
                            </ShareButton>
                        </div>
                    </div>
                )
            }}
            zoom={{
                maxZoomPixelRatio: 3,
            }}
            styles={{
                container: { backgroundColor: "rgba(0, 0, 0, 0.95)" },
                root: {
                    "--yarl__color_backdrop": "rgba(0, 0, 0, 0.95)",
                } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
            }}
        />
    );
}
