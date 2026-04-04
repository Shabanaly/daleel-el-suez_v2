'use client';

import React from 'react';
import { ArrowLeft, Tag, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { MarketCategory } from '@/features/market/types';

export type MarketFormData = {
    title: string;
    description: string;
    price: string;
    categoryId: string;
    areaId: string;
    phone: string;
    condition: 'new' | 'used' | 'na';
    isNegotiable: boolean;
};

interface MarketStep1BasicInfoProps {
    formData: MarketFormData;
    updateFormData: (data: Partial<MarketFormData>) => void;
    categories: MarketCategory[];
    onNext: () => void;
    errors: Record<string, string>;
}

export function MarketStep1BasicInfo({
    formData,
    updateFormData,
    onNext,
    errors
}: MarketStep1BasicInfoProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="flex flex-col items-center gap-2 mb-8 text-center">
                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider rounded-lg border border-primary/20">
                    الخطوة 2 من 4
                </span>
                <h2 className="text-2xl font-black text-text-primary">بيانات الإعلان الأساسية</h2>
                <p className="text-text-muted text-sm font-bold">اكتب عنوان جذاب ووصف دقيق للحاجة اللي بتبيعها</p>
            </div>

            <div className="glass-panel p-6 sm:p-8 rounded-[32px] border border-border-subtle/50 space-y-8">
                {/* Title */}
                <div className="space-y-2">
                    <label className="text-sm font-black text-text-primary flex items-center gap-2 pr-1">
                        <Tag className="w-4 h-4 text-primary" />
                        عنوان الإعلان
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => updateFormData({ title: e.target.value })}
                        placeholder="مثال: آيفون 13 برو ماكس مساحة 256 جيجا"
                        className={`w-full h-14 px-6 rounded-2xl bg-surface border-2 transition-all font-bold placeholder:text-text-muted/40 focus:outline-none ${
                            errors.title ? 'border-red-500 bg-red-500/5' : 'border-border-subtle focus:border-primary/50 focus:ring-4 focus:ring-primary/5'
                        }`}
                    />
                    {errors.title && <p className="text-red-500 text-xs font-bold mt-1 pr-1">{errors.title}</p>}
                </div>

                {/* Condition Selection */}
                <div className="space-y-2 text-right">
                    <label className="text-sm font-black text-text-primary block pr-1">حالة المنتج</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'new', label: 'جديد' },
                            { id: 'used', label: 'مستعمل' },
                            { id: 'na', label: 'أخرى' }
                        ].map((choice) => (
                            <button
                                key={choice.id}
                                type="button"
                                onClick={() => updateFormData({ condition: choice.id as 'new' | 'used' | 'na' })}
                                className={`h-12 rounded-xl text-xs font-black transition-all border-2 ${
                                    formData.condition === choice.id
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-border-subtle hover:border-primary/30 text-text-muted'
                                }`}
                            >
                                {choice.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-sm font-black text-text-primary flex items-center gap-2 pr-1">
                        <Menu className="w-4 h-4 text-primary" />
                        وصف الإعلان
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => updateFormData({ description: e.target.value })}
                        placeholder="اكتب كل تفاصيل المنتج، حالته، مميزاته، وأي عيوب لو موجودة..."
                        className={`w-full h-40 px-6 py-4 rounded-2xl bg-surface border-2 transition-all font-bold placeholder:text-text-muted/40 focus:outline-none resize-none ${
                            errors.description ? 'border-red-500 bg-red-500/5' : 'border-border-subtle focus:border-primary/50 focus:ring-4 focus:ring-primary/5'
                        }`}
                    />
                    {errors.description && <p className="text-red-500 text-xs font-bold mt-1 pr-1">{errors.description}</p>}
                    <p className="text-[10px] text-text-muted font-bold text-left px-1">
                        حاول يكون الوصف مفصل عشان تزود فرص البيع.
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end pt-4">
                <button
                    type="button"
                    onClick={onNext}
                    className="h-14 px-8 rounded-2xl bg-primary text-white font-black text-sm flex items-center gap-3 shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto justify-center"
                >
                    <span>التالي</span>
                    <ArrowLeft className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
}
