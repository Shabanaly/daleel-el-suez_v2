'use client';

import { useState } from 'react';
import { SafeImage } from '@/components/common/SafeImage';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface PlaceGalleryProps {
    images: string[];
    placeName: string;
    onImageClick: (index: number) => void;
}

export function PlaceGallery({ images, placeName, onImageClick }: PlaceGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

    return (
        <div className="relative w-full group">
            {/* Main Image Viewport */}
            <div className="relative aspect-square md:aspect-video w-full overflow-hidden border-y md:border md:rounded-[32px] border-border-subtle/30 bg-surface shadow-lg">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.4}
                        onDragEnd={(_, info) => {
                            const swipeThreshold = 50;
                            if (info.offset.x > swipeThreshold) {
                                prev();
                            } else if (info.offset.x < -swipeThreshold) {
                                next();
                            }
                        }}
                        className="relative w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center touch-pan-y"
                        onClick={(e) => {
                            // Only trigger click if it wasn't a drag
                            if (Math.abs((e.nativeEvent as any).movementX || 0) < 5) {
                                onImageClick(currentIndex);
                            }
                        }}
                    >
                        {/* Blurred Background to 'fill' space without cropping */}
                        <div className="absolute inset-0 z-0 blur-3xl opacity-40 scale-110 overflow-hidden pointer-events-none">
                            <SafeImage
                                src={images[currentIndex]}
                                alt=""
                                fill
                                sizes="1vw"
                                className="object-cover"
                            />
                        </div>

                        {/* Main Image - object-contain prevents cropping */}
                        <div className="relative z-10 w-full h-full pointer-events-none">
                            <SafeImage
                                src={images[currentIndex]}
                                alt={`${placeName} - ${currentIndex + 1}`}
                                fill
                                className="object-contain"
                                priority={currentIndex === 0}
                                sizes="(max-width: 768px) 100vw, 800px"
                            />
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Overlays */}
                <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent pointer-events-none z-20" />

                {/* Image Counter */}
                <div className="absolute bottom-6 right-6 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-[10px] font-black tracking-widest uppercase border border-white/10 z-30 pointer-events-none">
                    {currentIndex + 1} / {images.length}
                </div>
            </div>

            {/* Navigation Buttons */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 z-10"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 z-10"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                </>
            )}

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-2 mt-2 pr-2 pl-2 py-1 overflow-x-auto no-scrollbar snap-x">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`relative shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-md md:rounded-md overflow-hidden border-2 transition-all snap-start ${idx === currentIndex
                                ? 'border-primary scale-110 shadow-lg shadow-primary/30 z-10'
                                : 'border-border-subtle/50 opacity-60 hover:opacity-100 hover:border-primary/30 z-0'
                                }`}
                        >
                            <SafeImage
                                src={img}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 56px, 80px"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
