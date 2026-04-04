'use client';

import { useState } from 'react';
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import { addGalleryImage } from '@/features/gallery/actions/gallery.server';
import { X, Upload, Loader2, Camera, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SafeImage } from '@/components/common/SafeImage';

interface UploadPhotoModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: string[];
}

export default function UploadPhotoModal({ isOpen, onClose, categories }: UploadPhotoModalProps) {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(categories[1] || 'معالم');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const {
        images,
        isBusy,
        error,
        uploadFiles,
        startUpload,
        deleteImage,
        clearImages,
        setError
    } = useImageUpload({
        folder: 'community_gallery',
        maxImages: 1,
        compression: { maxWidthOrHeight: 1920, quality: 0.8 }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (images.length === 0) {
            setError('برجاء اختيار صورة أولاً');
            return;
        }
        if (!title.trim()) {
            setError('برجاء إدخال عنوان للصورة');
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Upload to Cloudinary
            const { urls, publicIds } = await startUpload();
            
            // 2. Save to Supabase
            await addGalleryImage({
                url: urls[0],
                title,
                category,
                public_id: publicIds[0],
                // We could calculate aspect ratio here if needed
            });

            setSuccess(true);
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setTitle('');
        setSuccess(false);
        clearImages();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-surface w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl border border-white/10"
                >
                    <div className="p-6 border-b border-border-subtle flex items-center justify-between bg-primary/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <Camera className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-text-primary">شارك جمال السويس</h2>
                        </div>
                        <button 
                            onClick={handleClose}
                            className="p-2 rounded-full hover:bg-black/5 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-8">
                        {success ? (
                            <div className="py-12 flex flex-col items-center justify-center text-center">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6"
                                >
                                    <CheckCircle2 className="w-10 h-10" />
                                </motion.div>
                                <h3 className="text-2xl font-bold mb-2">تم رفع الصورة بنجاح!</h3>
                                <p className="text-text-muted">ستظهر صورتك في الجاليري بعد مراجعتها من قبل الإدارة</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Image Upload Area */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary block px-1">الصورة</label>
                                    {images.length > 0 ? (
                                        <div className="relative group rounded-3xl overflow-hidden aspect-video border-2 border-primary/20">
                                            <SafeImage 
                                                src={images[0]} 
                                                alt="Preview" 
                                                fill
                                                className="w-full h-full object-cover"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => deleteImage(0)}
                                                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div 
                                            onClick={() => document.getElementById('file-upload')?.click()}
                                            className="aspect-video rounded-3xl border-2 border-dashed border-border-subtle hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center text-text-muted group"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-surface-variant flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <Upload className="w-8 h-8 text-primary/60" />
                                            </div>
                                            <p className="font-bold">اضغط لاختيار صورة</p>
                                            <p className="text-xs opacity-60 mt-1">PNG, JPG حتى 5 ميجا</p>
                                            <input 
                                                id="file-upload"
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                onChange={(e) => e.target.files && uploadFiles(e.target.files)}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Title Input */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary block px-1">عنوان الصورة</label>
                                    <input 
                                        type="text" 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="مثلاً: غروب الشمس في بورتوفيق"
                                        className="w-full px-6 py-4 rounded-2xl bg-surface-variant/50 border border-border-subtle focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-hidden transition-all text-text-primary"
                                        required
                                    />
                                </div>

                                {/* Category Select */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary block px-1">التصنيف</label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.filter(c => c !== 'الكل').map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setCategory(cat)}
                                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                                                    category === cat 
                                                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                                    : 'bg-surface-variant text-text-secondary hover:bg-border-subtle'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-red-500 text-sm font-bold px-2 flex items-center gap-2">
                                        <X className="w-4 h-4" />
                                        {error}
                                    </p>
                                )}

                                <button 
                                    type="submit"
                                    disabled={isBusy || isSubmitting}
                                    className="w-full py-5 rounded-3xl bg-linear-to-r from-accent to-primary text-white font-bold text-lg shadow-xl shadow-accent/20 hover:shadow-accent/40 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-3"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            جاري الرفع...
                                        </>
                                    ) : (
                                        <>
                                            <Camera className="w-5 h-5" />
                                            رفع الصورة الآن
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
