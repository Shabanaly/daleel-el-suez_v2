'use client';

import { RatingStars } from './RatingStars';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { User, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useDialog } from '@/components/providers/DialogProvider';
import { SafeImage } from '@/components/common/SafeImage';
import { Review } from '@/features/places/types/reviews';

interface ReviewItemProps {
    review: Review;
    currentUserId?: string;
    onEdit?: (review: Review) => void;
    onDelete?: (reviewId: string) => void;
}

export function ReviewItem({ review, currentUserId, onEdit, onDelete }: ReviewItemProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const displayName = review.user?.full_name || review.user?.username || 'مستخدم';
    const isOwner = currentUserId === review.user_id;
    const { showConfirm } = useDialog();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="p-6 rounded-3xl bg-surface border border-border-subtle/30 shadow-xs hover:shadow-md transition-all duration-300 relative group">
            {isOwner && (
                <div className="absolute top-6 left-6" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 rounded-xl hover:bg-background/80 text-text-muted transition-colors"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute top-full left-0 mt-2 w-32 bg-elevated border border-border-subtle rounded-2xl shadow-xl z-10 overflow-hidden py-1">
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onEdit?.(review);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-black text-text-primary hover:bg-primary/10 hover:text-primary transition-colors text-right"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>تعديل</span>
                            </button>
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    showConfirm({
                                        title: 'حذف التقييم',
                                        message: 'هل أنت متأكد من حذف هذا التقييم؟ لا يمكن التراجع عن هذا الإجراء.',
                                        type: 'warning',
                                        confirmLabel: 'حذف',
                                        onConfirm: () => onDelete?.(review.id)
                                    });
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-black text-accent hover:bg-accent/10 transition-colors text-right"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>حذف</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-15 h-15 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                        {review.user?.avatar_url ? (
                            <SafeImage
                                src={review.user.avatar_url}
                                alt={displayName}
                                width={60}
                                height={60}
                                className="object-cover"
                            />
                        ) : (
                            <User className="w-10 h-10 text-primary" />
                        )}
                    </div>
                    <div>
                        <h4 className="font-black text-text-primary text-sm">{displayName}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            <RatingStars rating={review.rating} readonly size="xs" />
                            <span className="text-[10px] text-text-muted font-black opacity-40">
                                • {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: ar })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-text-primary text-[13px] leading-relaxed font-medium whitespace-pre-wrap">
                {review.comment}
            </p>
        </div>
    );
}
