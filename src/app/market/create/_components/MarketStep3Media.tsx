'use client';

import { Tag, ArrowRight, PackageCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ImageUploader } from '@/components/ui/ImageUploader';

interface MarketStep3MediaProps {
    images: string[];
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void | Promise<unknown>;
    onDeleteImage: (index: number) => Promise<void>;
    isUploading: boolean;
    onSubmit: () => void | Promise<void>;
    onBack: () => void;
    errors: Record<string, string>;
}

export function MarketStep3Media({
    images,
    onFileChange,
    onDeleteImage,
    isUploading,
    onSubmit,
    onBack,
    errors
}: MarketStep3MediaProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Tag className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-text-primary">صور الإعلان</h3>
            </div>
            
            <div className="glass-panel p-6 sm:p-8 rounded-[32px] border border-border-subtle/50">
                <ImageUploader 
                    images={images}
                    onFileChange={onFileChange}
                    onDeleteImage={onDeleteImage}
                    isUploading={isUploading}
                    maxImages={5}
                    error={errors.images}
                />
                <p className="text-xs text-text-muted font-medium mt-4 text-center">
                    الحد الأقصى هو 5 صور. استخدم صور واضحة لزيادة فرصة البيع.
                </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isUploading}
                    className="h-14 px-8 rounded-2xl bg-surface border border-border-subtle text-text-primary font-black text-sm flex items-center gap-3 hover:bg-elevated transition-all w-full sm:w-auto justify-center disabled:opacity-50"
                >
                    <ArrowRight className="w-5 h-5" />
                    <span>السابق</span>
                </button>

                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={isUploading}
                    className="h-14 px-8 rounded-2xl bg-primary text-white font-black text-sm flex items-center gap-3 shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto justify-center disabled:opacity-50"
                >
                    {isUploading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <PackageCheck className="w-5 h-5" />
                    )}
                    <span>{isUploading ? 'جاري النشر...' : 'انشر الإعلان دلوقتي'}</span>
                </button>
            </div>
        </motion.div>
    );
}
