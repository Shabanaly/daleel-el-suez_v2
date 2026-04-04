'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { addComment, getPostComments, deleteComment } from '@/features/community/actions/comments.server';
import { useDialog } from '@/components/providers/DialogProvider';
import AuthRequiredModal from '@/features/auth/components/AuthRequiredModal';
import CommentItem from './CommentItem';
import CommentForm, { CommentFormHandle } from './CommentForm';

import { CommunityComment } from '@/features/community/types';

interface CommunityCommentsProps {
    postId: string;
    isInline?: boolean;
    initialComments?: CommunityComment[];
}

export default function CommunityComments({ postId, isInline = false, initialComments }: CommunityCommentsProps) {
    const { user } = useAuth();
    const { showAlert } = useDialog();
    const inputRef = useRef<CommentFormHandle>(null);

    const [comments, setComments] = useState<CommunityComment[]>(initialComments || []);
    const [isLoading, setIsLoading] = useState(!initialComments);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyTo, setReplyTo] = useState<CommunityComment | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const fetchComments = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getPostComments(postId);
            setComments(data);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setIsLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        if (postId && !initialComments) {
            fetchComments();
        }

        const handleFocus = () => {
            if (inputRef.current) {
                inputRef.current.focus();
                setTimeout(() => {
                    const el = document.getElementById('comment-input');
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        };

        window.addEventListener('community:focus-comment-input', handleFocus);
        return () => window.removeEventListener('community:focus-comment-input', handleFocus);
    }, [postId, initialComments, fetchComments]);

    const handleSubmit = useCallback(async (content: string) => {
        if (!content.trim() || isSubmitting || !user || !postId) return;

        const commentText = content.trim();
        const parentId = replyTo?.id;

        // Optimistic UI update
        const optimisticComment = {
            id: 'temp-' + Date.now(),
            post_id: postId,
            content: commentText,
            parent_id: parentId || null,
            created_at: new Date().toISOString(),
            author_id: user.id,
            author: {
                id: user.id,
                username: user.user_metadata?.username || '...',
                full_name: user.user_metadata?.full_name || 'أنت',
                avatar_url: user.user_metadata?.avatar_url
            },
            isOptimistic: true
        };

        setComments(prev => [...prev, optimisticComment]);
        setReplyTo(null);
        setIsSubmitting(true);

        try {
            const result = await addComment(postId, commentText, parentId);
            if (result && result.success) {
                // Replace optimistic comment with real one
                setComments(prev =>
                    prev.map(c => c.id === optimisticComment.id ? result.comment : c)
                );
            } else {
                // Rollback on failure
                setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
                showAlert({ title: "خطأ", message: result.error || "فشل إرسال التعليق", type: "error" });
            }
        } catch (error) {
            // Rollback on error
            setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
            console.error('Failed to add comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [postId, user, isSubmitting, replyTo, showAlert]);

    const handleDeleteComment = useCallback(async (commentId: string) => {
        const commentToDelete = comments.find(c => c.id === commentId);
        if (!commentToDelete) return;

        // Optimistic delete
        setComments(prev => prev.filter(c => c.id !== commentId));

        try {
            const result = await deleteComment(commentId, postId);
            if (!result || !result.success) {
                // Rollback
                setComments(prev => [...prev, commentToDelete].sort((a, b) =>
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                ));
                showAlert({
                    title: "خطأ في الحذف",
                    message: result?.error || "حدث خطأ غير متوقع.",
                    type: "error"
                });
            }
        } catch (error) {
            // Rollback
            setComments(prev => [...prev, commentToDelete].sort((a, b) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            ));
            console.error('Delete comment failed:', error);
        }
    }, [postId, comments, showAlert]);

    const handleReply = useCallback((c: CommunityComment) => {
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }
        setReplyTo(c);
        inputRef.current?.focus();
    }, [user]);

    const handleCancelReply = useCallback(() => setReplyTo(null), []);
    const handleAuthRequired = useCallback(() => setIsAuthModalOpen(true), []);

    const repliesMap = useMemo(() => {
        const map = new Map<string, CommunityComment[]>();
        comments.forEach(c => {
            if (c.parent_id) {
                const list = map.get(c.parent_id) || [];
                list.push(c);
                map.set(c.parent_id, list);
            }
        });
        return map;
    }, [comments]);

    const mainComments = useMemo(() => comments.filter(c => !c.parent_id), [comments]);

    return (
        <div className={`flex flex-col ${isInline ? 'mt-8 pb-32' : 'h-full'}`}>
            {isInline && (
                <div className="flex items-center gap-3 mb-6 px-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-background border border-primary/20">
                        <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-text-primary tracking-tight">التعليقات</h2>
                        <p className="text-[10px] font-bold text-text-muted">{comments.length} تعليق</p>
                    </div>
                </div>
            )}

            <div className={`space-y-6 ${!isInline ? 'flex-1 overflow-y-auto' : ''}`}>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-20">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <span className="text-xs font-black">جاري التحميل...</span>
                    </div>
                ) : mainComments.length > 0 ? (
                    <div className="space-y-6 pb-6">
                        {mainComments.map((comment: CommunityComment) => (
                            <div key={comment.id} className="space-y-4 px-2">
                                <CommentItem
                                    comment={comment}
                                    onReply={handleReply}
                                    onDelete={handleDeleteComment}
                                    currentUserId={user?.id}
                                />

                                {repliesMap.has(comment.id) && (
                                    <div className="mr-8 pr-4 border-r-2 border-primary/10 space-y-4">
                                        {repliesMap.get(comment.id)?.map((reply: CommunityComment) => (
                                            <CommentItem
                                                key={reply.id}
                                                comment={reply}
                                                isReply
                                                onDelete={handleDeleteComment}
                                                currentUserId={user?.id}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 opacity-30 text-center">
                        <MessageCircle className="w-12 h-12 mb-4" />
                        <h3 className="text-lg font-black mb-1">لا توجد تعليقات بعد</h3>
                        <p className="text-xs font-bold">كن أول من يشارك برأيه!</p>
                    </div>
                )}
            </div>

            {/* Sticky Form for Inline View - Native Keyboard Handling */}
            <div
                className={`${isInline
                    ? 'fixed bottom-0 left-0 right-0 mx-2 pb-safe bg-surface/80 backdrop-blur-xl border-t border-border-subtle z-50 max-w-2xl rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)]'
                    : 'mx-[-12px] mt-4 border-t border-border-subtle bg-surface sticky bottom-0'}`}
            >
                <CommentForm
                    ref={inputRef}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    user={user}
                    replyTo={replyTo}
                    onCancelReply={handleCancelReply}
                    onAuthRequired={handleAuthRequired}
                />
            </div>

            <AuthRequiredModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                title="سجل دخولك للتفاعل"
                description="يجب تسجيل الدخول لتتمكن من إضافة تعليقات أو الرد على الآخرين."
            />
        </div>
    );
}

