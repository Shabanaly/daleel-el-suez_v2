'use client';

import { Store, Tag, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Step1Props {
    formData: {
        name: string;
        categoryId: number;
        areaId: number;
        customAreaName?: string;
        customDistrictId?: number;
    };
    updateFormData: (data: Partial<Step1Props['formData']>) => void;
    categories: { id: number; name: string }[];
    areas: { id: number; name: string }[];
    districts: { id: number; name: string }[];
    isVerifyingArea?: boolean;
    handleVerifyArea?: () => void;
    onNext: () => void;
    errors?: Record<string, string>;
}

export function Step1BasicInfo({ formData, updateFormData, categories, areas, districts, isVerifyingArea, handleVerifyArea, onNext, errors }: Step1Props) {
    const isAddingCustomArea = formData.areaId === -1;

    return (
        <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="glass-panel p-8 rounded-[40px] border border-border-subtle/50 space-y-6">
                <h3 className="text-xl font-black text-text-primary flex items-center gap-3 mb-2">
                    <Store className="w-6 h-6 text-primary" />
                    المعلومات الأساسية
                </h3>

                <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">اسم المكان التجاري</label>
                    <div className="relative">
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={e => updateFormData({ name: e.target.value })}
                            placeholder="مثال: مطعم النيل، صيدلية الشفاء..."
                            className={`w-full h-16 px-6 rounded-2xl bg-background border ${errors?.name ? 'border-red-500' : 'border-border-subtle'} text-text-primary font-bold placeholder:text-text-muted/30 focus:border-primary transition-all outline-hidden`}
                        />
                        {errors?.name && <p className="text-red-500 text-[10px] font-bold mt-1 mr-3">{errors.name}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">التصنيف</label>
                        <div className="relative">
                            <Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/40 pointer-events-none" />
                            <select
                                required
                                value={formData.categoryId}
                                onChange={e => updateFormData({ categoryId: Number(e.target.value) })}
                                className={`w-full h-16 px-6 pr-10 rounded-2xl bg-background border ${errors?.categoryId ? 'border-red-500' : 'border-border-subtle'} text-text-primary font-bold focus:border-primary transition-all outline-hidden appearance-none`}
                            >
                                <option value="">اختر التصنيف</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {errors?.categoryId && <p className="text-red-500 text-[10px] font-bold mt-1 mr-3">{errors.categoryId}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">المنطقة / الحي</label>
                        <div className="relative">
                            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/40 pointer-events-none" />
                            <select
                                required
                                value={formData.areaId}
                                onChange={e => updateFormData({ areaId: Number(e.target.value) })}
                                className={`w-full h-16 px-6 pr-10 rounded-2xl bg-background border ${errors?.areaId ? 'border-red-500' : 'border-border-subtle'} text-text-primary font-bold focus:border-primary transition-all outline-hidden appearance-none`}
                            >
                                <option value="">اختر المنطقة</option>
                                {areas.map(area => (
                                    <option key={area.id} value={area.id}>{area.name}</option>
                                ))}
                                <option value={-1} className="font-bold text-primary">➕ أخرى (إضافة منطقة جديدة)</option>
                            </select>
                            {errors?.areaId && <p className="text-red-500 text-[10px] font-bold mt-1 mr-3">{errors.areaId}</p>}
                        </div>
                    </div>
                </div>

                {/* Custom Area Fields */}
                {isAddingCustomArea && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-3xl bg-primary/5 border border-primary/10"
                    >
                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">اسم المنطقة الجديدة</label>
                            <input
                                required={isAddingCustomArea}
                                type="text"
                                value={formData.customAreaName || ''}
                                onChange={e => updateFormData({ customAreaName: e.target.value })}
                                placeholder="اكتب اسم المنطقة..."
                                className={`w-full h-14 px-6 rounded-xl bg-background border ${errors?.customAreaName ? 'border-red-500' : 'border-border-subtle'} text-text-primary focus:border-primary transition-all outline-hidden`}
                            />
                            {errors?.customAreaName && <p className="text-red-500 text-[10px] font-bold mt-1 mr-3">{errors.customAreaName}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">التابع لها (الحي)</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <select
                                        required={isAddingCustomArea}
                                        value={formData.customDistrictId || ''}
                                        onChange={e => updateFormData({ customDistrictId: Number(e.target.value) })}
                                        className={`w-full h-14 px-6 rounded-xl bg-background border ${errors?.customDistrictId ? 'border-red-500' : 'border-border-subtle'} text-text-primary focus:border-primary transition-all outline-hidden appearance-none`}
                                    >
                                        <option value="">اختر الحي الرئيسي</option>
                                        {districts.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleVerifyArea}
                                    disabled={isVerifyingArea || !formData.customAreaName || !formData.customDistrictId}
                                    className="h-14 px-6 rounded-xl bg-primary text-white font-bold whitespace-nowrap hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {isVerifyingArea ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                            جاري الفحص...
                                        </span>
                                    ) : 'تحقق وإضافة'}
                                </button>
                            </div>
                            {errors?.customDistrictId && <p className="text-red-500 text-[10px] font-bold mt-1 mr-3">{errors.customDistrictId}</p>}
                        </div>
                    </motion.div>
                )}
            </div>

            <button
                type="button"
                onClick={onNext}
                className="w-full h-16 rounded-2xl bg-primary text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/25 hover:bg-primary-hover transition-all active:scale-[0.98]"
            >
                <span>التالي</span>
                <ArrowRight className="w-6 h-6 rotate-180" />
            </button>
        </motion.div>
    );
}
