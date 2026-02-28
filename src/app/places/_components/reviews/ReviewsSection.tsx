'use client';

import { useState, useEffect } from 'react';
import { getReviews, deleteReview, getCurrentUserReview } from '@/lib/actions/reviews';
import { ReviewItem } from './ReviewItem';
import { ReviewForm } from './ReviewForm';
import { MessageSquare, Plus, X, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useDialog } from '@/components/providers/DialogProvider';
import { useAuthModal } from '@/hooks/useAuthModal';

interface ReviewsSectionProps {
    placeId: string;
    initialReviewsCount: number;
    initialReviews?: any[];
}

export function ReviewsSection({ placeId, initialReviewsCount, initialReviews }: ReviewsSectionProps) {
    const [reviews, setReviews] = useState<any[]>(initialReviews || []);
    const [totalCount, setTotalCount] = useState(initialReviewsCount);
    const [isLoading, setIsLoading] = useState(!initialReviews);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | undefined>();
    const [userReview, setUserReview] = useState<any | null>(null);
    const [editingReview, setEditingReview] = useState<any | null>(null);
    const [showAll, setShowAll] = useState(false);
    const { showAlert, showConfirm } = useDialog();
    const { openModal } = useAuthModal();

    const fetchReviews = async (silent = false) => {
        if (!silent) setIsLoading(true);
        const result = await getReviews(placeId, 1, 10);
        setReviews(result.reviews || []);
        setTotalCount(result.count || 0);

        // Check for current user's review
        const myReview = await getCurrentUserReview(placeId);
        setUserReview(myReview);

        if (!silent) setIsLoading(false);
    };

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getSession().then((res: any) => {
            const session = res.data?.session;
            setCurrentUserId(session?.user?.id);
        });

        setShowAll(false);
        fetchReviews(!!initialReviews);
    }, [placeId]);

    const handleReviewSuccess = () => {
        setIsFormOpen(false);
        setEditingReview(null);
        fetchReviews();
    };

    const handleDelete = async (reviewId: string) => {
        const result = await deleteReview(placeId);
        if (result.success) {
            fetchReviews();
            showAlert({
                title: 'تم الحذف',
                message: 'تم حذف تقييمك بنجاح.',
                type: 'success'
            });
        } else {
            showAlert({
                title: 'خطأ',
                message: result.error || 'حدث خطأ غير متوقع',
                type: 'error'
            });
        }
    };

    const handleEdit = (review: any) => {
        setEditingReview(review);
        setIsFormOpen(true);
    };

    return (
        <section className="mt-16 pt-12 border-t border-border-subtle/50">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-text-primary">آراء الزوار</h3>
                        <p className="text-xs text-text-muted font-bold opacity-60">إجمالي {totalCount} تقييم</p>
                    </div>
                </div>

                {userReview ? (
                    <button
                        onClick={() => handleEdit(userReview)}
                        className="flex items-center gap-2 px-5 h-11 rounded-xl bg-accent/10 text-accent text-sm font-black hover:bg-accent/20 transition-all border border-accent/20"
                    >
                        <Edit3 className="w-4 h-4" />
                        <span>تعديل تقييمي</span>
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            if (!currentUserId) {
                                openModal('تسجيل الدخول مطلوب', 'يجب تسجيل الدخول لتتمكن من إضافة تقييم لهذا المكان.');
                                return;
                            }
                            setEditingReview(null);
                            setIsFormOpen(true);
                        }}
                        className="flex items-center gap-2 px-5 h-11 rounded-xl bg-primary text-white text-sm font-black hover:bg-primary-hover active:scale-95 transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-4 h-4" />
                        <span>أضف تقييمك</span>
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isFormOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={(e) => e.target === e.currentTarget && setIsFormOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-lg bg-background rounded-3xl p-8 shadow-2xl relative border border-border-subtle"
                        >
                            <button
                                onClick={() => {
                                    setIsFormOpen(false);
                                    setEditingReview(null);
                                }}
                                className="absolute top-6 left-6 p-2 rounded-xl hover:bg-surface text-text-muted transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h3 className="text-2xl font-black text-text-primary mb-2 text-right">
                                {editingReview ? 'تعديل التقييم' : 'أكتب تقييماً'}
                            </h3>
                            <p className="text-text-muted text-sm font-bold mb-8 text-right opacity-70">
                                {editingReview ? 'قم بتحديث رأيك وتجربتك عن هذا المكان.' : 'شارك تجربتك مع الآخرين لمساعدتهم في اتخاذ القرار.'}
                            </p>

                            <ReviewForm
                                placeId={placeId}
                                onSuccess={handleReviewSuccess}
                                initialData={editingReview ? { rating: editingReview.rating, comment: editingReview.comment } : undefined}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {isLoading ? (
                <div className="flex flex-col gap-4 max-w-2xl mx-auto">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 rounded-3xl bg-surface/50 animate-pulse border border-border-subtle/20" />
                    ))}
                </div>
            ) : reviews.length > 0 ? (
                <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-20">
                    {(showAll ? reviews : reviews.slice(0, 2)).map((review) => (
                        <ReviewItem
                            key={review.id}
                            review={review}
                            currentUserId={currentUserId}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}

                    {!showAll && reviews.length > 2 && (
                        <div className="text-center mt-4">
                            <button
                                onClick={() => setShowAll(true)}
                                className="px-8 h-12 rounded-2xl bg-surface border border-border-subtle text-primary font-black text-sm hover:bg-elevated transition-all active:scale-95 shadow-sm"
                            >
                                عرض كل التقييمات ({reviews.length - 2} أخرى)
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-20 bg-surface/30 rounded-[40px] border border-dashed border-border-subtle/50 group hover:border-primary/30 transition-colors">
                    <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6 border border-primary/10 group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-8 h-8 text-primary/40" />
                    </div>
                    <h4 className="text-lg font-black text-text-primary mb-2">لا توجد تقييمات بعد</h4>
                    <p className="text-text-muted text-sm font-bold opacity-60 mb-8 max-w-64 mx-auto">
                        كن أول من يشارك تجربته مع هذا المكان ويساعد أهل السويس.
                    </p>
                    <button
                        onClick={() => {
                            if (!currentUserId) {
                                openModal('تسجيل الدخول مطلوب', 'يجب تسجيل الدخول لتتمكن من إضافة تقييم لهذا المكان.');
                                return;
                            }
                            setIsFormOpen(true);
                        }}
                        className="px-8 h-12 rounded-2xl border-2 border-primary text-primary font-black hover:bg-primary hover:text-white transition-all shadow-md active:scale-95"
                    >
                        أكتب أول تقييم
                    </button>
                </div>
            )}

            {totalCount > reviews.length && !isLoading && showAll && (
                <div className="mt-12 text-center">
                    <button className="text-sm font-black text-primary hover:underline" onClick={() => fetchReviews()}>
                        عرض المزيد من التقييمات
                    </button>
                </div>
            )}
        </section>
    );
}
