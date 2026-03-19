'use client';

import { useState, useEffect } from 'react';
import { RatingStars } from './RatingStars';
import { submitReview } from '@/lib/actions/reviews';
import { Loader2, Send, Save } from 'lucide-react';

interface ReviewFormProps {
    placeId: string;
    onSuccess?: () => void;
    initialData?: {
        rating: number;
        comment: string;
    };
}

export function ReviewForm({ placeId, onSuccess, initialData }: ReviewFormProps) {
    const [rating, setRating] = useState(initialData?.rating || 0);
    const [comment, setComment] = useState(initialData?.comment || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Update state if initialData changes (e.g. when opening edit modal)
    useEffect(() => {
        if (initialData) {
            setRating(initialData.rating);
            setComment(initialData.comment);
        } else {
            setRating(0);
            setComment('');
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            setError('يرجى اختيار تقييم بالنجوم أولاً');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const result = await submitReview({
            placeId,
            rating,
            comment
        });

        setIsSubmitting(false);

        if (result && result.error) {
            setError(result.error);
        } else if (result) {
            if (!initialData) {
                setComment('');
                setRating(0);
            }
            onSuccess?.();
        }
    };

    const isEditing = !!initialData;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className={`flex flex-col items-center gap-4 py-6 rounded-3xl border transition-all duration-300 ${rating === 0 ? 'bg-background border-border-subtle' : 'bg-primary/5 border-primary/20'}`}>
                <span className={`text-sm font-black transition-colors ${rating === 0 ? 'text-text-muted' : 'text-text-primary'}`}>
                    {rating === 0 ? 'ما هو تقييمك للمكان؟' : `تقييمك: ${rating} من 5 نجوم`}
                </span>
                <RatingStars rating={rating} onChange={setRating} size="lg" />
            </div>

            <div className="space-y-2">
                <label htmlFor="comment" className="text-sm font-black text-text-primary px-2 block">رأيك بالتفصيل</label>
                <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="شاركنا تجربتك... ما الذي أعجبك؟ وما الذي يمكن تحسينه؟"
                    className="w-full min-h-[120px] p-4 rounded-2xl bg-surface border border-border-subtle focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-hidden text-sm font-medium resize-none"
                    required
                />
            </div>

            {error && (
                <p className="text-accent text-xs font-bold px-2">{error}</p>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 rounded-2xl bg-primary text-white font-black flex items-center justify-center gap-2 hover:bg-primary-hover active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all shadow-lg shadow-primary/20"
            >
                {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        {isEditing ? <Save className="w-5 h-5" /> : <Send className="w-5 h-5 rtl:rotate-180" />}
                        <span>{isEditing ? 'حفظ التعديلات' : 'نشر التقييم'}</span>
                    </>
                )}
            </button>
        </form>
    );
}
