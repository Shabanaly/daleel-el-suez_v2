'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, Share2, Trash2, Edit2 } from 'lucide-react';
import ShareButton from '@/components/ui/ShareButton';
import { deletePost } from '@/lib/actions/posts';
import { useAuth } from '@/hooks/useAuth';
import { useDialog } from '@/components/providers/DialogProvider';
import CreatePostModal from './CreatePostModal';

interface PostHeaderActionsProps {
    post: any;
    origin: string;
    categories: any[];
}

export default function PostHeaderActions({
    post,
    origin,
    categories
}: PostHeaderActionsProps) {
    const { user } = useAuth();
    const { showAlert, showConfirm } = useDialog();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const isAuthor = user?.id === post.author_id;

    const handleDelete = async () => {
        showConfirm({
            title: 'حذف المنشور؟',
            message: 'هل أنت متأكد من حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذف جميع الصور والتعليقات المرتبطة به.',
            confirmLabel: 'حذف',
            type: 'error',
            onConfirm: async () => {
                setIsDeleting(true);
                try {
                    const result = await deletePost(post.id);
                    if (result.error) {
                        showAlert({
                            title: 'خطأ',
                            message: result.error,
                            type: 'error'
                        });
                    }
                } catch (error) {
                    console.error('Delete failed:', error);
                } finally {
                    setIsDeleting(false);
                }
            }
        });
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-xl hover:bg-background transition-colors text-text-muted opacity-50"
            >
                <MoreHorizontal className="w-6 h-6" />
            </button>

            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 z-10"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute left-0 top-full mt-2 w-48 bg-surface border border-border-subtle rounded-2xl shadow-xl z-20 overflow-hidden"
                        >
                            <ShareButton
                                title="دليل السويس - منشور في المجتمع"
                                text={post.content || 'اكتشف هذا المنشور في مجتمع السويس'}
                                url={`${origin}/community#post-${post.id}`}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-text-primary hover:bg-background transition-colors"
                                onSuccess={() => {
                                    setIsMenuOpen(false);
                                    showAlert({
                                        title: 'تم النسخ!',
                                        message: 'تم نسخ رابط المنشور للحافظة بنجاح. ✨',
                                        type: 'success'
                                    });
                                }}
                            >
                                <Share2 className="w-4 h-4" />
                                <span>مشاركة المنشور</span>
                            </ShareButton>

                            {isAuthor && (
                                <>
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            setIsEditModalOpen(true);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-text-primary hover:bg-background transition-colors border-t border-border-subtle/30"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        <span>تعديل المنشور</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            handleDelete();
                                        }}
                                        disabled={isDeleting}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors border-t border-border-subtle/30"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>{isDeleting ? 'جاري الحذف...' : 'حذف المنشور'}</span>
                                    </button>
                                </>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {isAuthor && (
                <CreatePostModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    categories={categories}
                    initialData={{
                        id: post.id,
                        content: post.content,
                        categoryId: post.category_id,
                        images: post.images || [],
                        publicIds: post.public_ids || []
                    }}
                />
            )}
        </div>
    );
}
