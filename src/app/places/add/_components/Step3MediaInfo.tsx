'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
 
 

import { Image as ImageIcon, Loader2, Info, Send, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { useState, memo, useEffect } from 'react';

interface Step3Props {
    formData: {
        description: string;
        images: string[];
    };
    updateFormData: (data: Partial<{ description: string }>) => void;
    onBack: () => void;
    isUploading: boolean;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void | Promise<void>;
    onDeleteImage: (index: number) => Promise<void>;
    onSubmit: (e: React.FormEvent) => Promise<void>;
    errors?: Record<string, string>;
}

export const Step3MediaInfo = memo(function Step3MediaInfo({
    formData,
    updateFormData,
    onBack,
    isUploading,
    onFileChange,
    onDeleteImage,
    onSubmit,
    errors
}: Step3Props) {
    const [localDescription, setLocalDescription] = useState(formData.description);
    const [prevDescription, setPrevDescription] = useState(formData.description);

    if (formData.description !== prevDescription) {
        setLocalDescription(formData.description);
        setPrevDescription(formData.description);
    }

    const handleFinalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateFormData({ description: localDescription });
        // Use a small timeout to ensure state is updated before submit
        setTimeout(() => {
            onSubmit(e);
        }, 0);
    };

    return (
        <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="glass-panel p-8 rounded-[40px] border border-border-subtle/50 space-y-6">
                <h3 className="text-xl font-black text-text-primary flex items-center gap-3 mb-2">
                    <ImageIcon className="w-6 h-6 text-primary" />
                    الصور والوصف
                </h3>

                <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">وصف النشاط</label>
                    <textarea
                        required
                        rows={4}
                        value={localDescription}
                        onChange={e => setLocalDescription(e.target.value)}
                        onBlur={() => updateFormData({ description: localDescription })}
                        placeholder="احكي للناس أكتر عن اللي بتقدمه، المنتجات، الخدمات، أو أي تفاصيل تميزك..."
                        className={`w-full p-6 rounded-3xl bg-background border ${errors?.description ? 'border-red-500' : 'border-border-subtle'} text-text-primary font-bold placeholder:text-text-muted/30 focus:border-primary transition-all outline-hidden resize-none`}
                    />
                    {errors?.description && <p className="text-red-500 text-[10px] font-bold mt-1 mr-3">{errors.description}</p>}
                </div>

                <div className="space-y-4">
                    <ImageUploader
                        images={formData.images}
                        onFileChange={onFileChange}
                        onDeleteImage={onDeleteImage}
                        isUploading={isUploading}
                        maxImages={5}
                        error={errors?.images}
                    />
                </div>

                <div className="flex gap-3 p-5 rounded-3xl bg-primary/5 border border-primary/10">
                    <Info className="w-5 h-5 text-primary shrink-0" />
                    <p className="text-[11px] font-bold text-text-muted leading-relaxed">
                        برجاء الحرص على رفع صور عالية الجودة توضح معالم مكانك، سيتم مراجعة الطلب خلال ٢٤ ساعة.
                    </p>
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={() => {
                        updateFormData({ description: localDescription });
                        onBack();
                    }}
                    className="h-16 px-8 rounded-2xl bg-surface border border-border-subtle text-text-primary font-black flex items-center justify-center gap-2 hover:bg-elevated transition-all"
                >
                    <ChevronRight className="w-5 h-5" />
                    <span>السابق</span>
                </button>
                <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={isUploading || formData.images.length === 0}
                    className="flex-1 h-16 rounded-2xl bg-linear-to-r from-accent to-accent/90 text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-accent/25 transition-all active:scale-[0.98] group disabled:opacity-50"
                >
                    {isUploading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    )}
                    <span>تقديم الطلب</span>
                </button>
            </div>
        </motion.div>
    );
});

