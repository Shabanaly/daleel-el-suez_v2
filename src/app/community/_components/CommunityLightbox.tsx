'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Share2 } from 'lucide-react';
import { useDialog } from '@/components/providers/DialogProvider';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import ShareButton from '@/components/ui/ShareButton';

interface CommunityLightboxProps {
    images: string[];
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
    post: any;
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

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            document.body.style.overflow = 'hidden';

            // Handle back button on mobile
            window.history.pushState({ lightbox: true }, '');
            const handlePopState = () => {
                onClose();
            };
            window.addEventListener('popstate', handlePopState);

            return () => {
                window.removeEventListener('popstate', handlePopState);
                document.body.style.overflow = 'auto';
            };
        }
    }, [isOpen, initialIndex, onClose]);

    const handleManualClose = () => {
        if (window.history.state?.lightbox) {
            window.history.back();
        } else {
            onClose();
        }
    };

    const next = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-400 flex flex-col bg-black/95 backdrop-blur-xl select-none"
                onClick={handleManualClose}
            >
                {/* Header / Close */}
                <div className="absolute top-0 inset-x-0 h-20 flex items-center justify-between px-6 z-10 pointer-events-none">
                    <div className="text-white/60 font-black text-sm tracking-widest pointer-events-auto">
                        {currentIndex + 1} / {images.length}
                    </div>
                    <button
                        onClick={handleManualClose}
                        className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10 pointer-events-auto group"
                    >
                        <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: -20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.4}
                        onDragEnd={(_, info) => {
                            const swipeThreshold = 50;
                            if (info.offset.x > swipeThreshold) {
                                prev();
                            } else if (info.offset.x < -swipeThreshold) {
                                next();
                            }
                        }}
                        className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-pan-y"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative w-full h-full max-w-5xl max-h-[80vh] flex items-center justify-center">
                            <Image
                                src={images[currentIndex]}
                                alt={`Post Image ${currentIndex + 1}`}
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </motion.div>

                    {/* Desktop Navigation */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={prev}
                                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/5 hidden md:flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10 hover:scale-110 active:scale-95 z-20"
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>
                            <button
                                onClick={next}
                                className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/5 hidden md:flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10 hover:scale-110 active:scale-95 z-20"
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>
                        </>
                    )}
                </div>

                {/* Interaction Footer Overlay */}
                <div
                    className="absolute bottom-0 inset-x-0 p-6 md:p-10 bg-linear-to-t from-black/80 to-transparent pt-20 flex flex-col items-center gap-4 z-10 pointer-events-none"
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
                            <span className="text-base font-black">{post.comments_count?.[0]?.count || 0}</span>
                        </button>

                        <ShareButton
                            title="دليل السويس - منشور في المجتمع"
                            text={post.content || 'اكتشف هذا المنشور في مجتمع السويس'}
                            url={`${window.location.origin}/community#post-${post.id}`}
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
            </motion.div>
        </AnimatePresence>
    );
}
