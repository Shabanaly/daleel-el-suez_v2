'use client';

import { useEffect, useState } from 'react';
import { X, MessageCircle, Trash2, Loader2, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Image from 'next/image';
import { getBlogComments, deleteBlogComment } from '@/features/blog/actions/comments.server';
import { BlogComment } from '@/features/blog/types';
import { useDialog } from '@/components/providers/DialogProvider';
import { AdminBlogPost } from '@/features/admin/actions/blog';

interface AdminCommentsModalProps {
    post: AdminBlogPost | null;
    onClose: () => void;
}

export function AdminCommentsModal({ post, onClose }: AdminCommentsModalProps) {
    const { showConfirm } = useDialog();
    const [comments, setComments] = useState<BlogComment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (post) {
            setIsLoading(true);
            getBlogComments(post.id).then(data => {
                setComments(data);
                setIsLoading(false);
            }).catch(err => {
                console.error('Failed to load comments:', err);
                setIsLoading(false);
            });
        }
    }, [post]);

    if (!post) return null;

    const handleDelete = (commentId: string) => {
        showConfirm({
            title: 'حذف التعليق',
            message: 'هل أنت متأكد من حذف هذا التعليق؟ لا يمكن التراجع عن هذا الإجراء.',
            type: 'error',
            confirmLabel: 'حذف نهائي',
            onConfirm: async () => {
                setDeletingId(commentId);
                try {
                    const result = await deleteBlogComment(commentId, post.id, post.slug);
                    if (result.success) {
                        setComments(prev => prev.filter(c => c.id !== commentId));
                    }
                } catch (err) {
                    console.error('Failed to delete comment:', err);
                } finally {
                    setDeletingId(null);
                }
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-4 sm:p-6 overflow-hidden">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-background/40 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-xl h-full bg-elevated/80 backdrop-blur-2xl border-r border-border-subtle shadow-2xl rounded-3xl overflow-hidden animate-in slide-in-from-left duration-500 flex flex-col">
                
                {/* Header */}
                <div className="p-6 border-b border-border-subtle flex items-center justify-between bg-elevated/40 backdrop-blur-md z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-text-primary">تعليقات المقال</h2>
                            <p className="text-[10px] font-bold text-text-muted truncate max-w-[200px]">{post.title}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2.5 hover:bg-error/10 hover:text-error text-text-muted rounded-xl transition-all duration-300"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-text-muted/40">
                            <Loader2 className="w-10 h-10 animate-spin mb-4" />
                            <p className="text-sm font-black">جاري تحميل التعليقات...</p>
                        </div>
                    ) : comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment.id} className="glass-card p-4 rounded-2xl border-border-subtle/50 space-y-3 group hover:border-primary/20 transition-all duration-300">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-background border border-border-subtle relative">
                                            {comment.author?.avatar_url ? (
                                                <Image src={comment.author.avatar_url} alt="" fill sizes="32px" className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                                    <User className="w-4 h-4 text-primary/30" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-text-primary">
                                                {comment.author?.full_name || 'زائر من السويس'}
                                            </h4>
                                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-text-muted">
                                                <Calendar className="w-2.5 h-2.5" />
                                                {format(new Date(comment.created_at), 'dd MMM yyyy - HH:mm', { locale: ar })}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        disabled={deletingId === comment.id}
                                        className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        title="حذف التعليق"
                                    >
                                        {deletingId === comment.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                <p className="text-xs font-bold text-text-secondary leading-6 bg-background/30 p-3 rounded-xl border border-border-subtle/20">
                                    {comment.content}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30">
                            <MessageCircle className="w-16 h-16" />
                            <div>
                                <h3 className="text-xl font-black">لا توجد تعليقات</h3>
                                <p className="text-sm font-bold">هذا المقال لم يتلقَ أي تعليقات حتى الآن.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border-subtle bg-elevated/40 backdrop-blur-md">
                    <button 
                        onClick={onClose}
                        className="w-full py-3 bg-surface-secondary text-text-primary rounded-xl text-sm font-black hover:bg-surface-elevated transition-all border border-border-subtle"
                    >
                        إغلاق النافذة
                    </button>
                </div>
            </div>
        </div>
    );
}
