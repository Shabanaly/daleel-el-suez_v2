'use client';

import { useState } from 'react';
import { Lightbox } from '@/components/common/Lightbox';
import { motion } from 'framer-motion';
import { Camera, ArrowUpRight, Plus, Eye, Image as ImageIcon } from 'lucide-react';
import { SafeImage } from '@/components/common/SafeImage';
import { GalleryImage, incrementImageViews } from '@/features/gallery/actions/gallery.server';
import CustomLink from '@/components/customLink/customLink';
import { ROUTES } from '@/constants';

interface SuezGalleryProps {
    initialImages?: GalleryImage[];
}

export default function SuezGallery({ initialImages = [] }: SuezGalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);

    // Take up to 6 images for a clean 3-column 2-row layout
    const displayItems = initialImages.slice(0, 6);

    const openLightbox = (index: number) => {
        setLightboxOpen(true);
        
        // Track view if it's a dynamic image and not viewed today
        const item = displayItems[index];
        if (item && item.id && item.id.length > 5) {
            const lastViewKey = `vg_view_${item.id}`;
            const lastView = localStorage.getItem(lastViewKey);
            const today = new Date().toDateString();
            
            if (lastView !== today) {
                localStorage.setItem(lastViewKey, today);
                incrementImageViews(item.id);
            }
        }
    };

    const imagesToDisplay = displayItems.map(item => item.url);

    return (
        <section className="w-full bg-background pt-4 pb-4 md:pt-8 md:pb-8 overflow-hidden relative border-t border-border-subtle/30">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                
                {/* Header Section */}
                <div className="w-full mb-8 md:mb-10 flex flex-col items-start gap-2">
                    <h2 className="text-3xl font-black tracking-tight text-text-primary md:text-4xl">
                        عدسة السويس
                    </h2>
                    <p className="text-base text-text-muted font-medium w-full max-w-3xl">
                        استكشف جمال المحافظة بعيون أهلها. أروع الصور للمعالم والأحداث والسياحة.
                    </p>
                </div>

                {/* Grid Section */}
                <div className="w-full grid grid-cols-1 gap-6 md:grid-cols-3">
                    {displayItems.length === 0 ? (
                        <div className="col-span-full h-80 flex flex-col items-center justify-center bg-surface-variant/30 rounded-3xl border-2 border-dashed border-border-subtle text-text-muted">
                            <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-lg">كن أول من يشارك صورة لجمال السويس</p>
                        </div>
                    ) : (
                        displayItems.map((item, idx) => (
                            <motion.article
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="flex max-w-xl flex-col items-start justify-start group w-full"
                            >
                                {/* Header: Author Profile and Category */}
                                <div className="flex items-center justify-between gap-x-3 w-full mb-4">
                                    {('profiles' in item) && item.profiles ? (
                                        <div className="flex items-center gap-x-3 flex-1 min-w-0">
                                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0 border border-border-subtle">
                                                {item.profiles.avatar_url ? (
                                                    <SafeImage
                                                        alt={item.profiles.full_name || item.profiles.username || 'مصور'}
                                                        src={item.profiles.avatar_url}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-primary font-black uppercase text-sm">
                                                        {(item.profiles.full_name || item.profiles.username || 'م')[0]}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-text-primary text-sm truncate">
                                                    {item.profiles.full_name || item.profiles.username || 'مصور مبدع'}
                                                </p>
                                                <p className="text-text-muted text-xs font-semibold mt-0.5">عدسة السويس</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1" />
                                    )}

                                    {/* Category Tag */}
                                    <span className="relative z-10 rounded-full bg-primary/10 px-3 py-1 font-bold text-primary text-xs shrink-0 cursor-default">
                                        {item.category || 'تصوير'}
                                    </span>
                                </div>

                                {/* Main Image */}
                                <div 
                                    className="relative w-full aspect-4/3 rounded-2xl overflow-hidden cursor-pointer shadow-sm border border-border-subtle/50 group-hover:shadow-md transition-all duration-300 z-10"
                                    onClick={() => openLightbox(idx)}
                                >
                                    <SafeImage
                                        src={item.url}
                                        alt={item.title}
                                        fill
                                        unoptimized
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-75 group-hover:scale-100">
                                            <ArrowUpRight className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer: Title and Views */}
                                <div className="relative mt-4 flex items-start justify-between gap-4 w-full">
                                    <h3 
                                        className="text-base/6 font-bold text-text-primary group-hover:text-primary transition-colors cursor-pointer line-clamp-2" 
                                        onClick={() => openLightbox(idx)}
                                    >
                                        {item.title}
                                    </h3>
                                    
                                    {'views_count' in item && (
                                        <div className="flex items-center gap-1.5 text-text-muted font-semibold text-xs shrink-0 mt-1">
                                            <Eye className="w-4 h-4" />
                                            <span>{item.views_count}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.article>
                        ))
                    )}
                </div>

                {/* Bottom CTA Button */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12 flex justify-center"
                >
                    <CustomLink 
                        href={ROUTES.GALLERY}
                        className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary/10 text-primary font-black text-lg hover:bg-primary hover:text-white transition-all duration-300"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                        <span>تحميل وقراءة المزيد</span>
                    </CustomLink>
                </motion.div>
            </div>

            <Lightbox 
                images={imagesToDisplay}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
            />
        </section>
    );
}
