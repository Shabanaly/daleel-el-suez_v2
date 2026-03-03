'use client';

import { Image as ImageIcon, Loader2, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploaderProps {
    images: string[];
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void | Promise<any>;
    onDeleteImage: (index: number) => Promise<void>;
    isUploading: boolean;
    maxImages?: number;
    error?: string | null;
}

export function ImageUploader({
    images,
    onFileChange,
    onDeleteImage,
    isUploading,
    maxImages = 5,
    error
}: ImageUploaderProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-3">
                <label className="text-xs font-black text-text-muted uppercase tracking-wide">
                    الصور ({images.length}/{maxImages})
                </label>
                {error && <p className="text-red-500 text-[10px] font-bold">{error}</p>}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Featured Image - Large Slot */}
                <div className="col-span-2 row-span-2 relative aspect-square rounded-[32px] border-2 border-dashed border-border-subtle overflow-hidden bg-background/30 group">
                    {images[0] ? (
                        <>
                            <img src={images[0]} alt="Cover" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => onDeleteImage(0)}
                                    className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase shadow-lg">صورة الغلاف</div>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                <ImageIcon className="w-8 h-8 text-primary" />
                            </div>
                            <p className="text-xs font-bold text-text-muted">ارفع صورة الغلاف الأساسية</p>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={onFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                disabled={isUploading}
                            />
                        </div>
                    )}
                    {isUploading && !images[0] && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    )}
                </div>

                {/* Smaller Slots */}
                {Array.from({ length: maxImages - 1 }).map((_, i) => {
                    const idx = i + 1;
                    return (
                        <div key={idx} className="relative aspect-square rounded-xl border-2 border-dashed border-border-subtle overflow-hidden bg-background/30 group">
                            {images[idx] ? (
                                <>
                                    <img src={images[idx]} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => onDeleteImage(idx)}
                                            className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                images.length === idx ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Plus className="w-6 h-6 text-text-muted/40 group-hover:text-primary transition-colors" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={onFileChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            disabled={isUploading}
                                        />
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                )
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
