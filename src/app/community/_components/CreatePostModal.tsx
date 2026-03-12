'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, User, ChevronDown, ImageIcon, Plus, Check } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import { createPost, updatePost } from '@/lib/actions/posts';
import CategoryIcon from './CategoryIcon';

interface Category {
    id: number;
    name: string;
    icon: string;
}

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    initialData?: {
        id: string;
        content: string;
        categoryId: number;
        images: string[];
        publicIds?: string[];
    };
}

export default function CreatePostModal({ isOpen, onClose, categories, initialData }: CreatePostModalProps) {
    const { user } = useAuth();
    const [content, setContent] = useState(initialData?.content || '');
    const [selectedCatId, setSelectedCatId] = useState<number | null>(initialData?.categoryId || categories[0]?.id || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const {
        images,
        isBusy,
        uploadFiles,
        startUpload,
        deleteImage,
        clearImages,
    } = useImageUpload({
        folder: 'community_posts',
        maxImages: 10,
        initialImages: initialData?.images || [],
        initialPublicIds: initialData?.publicIds || [],
        compression: {
            maxWidthOrHeight: 1280,
            quality: 0.8
        }
    });

    const selectedCategory = categories.find(c => c.id === selectedCatId) || categories[0];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !selectedCatId || isSubmitting || isBusy) return;

        setIsSubmitting(true);

        try {
            const uploadResult = await startUpload();

            if (initialData) {
                // Update existing post
                const result = await updatePost(initialData.id, {
                    content,
                    categoryId: selectedCatId,
                    images: uploadResult.urls,
                    publicIds: uploadResult.publicIds
                });

                if (result.success) {
                    onClose();
                }
            } else {
                // Create new post
                const result = await createPost({
                    content,
                    categoryId: selectedCatId,
                    images: uploadResult.urls,
                    publicIds: uploadResult.publicIds
                });

                if (result.success) {
                    setContent('');
                    clearImages();
                    onClose();
                }
            }
        } catch (error) {
            console.error('Post operation failed:', error);
        } finally {
            setIsSubmitting(true); // Keep loader until closing
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-200"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        dir="rtl"
                        className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[90vh] bg-surface rounded-2xl z-201 shadow-2xl flex flex-col overflow-hidden border border-border-subtle"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 flex items-center justify-between border-b border-border-subtle/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Plus className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-black text-text-primary tracking-tight">
                                    {initialData ? 'تعديل المنشور' : 'إضافة منشور جديد'}
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-background border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-primary transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide no-scrollbar">
                            {/* User Info & Category Picker (Dropdown Menu) */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden relative ring-2 ring-background border border-primary/20">
                                        {user.user_metadata?.avatar_url ? (
                                            <Image src={user.user_metadata.avatar_url} alt="User" fill sizes="40px" className="object-cover" />
                                        ) : (
                                            <User className="w-5 h-5 m-auto text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-text-primary">{user.user_metadata?.full_name || 'مستشار سويسي'}</h4>
                                        <p className="text-[10px] font-bold text-text-muted">ينشر الآن في المجتمع</p>
                                    </div>
                                </div>

                                {/* Custom Dropdown Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border-subtle text-xs font-black text-text-primary hover:border-primary transition-all"
                                    >
                                        <CategoryIcon name={selectedCategory?.icon} className="w-4 h-4" />
                                        <span>{selectedCategory?.name}</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute left-0 top-full mt-2 w-48 bg-elevated border border-border-subtle rounded-2xl shadow-xl z-10 overflow-hidden"
                                            >
                                                {categories.map((cat) => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => {
                                                            setSelectedCatId(cat.id);
                                                            setIsMenuOpen(false);
                                                        }}
                                                        className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold transition-colors hover:bg-primary/5 ${selectedCatId === cat.id ? 'bg-primary/10 text-primary' : 'text-text-primary'}`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <CategoryIcon name={cat.icon} className="w-4 h-4" />
                                                            <span>{cat.name}</span>
                                                        </div>
                                                        {selectedCatId === cat.id && <Check className="w-3 h-3" />}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Text Input */}
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="بماذا تفكر يا سويسي؟ اكتب هنا تفاصيل منشورك..."
                                className="w-full h-40 bg-background border-none text-lg font-bold placeholder:text-text-muted/30 focus:ring-0 outline-none resize-none px-0"
                                autoFocus
                            />

                            {/* Image Grid Preview */}
                            {images.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-4 border-t border-border-subtle/30">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-border-subtle shadow-sm group">
                                            <Image src={img} alt="Preview" fill sizes="(max-width: 640px) 33vw, 150px" className="object-cover" />
                                            <button
                                                onClick={() => deleteImage(idx)}
                                                className="absolute top-1 right-1 w-6 h-6 rounded-lg bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-border-subtle/30 bg-surface flex items-center justify-between">
                            {/* Single Image Button */}
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => uploadFiles(e.target.files!)}
                                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                    disabled={isBusy || images.length >= 10}
                                />
                                <button className="flex items-center gap-2 px-5 h-12 rounded-2xl bg-background border border-border-subtle text-text-muted hover:text-primary hover:border-primary transition-all font-black text-sm">
                                    {isBusy ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                    ) : (
                                        <ImageIcon className="w-5 h-5" />
                                    )}
                                    <span>إضافة صور</span>
                                </button>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={!content.trim() || isSubmitting || isBusy}
                                className="px-10 h-12 rounded-2xl bg-primary text-white font-black text-sm flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                                <span>{initialData ? 'حفظ التعديلات' : 'نشر المنشور'}</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
