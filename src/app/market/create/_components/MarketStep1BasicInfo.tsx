'use client';

import { Type, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { MarketCategory } from '@/lib/types/market';

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
    categories,
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
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Type className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-text-primary">بيانات أساسية</h3>
            </div>

            <div className="glass-panel p-6 sm:p-8 rounded-[32px] border border-border-subtle/50 space-y-8">
                {/* Title */}
                <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted mr-2 uppercase tracking-wide">عنوان الإعلان</label>
                    <input 
                        type="text"
                        placeholder="مثال: آيفون 13 برو ماكس 256 جيجا بحالة الزيرو"
                        value={formData.title}
                        onChange={(e) => updateFormData({ title: e.target.value })}
                        className={`w-full h-14 px-6 rounded-2xl bg-background border ${errors.title ? 'border-red-500' : 'border-border-subtle'} font-bold focus:border-primary transition-all text-sm outline-none`}
                    />
                    {errors.title && <p className="text-red-500 text-[10px] font-bold mt-1 mr-2">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-text-muted mr-2 uppercase tracking-wide">القسم</label>
                        <select 
                            value={formData.categoryId}
                            onChange={(e) => updateFormData({ categoryId: e.target.value })}
                            className={`w-full h-14 px-6 rounded-2xl bg-background border ${errors.categoryId ? 'border-red-500' : 'border-border-subtle'} font-bold focus:border-primary transition-all text-sm outline-none appearance-none`}
                        >
                            <option value="">اختر القسم المناسب</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        {errors.categoryId && <p className="text-red-500 text-[10px] font-bold mt-1 mr-2">{errors.categoryId}</p>}
                    </div>

                    {/* Condition */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-text-muted mr-2 uppercase tracking-wide">الحالة</label>
                        <div className="flex p-1.5 bg-surface border border-border-subtle rounded-2xl">
                            {[
                                { id: 'used', label: 'مستعمل' },
                                { id: 'new', label: 'جديد' },
                                { id: 'na', label: 'أخرى/عقار' }
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => updateFormData({ condition: opt.id as MarketFormData['condition'] })}
                                    className={`flex-1 h-11 rounded-xl text-xs font-bold transition-all ${
                                        formData.condition === opt.id 
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                        : 'text-text-muted hover:text-text-primary'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted mr-2 uppercase tracking-wide">وصف الإعلان</label>
                    <textarea 
                        rows={5}
                        placeholder="اكتب كل التفاصيل اللي المشتري ممكن يحتاج يعرفها..."
                        value={formData.description}
                        onChange={(e) => updateFormData({ description: e.target.value })}
                        className={`w-full p-6 rounded-2xl bg-background border ${errors.description ? 'border-red-500' : 'border-border-subtle'} font-bold focus:border-primary transition-all text-sm outline-none resize-none`}
                    />
                    {errors.description && <p className="text-red-500 text-[10px] font-bold mt-1 mr-2">{errors.description}</p>}
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
