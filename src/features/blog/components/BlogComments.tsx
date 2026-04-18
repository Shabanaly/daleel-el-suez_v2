'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getBlogComments, createBlogComment, deleteBlogComment } from '../actions/comments.server';
import { useDialog } from '@/components/providers/DialogProvider';
import CommentItem from './CommentItem';
import CommentForm, { CommentFormHandle } from './CommentForm';
import { BlogComment } from '../types';

interface BlogCommentsProps {
    postId: string;
    postSlug: string;
    initialComments?: BlogComment[];
}

export default function BlogComments({ postId, postSlug, initialComments }: BlogCommentsProps) {
    const { user } = useAuth();
    const { showAlert } = useDialog();
    const inputRef = useRef<CommentFormHandle>(null);

    const [comments, setComments] = useState<BlogComment[]>(initialComments || []);
    const [isLoading, setIsLoading] = useState(!initialComments);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchComments = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getBlogComments(postId);
            setComments(data);
        } catch (error) {
            console.error('Failed to fetch blog comments:', error);
        } finally {
            setIsLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        if (postId && !initialComments) {
            fetchComments();
        }
    }, [postId, initialComments, fetchComments]);

    const handleSubmit = async (content: string, honeypot?: string) => {
        if (!content.trim() || isSubmitting || !user || !postId) return;

        const commentText = content.trim();
        setIsSubmitting(true);

        // Optimistic UI update
        const userMetadata = user?.user_metadata || {};
        const optimisticComment: BlogComment = {
            id: 'temp-' + Date.now(),
            blog_post_id: postId,
            user_id: user.id,
            content: commentText,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            author: {
                id: user.id,
                full_name: userMetadata.full_name || userMetadata.first_name || 'أنت',
                avatar_url: userMetadata.avatar_url
            }
        };

        setComments(prev => [optimisticComment, ...prev]);

        try {
            const result = await createBlogComment(postId, postSlug, commentText, honeypot);

            if (result && result.success) {
                // Replace optimistic comment with real one
                setComments(prev =>
                    prev.map(c => c.id === optimisticComment.id ? result.comment as BlogComment : c)
                );
                inputRef.current?.reset();
            } else {
                // Rollback on failure
                setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
                showAlert({ title: "خطأ", message: result.error || "فشل إرسال التعليق", type: "error" });
            }
        } catch (error) {
            setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
            console.error('Failed to add blog comment:', error);
            showAlert({ title: "خطأ", message: "حدث خطأ غير متوقع", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        const commentToDelete = comments.find(c => c.id === commentId);
        if (!commentToDelete) return;

        // Optimistic delete
        setComments(prev => prev.filter(c => c.id !== commentId));

        try {
            const result = await deleteBlogComment(commentId, postId, postSlug);
            if (!result || !result.success) {
                // Rollback
                setComments(prev => [commentToDelete, ...prev].sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                ));
                showAlert({
                    title: "خطأ في الحذف",
                    message: result?.error || "حدث خطأ غير متوقع.",
                    type: "error"
                });
            }
        } catch (error) {
            setComments(prev => [commentToDelete, ...prev].sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ));
            console.error('Delete blog comment failed:', error);
        }
    };

    return (
        <section className="mt-16 pt-12 border-t border-border-subtle" id="comments">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center ring-4 ring-primary/5">
                    <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-text-primary tracking-tight">التعليقات</h2>
                    <p className="text-sm font-bold text-text-muted">{comments.length} تعليق على هذا المقال</p>
                </div>
            </div>

            <div className="max-w-3xl space-y-12">
                <CommentForm
                    ref={inputRef}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    user={user}
                    onAuthRequired={() => showAlert({ 
                        title: "تسجيل الدخول مطلوب", 
                        message: "يرجى تسجيل الدخول لتتمكن من إضافة تعليق.", 
                        type: "info" 
                    })}
                />

                <div className="space-y-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-text-muted/40">
                            <Loader2 className="w-10 h-10 animate-spin mb-4" />
                            <span className="text-sm font-black">جاري تحميل النقاشات...</span>
                        </div>
                    ) : comments.length > 0 ? (
                        <div className="divide-y divide-border-subtle/30 space-y-8">
                            {comments.map((comment) => (
                                <div key={comment.id} className="pt-8 first:pt-0">
                                    <CommentItem
                                        comment={comment}
                                        onDelete={handleDeleteComment}
                                        currentUserId={user?.id}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-surface-secondary/50 border border-dashed border-border-subtle rounded-3xl py-20 px-6 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-surface-secondary flex items-center justify-center mb-6">
                                <MessageCircle className="w-8 h-8 text-text-muted/30" />
                            </div>
                            <h3 className="text-xl font-black text-text-primary mb-2">لا توجد تعليقات بعد</h3>
                            <p className="text-sm font-bold text-text-muted max-w-xs leading-relaxed">
                                كن أول من يشارك في هذا النقاش ويترك بصمته على هذا المقال!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
