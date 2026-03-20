'use client';

import { useState } from 'react';
import { Lightbox } from '@/app/places/_components/Lightbox';
import { motion } from 'framer-motion';
import SectionHeader from '@/components/ui/SectionHeader';
import { Camera, ArrowUpRight, Plus, Image as ImageIcon } from 'lucide-react';
import { SafeImage } from '@/components/common/SafeImage';
import { GalleryImage, incrementImageViews } from '@/lib/actions/gallery';
import Link from 'next/link';

// No static fallback anymore, using empty array by default

interface SuezGalleryProps {
    initialImages?: GalleryImage[];
}

export default function SuezGallery({ initialImages = [] }: SuezGalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);

    const displayItems = initialImages.slice(0, 5).map((img, idx) => {
        let span = 'md:col-span-1 md:row-span-1';
        if (initialImages.length >= 4) {
            span = idx === 0 ? 'md:col-span-2 md:row-span-2' : 'md:col-span-1 md:row-span-1';
        }
        return { ...img, span };
    });

    const openLightbox = (index: number) => {
        setPhotoIndex(index);
        setLightboxOpen(true);
        
        // Track view if it's a dynamic image and not viewed today
        const item = displayItems[index];
        if (item && item.id && item.id.length > 5) {
            const lastViewKey = `vg_view_${item.id}`;
            const lastView = localStorage.getItem(lastViewKey);
            const today = new Date().toDateString();
            
            if (lastView !== today) {
                incrementImageViews(item.id);
                localStorage.setItem(lastViewKey, today);
            }
        }
    };

    const imagesToDisplay = displayItems.map(item => item.url);

    return (
        <section className="w-full max-w-7xl mx-auto px-4 pt-0 pb-8 md:pt-0 md:pb-16 overflow-hidden relative border-t border-border-subtle/30">
            <div className="mb-8">
                <SectionHeader
                    title="عدسة السويس"
                    subtitle="جمال المدينة بعيون أهلها وزوارها"
                    icon={Camera}
                    href="/gallery"
                    viewAllText="الجلاري بالكامل"
                />
            </div>

            <div className={`grid gap-4 ${
                displayItems.length === 1 ? 'grid-cols-1' :
                displayItems.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                displayItems.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
                'grid-cols-1 md:grid-cols-4'
            } ${displayItems.length > 3 ? 'auto-rows-[200px]' : ''}`}>
                {displayItems.length === 0 ? (
                   <div className="col-span-full h-80 flex flex-col items-center justify-center bg-surface-variant/30 rounded-3xl border-2 border-dashed border-border-subtle text-text-muted">
                        <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-lg">كن أول من يشارك صورة لجمال السويس</p>
                   </div>
                ) : (
                    displayItems.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            onClick={() => openLightbox(idx)}
                            className={`relative rounded-3xl overflow-hidden group cursor-pointer ${item.span}`}
                        >
                            <SafeImage
                                src={item.url}
                                alt={item.title}
                                fill={displayItems.length > 3}
                                width={displayItems.length <= 3 ? 1200 : undefined}
                                height={displayItems.length <= 3 ? 800 : undefined}
                                unoptimized
                                className={`${displayItems.length > 3 ? 'object-cover' : 'w-full h-auto'} transition-transform duration-700 group-hover:scale-110`}
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="absolute bottom-6 right-6 left-6 text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider">
                                        {item.category || 'صورة'}
                                    </span>
                                    {'views_count' in item && (
                                        <span className="text-[10px] text-white/70">
                                            {item.views_count} مشاهدة
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg md:text-xl font-bold leading-tight">
                                    {item.title}
                                </h3>
                                {'profiles' in item && item.profiles && (
                                    <p className="text-xs text-white/80 mt-1">بواسطة {item.profiles.full_name || item.profiles.username}</p>
                                )}
                            </div>

                            {/* Interactive indicator */}
                            <div className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <ArrowUpRight className="w-5 h-5 text-white" />
                            </div>
                        </motion.div>
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
                <Link 
                    href="/gallery"
                    className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-full bg-linear-to-r from-accent to-primary text-white font-black text-lg shadow-2xl shadow-accent/30 hover:shadow-accent/50 hover:scale-105 transition-all duration-500 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500 relative z-10" />
                    <span className="relative z-10">شاركنا بورتريتك للسويس</span>
                </Link>
            </motion.div>

            <Lightbox 
                images={imagesToDisplay}
                index={photoIndex}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
            />
        </section>
    );
}
