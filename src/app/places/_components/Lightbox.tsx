'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface LightboxProps {
    images: string[];
    index: number;
    isOpen: boolean;
    onClose: () => void;
}

export function Lightbox({ images, index: initialIndex, isOpen, onClose }: LightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setZoom(1);
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const next = () => {
        setZoom(1);
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prev = () => {
        setZoom(1);
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-xl select-none"
                onClick={onClose}
            >
                {/* ── Toolbar ────────────────────────────────────────────────── */}
                <div className="absolute top-0 inset-x-0 h-20 flex items-center justify-between px-6 z-10 pointer-events-none">
                    <div className="flex items-center gap-4 pointer-events-auto">
                        <button
                            onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(z + 0.5, 3)); }}
                            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10"
                        >
                            <ZoomIn className="w-5 h-5" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(z - 0.5, 1)); }}
                            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10"
                        >
                            <ZoomOut className="w-5 h-5" />
                        </button>
                        <span className="text-white/60 font-bold text-sm tracking-widest ml-2">
                            {currentIndex + 1} / {images.length}
                        </span>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10 pointer-events-auto group"
                    >
                        <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                {/* ── Image Container ─────────────────────────────────────────── */}
                <motion.div
                    layoutId={`gallery-${initialIndex}`}
                    className="relative w-full h-full flex items-center justify-center p-4 md:p-12 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, scale: 0.9, x: 20 }}
                            animate={{ opacity: 1, scale: zoom, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9, x: -20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full h-full flex items-center justify-center pointer-events-none"
                        >
                            <div className="relative max-w-full max-h-full aspect-square md:aspect-video w-full h-full">
                                <Image
                                    src={images[currentIndex]}
                                    alt={`Image ${currentIndex + 1}`}
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {/* ── Navigation Controls ─────────────────────────────────────── */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); prev(); }}
                            className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10 hover:scale-110 active:scale-95"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); next(); }}
                            className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10 hover:scale-110 active:scale-95"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    </>
                )}

                {/* ── Thumbnails ──────────────────────────────────────────────── */}
                <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2 px-6 overflow-x-auto hide-scrollbar z-10">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); setZoom(1); }}
                            className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${i === currentIndex ? 'border-primary-500 scale-110 shadow-lg shadow-primary-500/20' : 'border-white/10 opacity-50 hover:opacity-100'
                                }`}
                        >
                            <Image src={img} alt="" fill className="object-cover" />
                        </button>
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
