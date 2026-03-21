'use client';

import { useState, useMemo } from 'react';
import { Place } from '@/lib/types/places';
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import { removePlaceImage, setPlaceMainImage } from '@/lib/actions/business';
import { useRouter } from 'next/navigation';
import { Image as ImageIcon, X, Plus, CheckCircle2, Loader2, Trash2, Star, UploadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDialog } from '@/components/providers/DialogProvider';
import { Lightbox } from '@/components/common/Lightbox';

interface GalleryManagerProps {
    place: Place;
}

export function GalleryManager({ place }: GalleryManagerProps) {
    const router = useRouter();
    const { showAlert, showConfirm } = useDialog();
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Lightbox State
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    
    const { 
        images: allImages, 
        isUploading, 
        uploadFiles, 
        startUpload, 
        clearImages, 
        deleteImage: deleteFromHook 
    } = useImageUpload({
        folder: 'places',
        initialImages: place.images || [],
        initialPublicIds: place.publicIds || [],
        maxImages: 5 // Refined limit
    });

    const initialCount = (place.images || []).length;
    const pendingPreviews = useMemo(() => {
        return allImages.slice(initialCount);
    }, [allImages, initialCount]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            uploadFiles(e.target.files);
        }
    };

    const handleConfirmUpload = async () => {
        try {
            const result = await startUpload();
            if (result && result.urls) {
                showAlert({
                    title: 'تم الرفع بنجاح',
                    message: 'تم إضافة الصور الجديدة لمعرض الصور بنجاح.',
                    type: 'success'
                });
                router.refresh();
            }
        } catch (error: any) {
            showAlert({
                title: 'فشل الرفع',
                message: error.message || 'حدث خطأ غير متوقع أثناء عملية الرفع.',
                type: 'error'
            });
        }
    };

    const handleRemoveImage = async (index: number) => {
        showConfirm({
            title: 'حذف الصورة',
            message: 'هل أنت متأكد من رغبتك في حذف هذه الصورة نهائياً؟',
            confirmLabel: 'نعم، احذف',
            cancelLabel: 'إلغاء',
            onConfirm: async () => {
                setIsActionLoading(true);
                const result = await removePlaceImage(place.id, index);
                setIsActionLoading(false);
                
                if (result.success) {
                    router.refresh();
                } else {
                    showAlert({
                        title: 'فشل الحذف',
                        message: result.error || 'حدث خطأ أثناء محاولة حذف الصورة.',
                        type: 'error'
                    });
                }
            }
        });
    };

    const handleSetMain = async (imageUrl: string) => {
        setIsActionLoading(true);
        const result = await setPlaceMainImage(place.id, imageUrl);
        setIsActionLoading(false);
        
        if (result.success) {
            router.refresh();
        } else {
            showAlert({
                title: 'خطأ في التحديث',
                message: result.error || 'فشل تحديث الصورة الرئيسية.',
                type: 'error'
            });
        }
    };

    const handleImageClick = (index: number) => {
        setActiveImageIndex(index);
        setIsLightboxOpen(true);
    };

    return (
        <div className="space-y-8">
            {/* Status Bar for Pending Uploads */}
            <AnimatePresence>
                {pendingPreviews.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-3xl flex items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                <UploadCloud className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-emerald-950">صور جاهزة للرفع ({pendingPreviews.length})</h4>
                                <p className="text-[10px] font-bold text-emerald-700/60 leading-tight">اضغط على تأكيد ليتم حفظ الصورة في المعرض.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleConfirmUpload}
                                disabled={isUploading}
                                className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                            >
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                تأكيد الرفع
                            </button>
                            <button
                                onClick={clearImages}
                                disabled={isUploading}
                                className="px-5 py-2.5 bg-white text-emerald-500 rounded-xl text-xs font-black border border-emerald-500/20 hover:bg-emerald-50 transition-all"
                            >
                                إلغاء
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 gap-4">
                
                {/* Existing Images */}
                {place.images && place.images.map((url, index) => (
                    <motion.div 
                        key={url} 
                        layoutId={url}
                        className="relative aspect-square rounded-[28px] overflow-hidden bg-background border border-border-subtle group cursor-pointer"
                        onClick={() => handleImageClick(index)}
                    >
                        <img 
                            src={url} 
                            alt={`${place.name} ${index + 1}`} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                        
                        {/* Overlay Controls - Always Visible with Colors */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent transition-all duration-300">
                            <div className="absolute top-2 right-2 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button 
                                    onClick={() => handleRemoveImage(index)}
                                    disabled={isActionLoading}
                                    className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg active:scale-90"
                                    title="حذف الصورة"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                {index !== 0 && (
                                    <button 
                                        onClick={() => handleSetMain(url)}
                                        disabled={isActionLoading}
                                        className="p-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors shadow-lg active:scale-90"
                                        title="جعله الصورة الرئيسية"
                                    >
                                        <Star className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Badge for Main Image */}
                        {index === 0 && (
                            <div className="absolute top-2 left-2 bg-primary text-white text-[8px] font-black px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                الرئيسية
                            </div>
                        )}
                        
                        {isActionLoading && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                        )}
                    </motion.div>
                ))}

                {/* Pending Previews */}
                <AnimatePresence>
                    {pendingPreviews.map((previewUrl: string, index: number) => (
                        <motion.div 
                            key={previewUrl}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative aspect-square rounded-[28px] overflow-hidden border-2 border-dashed border-emerald-500/30 bg-emerald-500/5 group"
                        >
                            <img src={previewUrl} alt="Pending" className="w-full h-full object-cover opacity-60 grayscale blur-[1px]" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 gap-3">
                                {isUploading ? (
                                    <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => deleteFromHook(initialCount + index)}
                                            className="p-3 bg-red-500 text-white rounded-2xl hover:scale-110 active:scale-90 transition-all shadow-lg"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </>
                                )}
                            </div>
                            <div className="absolute bottom-3 left-3 right-3 bg-emerald-500/90 text-[9px] text-white font-black py-1.5 px-3 rounded-xl text-center shadow-lg">
                                جاهز للرفع
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Add Image Tile (only if less than 5 images total) */}
                {allImages.length < 5 && (
                    <label className="relative aspect-square rounded-[28px] border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group active:scale-95 shadow-sm">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <span className="block text-[11px] font-black text-primary uppercase tracking-tight">إضافة صور</span>
                            <span className="block text-[9px] font-bold text-primary/40 mt-0.5">تبقي لك {5 - allImages.length} صور</span>
                        </div>
                        <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleFileChange}
                            disabled={isUploading || isActionLoading}
                        />
                    </label>
                )}

                {/* Empty State if no images at all */}
                {allImages.length === 0 && (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-surface-elevated/40 rounded-[40px] border-2 border-dashed border-border-subtle/50">
                        <div className="w-16 h-16 rounded-3xl bg-surface-elevated flex items-center justify-center mb-5 text-text-muted/20">
                            <ImageIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-black text-text-primary mb-1.5">المعرض فارغ</h3>
                        <p className="text-xs font-bold text-text-muted max-w-xs leading-relaxed">أضف بعض الصور المميزة لمكانك لزيادة ثقة العملاء وجذب انتباههم.</p>
                    </div>
                )}
            </div>

            {/* Gallery Lightbox */}
            <Lightbox
                images={place.images || []}
                index={activeImageIndex}
                isOpen={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
            />
        </div>
    );
}
