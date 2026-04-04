'use client';

import { MessageSquare, Trash2, CheckCircle, XCircle, User, MessageCircle, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useState } from 'react';
import { useDialog } from '@/components/providers/DialogProvider';

interface CommunityDataTableProps {
    posts: any[];
    isLoading: boolean;
    onUpdateStatus: (id: string, status: string) => Promise<{ success: boolean; error?: string }>;
    onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
    page?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
}

export function CommunityDataTable({ posts, isLoading, onUpdateStatus, onDelete, page, totalPages, onPageChange }: CommunityDataTableProps) {
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const { showConfirm } = useDialog();

    const handleStatusChange = async (id: string, status: string) => {
        setActionLoading(id);
        await onUpdateStatus(id, status);
        setActionLoading(null);
    };

    const handleDelete = (id: string) => {
        showConfirm({
            title: 'حذف المنشور',
            message: 'هل أنت متأكد من حذف هذا المنشور نهائياً وكل التعليقات المرتبطة به؟',
            type: 'confirm',
            confirmLabel: 'حذف',
            cancelLabel: 'إلغاء',
            onConfirm: async () => {
                setActionLoading(id);
                await onDelete(id);
                setActionLoading(null);
            }
        });
    };

    if (isLoading) {
        return (
            <div className="glass-card rounded-3xl shadow-xl p-12 flex justify-center items-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin glow-primary"></div>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="glass-card rounded-3xl shadow-xl p-16 text-center text-text-muted border-border-subtle/50">
                <MessageSquare className="w-16 h-16 mx-auto mb-6 opacity-20" />
                <p className="text-xl font-black text-text-primary tracking-tight">لا توجد منشورات</p>
                <p className="text-sm mt-2 font-medium">لم يتم العثور على أية منشورات في المجتمع حالياً.</p>
            </div>
        );
    }

    return (
        <div className="glass-card rounded-3xl shadow-2xl overflow-hidden border-border-subtle/50 bg-surface/50 backdrop-blur-xl">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead className="bg-elevated/40 text-text-secondary border-b border-border-subtle/50">
                        <tr>
                            <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px]">المنشور</th>
                            <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px] hidden md:table-cell">الكاتب والمنطقة</th>
                            <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px] hidden lg:table-cell">التفاعل</th>
                            <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px] hidden sm:table-cell">التاريخ</th>
                            <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px]">الحالة</th>
                            <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px] text-center">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle/30">
                        {posts.map((post) => (
                            <tr key={post.id} className="hover:bg-primary/5 transition-all duration-300 group">
                                {/* Content & Category */}
                                <td className="px-6 py-5">
                                    <div className="font-bold text-text-primary group-hover:text-primary transition-colors text-sm line-clamp-2 max-w-[300px] leading-relaxed">
                                        {post.content}
                                    </div>
                                    <div className="text-[10px] text-text-muted mt-2 font-black flex items-center gap-1.5">
                                        <span className="px-2 py-0.5 rounded-md bg-background border border-border-subtle group-hover:border-primary/20 transition-colors uppercase">
                                            {post.category?.name || 'بدون قسم'}
                                        </span>
                                        {post.images?.length > 0 && (
                                            <span className="text-primary flex items-center gap-1">
                                                <XCircle className="w-3 h-3 rotate-45" /> {post.images.length} صور
                                            </span>
                                        )}
                                    </div>
                                </td>

                                {/* Author & Role */}
                                <td className="px-6 py-5 hidden md:table-cell">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-elevated border border-border-subtle flex items-center justify-center text-[10px] font-black text-text-muted overflow-hidden">
                                            {post.author?.avatar_url ? (
                                                <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs font-bold text-text-secondary truncate">{post.author?.full_name || 'مستخدم'}</div>
                                            <div className="text-[10px] text-text-muted mt-0.5">@{post.author?.username || 'user'}</div>
                                        </div>
                                    </div>
                                </td>

                                {/* Stats */}
                                <td className="px-6 py-5 hidden lg:table-cell">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-text-muted">
                                            <Heart className="w-3.5 h-3.5 text-error/60" />
                                            {post.likes_count || 0}
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-text-muted">
                                            <MessageCircle className="w-3.5 h-3.5 text-primary/60" />
                                            {post.comments_count?.[0]?.count || 0}
                                        </div>
                                    </div>
                                </td>

                                {/* Date */}
                                <td className="px-6 py-5 hidden sm:table-cell text-text-muted text-[11px] font-bold">
                                    {format(new Date(post.created_at), 'dd MMM yyyy', { locale: ar })}
                                </td>

                                {/* Status */}
                                <td className="px-6 py-5 border-0">
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-tighter",
                                        post.status === 'active' ? 'bg-success/5 text-success border-success/20' : 
                                        'bg-error/5 text-error border-error/20'
                                    )}>
                                        <div className={cn("w-1.5 h-1.5 rounded-full", 
                                            post.status === 'active' ? 'bg-success' : 'bg-error'
                                        )} />
                                        {post.status === 'active' ? 'نشط' : 'مخفي'}
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-5 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        {actionLoading === post.id ? (
                                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                {post.status !== 'active' && (
                                                    <button
                                                        onClick={() => handleStatusChange(post.id, 'active')}
                                                        className="p-2 text-success hover:bg-success/10 rounded-xl transition-all hover:scale-110 active:scale-95 border border-transparent hover:border-success/20"
                                                        title="تفعيل"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {post.status === 'active' && (
                                                    <button
                                                        onClick={() => handleStatusChange(post.id, 'hidden')}
                                                        className="p-2 text-warning hover:bg-warning/10 rounded-xl transition-all hover:scale-110 active:scale-95 border border-transparent hover:border-warning/20"
                                                        title="إخفاء"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-xl transition-all hover:scale-110 active:scale-95 border border-transparent hover:border-error/20"
                                                    title="حذف نهائي"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages !== undefined && totalPages > 1 && onPageChange && page !== undefined && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-border-subtle/30 bg-elevated/10 gap-4">
                    <div className="text-xs font-black text-text-muted uppercase tracking-widest">
                        صفحة <span className="text-primary">{page}</span> من <span className="text-text-primary">{totalPages}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 1 || isLoading}
                            className="px-5 py-2.5 rounded-2xl border border-border-subtle hover:border-primary/50 bg-background/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-black uppercase text-text-secondary hover:text-primary active:scale-95"
                        >
                            السابق
                        </button>
                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={page === totalPages || isLoading}
                            className="px-5 py-2.5 rounded-2xl border border-border-subtle hover:border-primary/50 bg-background/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-black uppercase text-text-secondary hover:text-primary active:scale-95"
                        >
                            التالي
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}
