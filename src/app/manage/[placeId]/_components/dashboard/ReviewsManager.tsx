'use client';

import { useState } from 'react';
import { Star, MessageSquare, Send, CornerDownLeft, User, Calendar } from 'lucide-react';
import { Place } from '@/lib/types/places';
import { replyToReview } from '@/lib/actions/business';
import { motion } from 'framer-motion';
import { useDialog } from '@/components/providers/DialogProvider';
import { useRouter } from 'next/navigation';

interface ReviewsManagerProps {
    place: Place;
    reviews: any[];
}

export function ReviewsManager({ place, reviews }: ReviewsManagerProps) {
    const router = useRouter();
    const { showAlert } = useDialog();
    const [replyText, setReplyText] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReply = async (reviewId: string) => {
        if (!replyText.trim()) return;
        setIsSubmitting(true);
        const result = await replyToReview(reviewId, replyText);
        if (result.success) {
            // Local update of reviews list would be ideal, but revalidateTag in server action handles it on refresh
            // For smoother UX, we can just clear state and show success
            setReplyText('');
            setReplyingTo(null);
            router.refresh(); // Refresh to show new reply
        } else {
            showAlert({
                title: 'فشل الرد',
                message: result.error || 'حدث خطأ أثناء إرسال الرد',
                type: 'error'
            });
        }
        setIsSubmitting(false);
    };

    if (reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-3xl bg-surface-elevated flex items-center justify-center mb-4 text-text-muted/20">
                    <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-text-primary mb-1">لا توجد مراجعات بعد</h3>
                <p className="text-xs text-text-muted font-bold max-w-xs leading-relaxed">ستظهر هنا مراجعات العملاء فور كتابتها لتتمكن من الرد عليها.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6">
                {reviews.map((review, index) => (
                    <motion.div 
                        key={review.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-background/50 rounded-2xl p-5 border border-border-subtle/50"
                    >
                        {/* Reviewer Info */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 overflow-hidden">
                                    {review.user?.avatar_url ? (
                                        <img src={review.user.avatar_url} alt={review.user.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-5 h-5" />
                                    )}
                                </div>
                                <div>
                                    <div className="text-sm font-black text-text-primary">{review.user?.full_name || 'مستخدم مجهول'}</div>
                                    <div className="text-[10px] font-bold text-text-muted flex items-center gap-1 mt-0.5">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(review.created_at).toLocaleDateString('ar-EG')}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                <Star className="w-3 h-3 fill-current" />
                                <span className="text-xs font-black">{review.rating}</span>
                            </div>
                        </div>

                        {/* Review Text */}
                        <p className="text-sm font-bold text-text-primary leading-relaxed bg-surface/50 p-4 rounded-xl border border-border-subtle/30">
                            {review.comment}
                        </p>

                        {/* Reply Section */}
                        <div className="mt-4">
                            {review.reply_text ? (
                                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 relative">
                                    <div className="absolute -top-2 right-4 bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <CornerDownLeft className="w-2.5 h-2.5" />
                                        ردك على العميل
                                    </div>
                                    <p className="text-xs font-bold text-primary leading-relaxed mt-1">
                                        {review.reply_text}
                                    </p>
                                    <div className="text-[9px] font-bold text-primary/60 mt-2">
                                        تم الرد في {new Date(review.replied_at).toLocaleDateString('ar-EG')}
                                    </div>
                                </div>
                            ) : replyingTo === review.id ? (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-3"
                                >
                                    <textarea
                                        autoFocus
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="اكتب ردك هنا..."
                                        className="w-full bg-background border-2 border-primary/30 rounded-2xl p-4 text-sm font-bold focus:border-primary outline-none min-h-[100px] transition-all"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleReply(review.id)}
                                            disabled={isSubmitting || !replyText.trim()}
                                            className="flex-1 bg-primary text-white h-11 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                                            إرسال الرد
                                        </button>
                                        <button
                                            onClick={() => {
                                                setReplyingTo(null);
                                                setReplyText('');
                                            }}
                                            className="bg-surface-elevated text-text-muted px-4 h-11 rounded-xl text-xs font-black hover:bg-border-subtle transition-all"
                                        >
                                            إلغاء
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <button
                                    onClick={() => setReplyingTo(review.id)}
                                    className="w-full h-11 rounded-xl border-2 border-dashed border-primary/30 text-primary font-black text-xs hover:bg-primary/5 hover:border-primary transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    أضف رداً على هذا التقييم
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
