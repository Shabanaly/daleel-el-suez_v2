'use client';

import { useEffect, useState, useRef } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { addComment, getPostComments, deleteComment } from '@/lib/actions/comments';
import { useDialog } from '@/components/providers/DialogProvider';
import AuthRequiredModal from '@/components/auth/AuthRequiredModal';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

interface CommunityCommentsProps {
    postId: string;
    isInline?: boolean;
}

export default function CommunityComments({ postId, isInline = false }: CommunityCommentsProps) {
    const { user } = useAuth();
    const { showAlert } = useDialog();
    const inputRef = useRef<HTMLInputElement>(null);

    const [comments, setComments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyTo, setReplyTo] = useState<any | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        if (postId) {
            fetchComments();
        }

        const handleFocus = () => {
            if (inputRef.current) {
                inputRef.current.focus();
                // When focusing, we want to scroll the parent, but let the browser 
                // handle the keyboard interaction natively with resizes-content
                setTimeout(() => {
                    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        };

        window.addEventListener('community:focus-comment-input', handleFocus);
        return () => window.removeEventListener('community:focus-comment-input', handleFocus);
    }, [postId]);

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const data = await getPostComments(postId);
            setComments(data);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting || !user || !postId) return;

        setIsSubmitting(true);
        try {
            const result = await addComment(postId, newComment, replyTo?.id);
            if (result.success) {
                setNewComment("");
                setReplyTo(null);
                await fetchComments();
            } else {
                showAlert({ title: "خطأ", message: result.error || "فشل إرسال التعليق", type: "error" });
            }
        } catch (error) {
            console.error('Failed to add comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            const result = await deleteComment(commentId, postId);
            if (result.success) {
                await fetchComments();
            } else {
                showAlert({
                    title: "خطأ في الحذف",
                    message: result.error || "حدث خطأ غير متوقع.",
                    type: "error"
                });
            }
        } catch (error) {
            console.error('Delete comment failed:', error);
        }
    };

    const mainComments = comments.filter(c => !c.parent_id);
    const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);

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
                        {mainComments.map((comment) => (
                            <div key={comment.id} className="space-y-4 px-2">
                                <CommentItem
                                    comment={comment}
                                    onReply={(c) => {
                                        if (!user) {
                                            setIsAuthModalOpen(true);
                                            return;
                                        }
                                        setReplyTo(c);
                                        inputRef.current?.focus();
                                    }}
                                    onDelete={handleDeleteComment}
                                    currentUserId={user?.id}
                                />

                                {getReplies(comment.id).length > 0 && (
                                    <div className="mr-8 pr-4 border-r-2 border-primary/10 space-y-4">
                                        {getReplies(comment.id).map((reply) => (
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
                    value={newComment}
                    onChange={setNewComment}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    user={user}
                    replyTo={replyTo}
                    onCancelReply={() => setReplyTo(null)}
                    onAuthRequired={() => setIsAuthModalOpen(true)}
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
