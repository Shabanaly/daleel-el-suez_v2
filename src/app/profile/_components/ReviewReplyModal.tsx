'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Star, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { replyToReview } from '@/lib/actions/business';

interface ReviewReplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    reviews: any[];
    placeName: string;
}

export function ReviewReplyModal({ isOpen, onClose, reviews, placeName }: ReviewReplyModalProps) {
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReply = async (reviewId: string) => {
        if (!replyText.trim()) return;
        
        setIsSubmitting(true);
        const result = await replyToReview(reviewId, replyText);
        
        if (result.success) {
            alert('تم إرسال ردك بنجاح');
            setReplyText('');
            setReplyingTo(null);
            // In a real app, you'd want to refresh the local state or the page
            onClose(); 
        } else {
            alert(result.error || 'فشل إرسال الرد');
        }
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-surface border border-border-subtle rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-border-subtle flex items-center justify-between bg-elevated/50">
                        <div>
                            <h2 className="text-xl font-black text-text-primary">مراجعات {placeName}</h2>
                            <p className="text-xs text-text-muted font-medium mt-1">قم بالرد على زبائنك لتعزيز ثقتهم</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-surface border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <div key={review.id} className="bg-elevated/30 border border-border-subtle/50 rounded-3xl p-5">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-surface border border-border-subtle flex items-center justify-center shrink-0 overflow-hidden">
                                            {review.user?.avatar_url ? (
                                                <Image src={review.user.avatar_url} alt="User" width={48} height={48} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-6 h-6 text-text-muted/40" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-black text-text-primary">{review.user?.full_name || 'مستخدم في الدليل'}</h4>
                                                <div className="flex items-center gap-1 text-amber-500 font-black text-xs">
                                                    <Star className="w-3 h-3 fill-current" />
                                                    {review.rating}
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-text-muted font-medium">
                                                {new Date(review.created_at).toLocaleDateString('ar-EG', { dateStyle: 'long' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-surface/50 rounded-2xl p-4 border border-border-subtle/30 text-sm text-text-primary leading-relaxed font-medium mb-4">
                                        {review.comment}
                                    </div>

                                    {/* Existing Reply */}
                                    {review.reply_text && (
                                        <div className="bg-primary/5 border-r-4 border-primary rounded-xl p-4 mb-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <MessageSquare className="w-3 h-3 text-primary" />
                                                <span className="text-[10px] font-black text-primary uppercase tracking-wider">ردك</span>
                                                <span className="text-[10px] text-text-muted font-medium">
                                                    {review.replied_at && new Date(review.replied_at).toLocaleDateString('ar-EG')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-text-primary font-bold">
                                                {review.reply_text}
                                            </p>
                                        </div>
                                    )}

                                    {/* Reply Form */}
                                    {replyingTo === review.id ? (
                                        <div className="mt-4 space-y-3">
                                            <textarea 
                                                autoFocus
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="اكتب ردك هنا..."
                                                className="w-full min-h-[100px] bg-surface border-2 border-primary/20 focus:border-primary rounded-2xl p-4 text-sm font-medium outline-hidden transition-all"
                                            />
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    disabled={isSubmitting || !replyText.trim()}
                                                    onClick={() => handleReply(review.id)}
                                                    className="flex-1 h-12 rounded-2xl bg-primary text-white font-black flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                                                >
                                                    {isSubmitting ? (
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Send className="w-4 h-4" />
                                                            إرسال الرد
                                                        </>
                                                    )}
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setReplyingTo(null);
                                                        setReplyText('');
                                                    }}
                                                    className="h-12 px-6 rounded-2xl bg-elevated text-text-muted font-black hover:text-text-primary transition-colors"
                                                >
                                                    إلغاء
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        !review.reply_text && (
                                            <button 
                                                onClick={() => setReplyingTo(review.id)}
                                                className="w-full h-12 rounded-2xl bg-surface border border-border-subtle text-primary font-black flex items-center justify-center gap-2 hover:bg-primary/5 transition-all"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                الرد على هذا التقييم
                                            </button>
                                        )
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-elevated rounded-full flex items-center justify-center mx-auto mb-4 border border-border-subtle">
                                    <Star className="w-8 h-8 text-text-muted/20" />
                                </div>
                                <h4 className="text-lg font-black text-text-primary">لا توجد مراجعات بعد</h4>
                                <p className="text-sm text-text-muted mt-1">سيتم إظهار مراجعات زبائنك هنا بمجرد وصولها</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
