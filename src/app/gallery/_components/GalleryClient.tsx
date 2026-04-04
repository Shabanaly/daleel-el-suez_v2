'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Grid3X3, Image as ImageIcon, Plus, ArrowUpRight } from 'lucide-react';
import { SafeImage } from '@/components/common/SafeImage';
import Image from 'next/image';
import { Lightbox } from '@/components/common/Lightbox';
import { GalleryImage, incrementImageViews } from '@/features/gallery/actions/gallery.server';
import UploadPhotoModal from '@/features/gallery/components/UploadPhotoModal';
import { useRouter, useSearchParams } from 'next/navigation';

interface GalleryClientProps {
    initialImages: GalleryImage[];
    categories: string[];
    initialCategory?: string;
}

export default function GalleryClient({ initialImages, categories, initialCategory = 'الكل' }: GalleryClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);

    // Filter images based on selected category
    const filteredImages = useMemo(() => {
        if (selectedCategory === 'الكل') return initialImages;
        return initialImages.filter(img => img.category === selectedCategory);
    }, [initialImages, selectedCategory]);

    const openLightbox = (index: number) => {
        setPhotoIndex(index);
        setLightboxOpen(true);
        
        // Track view
        const img = filteredImages[index];
        if (img && img.id) {
            const lastViewKey = `vg_view_${img.id}`;
            const lastView = localStorage.getItem(lastViewKey);
            const today = new Date().toDateString();
            
            if (lastView !== today) {
                localStorage.setItem(lastViewKey, today);
                incrementImageViews(img.id);
            }
        }
    };

    const imagesToDisplay = filteredImages.map(img => img.url);

    return (
        <div className="w-full max-w-7xl mx-auto px-4">
            {/* Header Section */}
            <div className="mb-12 text-center relative py-12 px-6 rounded-[48px] overflow-hidden bg-linear-to-br from-primary/10 via-surface to-accent/5 border border-primary/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary font-bold text-sm mb-6">
                        <Camera className="w-4 h-4" />
                        صُوّر في السويس
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-text-primary mb-6">عدسة السويس</h1>
                    <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
                        استمتع بجمال السويس من خلال عدسات سكانها. شاركنا رؤيتك الفريدة ومعالمك المفضلة في المدينة.
                    </p>
                    
                    <button 
                        onClick={() => setUploadModalOpen(true)}
                        className="inline-flex items-center gap-3 px-8 py-5 rounded-full bg-linear-to-r from-accent to-primary text-white font-bold text-lg shadow-2xl shadow-accent/30 hover:shadow-accent/50 hover:scale-105 transition-all"
                    >
                        <Plus className="w-6 h-6" />
                        شارك صورتك الآن
                    </button>
                </motion.div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-3 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => {
                                setSelectedCategory(cat);
                                const params = new URLSearchParams(searchParams.toString());
                                if (cat === 'الكل') params.delete('category');
                                else params.set('category', cat);
                                router.push(`/gallery?${params.toString()}`, { scroll: false });
                            }}
                            className={`whitespace-nowrap px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${
                                selectedCategory === cat 
                                ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' 
                                : 'bg-surface-variant text-text-secondary hover:bg-border-subtle'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                
                <div className="flex items-center gap-2 text-text-muted text-sm font-bold bg-surface-variant/50 px-4 py-2 rounded-xl">
                    <Grid3X3 className="w-4 h-4" />
                    <span>{filteredImages.length} صورة</span>
                </div>
            </div>

            {/* Masonry Grid (Simulated with columns) */}
            {filteredImages.length === 0 ? (
                <div className="py-32 flex flex-col items-center justify-center text-center bg-surface-variant/20 rounded-[48px] border-2 border-dashed border-border-subtle">
                    <ImageIcon className="w-20 h-20 mb-6 opacity-20 text-primary" />
                    <h3 className="text-2xl font-bold text-text-primary mb-2">لا توجد صور في هذا التصنيف</h3>
                    <p className="text-text-muted mb-8">كن أول من يشارك صورة مميزة هنا!</p>
                    <button 
                        onClick={() => setUploadModalOpen(true)}
                        className="px-6 py-3 rounded-full bg-primary text-white font-bold hover:scale-105 transition-all"
                    >
                        رفع أول صورة
                    </button>
                </div>
            ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                    <AnimatePresence mode="popLayout">
                        {filteredImages.map((img, idx) => (
                            <motion.div
                                key={img.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4 }}
                                onClick={() => openLightbox(idx)}
                                className="relative break-inside-avoid rounded-3xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
                            >
                                <SafeImage 
                                    src={img.url}
                                    alt={img.title}
                                    width={400}
                                    height={500}
                                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                
                                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white translate-y-6 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase">
                                            {img.category || 'عام'}
                                        </span>
                                        <span className="text-[10px] opacity-80 flex items-center gap-1">
                                            <ArrowUpRight className="w-3 h-3" />
                                            {img.views_count} مشاهدة
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg leading-tight mb-2">{img.title}</h3>
                                    {img.profiles && (
                                        <div className="flex items-center gap-2">
                                            {img.profiles.avatar_url ? (
                                                <Image 
                                                    src={img.profiles.avatar_url} 
                                                    className="w-5 h-5 rounded-full object-cover" 
                                                    alt="" 
                                                    width={20}
                                                    height={20}
                                                />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                                                    {img.profiles.username?.[0].toUpperCase()}
                                                </div>
                                            )}
                                            <span className="text-xs opacity-80 italic">عن طريق {img.profiles.full_name || img.profiles.username}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Modals */}
            <Lightbox 
                images={imagesToDisplay}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
            />

            <UploadPhotoModal 
                isOpen={uploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                categories={categories}
            />
        </div>
    );
}
