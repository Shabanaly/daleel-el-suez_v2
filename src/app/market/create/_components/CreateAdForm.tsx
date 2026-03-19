'use client';

import { useCreateAdForm } from '../_hooks/useCreateAdForm';
import { MarketCategory } from '@/lib/types/market';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { 
    Tag, 
    Type, 
    DollarSign, 
    Phone, 
    MapPin, 
    Info, 
    CheckCircle2, 
    Loader2,
    PackageCheck,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface CreateAdFormProps {
    categories: MarketCategory[];
    areas: { id: number; name: string }[];
}

export function CreateAdForm({ categories, areas }: CreateAdFormProps) {
    const {
        formData,
        errors,
        isSubmitting,
        isUploading,
        isSubmitted,
        error,
        images,
        updateFormData,
        handleFileChange,
        handleDeleteImage,
        handleSubmit
    } = useCreateAdForm({ categories, areas });

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center"
                >
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                </motion.div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-text-primary">تم بنجاح!</h2>
                    <p className="text-text-muted">إعلانك بقى جاهز وهينزل على السوق دلوقتي.</p>
                </div>
                <div className="flex gap-4">
                    <Link 
                        href="/market"
                        className="px-8 h-14 rounded-2xl bg-primary text-white font-bold flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                    >
                        روح للسوق
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-10 pb-32">
            {/* ─── Media Section ─── */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Tag className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-black text-text-primary">صور الإعلان</h3>
                </div>
                
                <div className="glass-panel p-6 rounded-[32px] border border-border-subtle/50">
                    <ImageUploader 
                        images={images}
                        onFileChange={handleFileChange}
                        onDeleteImage={handleDeleteImage}
                        isUploading={isUploading}
                        maxImages={10}
                        error={errors.images}
                    />
                </div>
            </section>

            {/* ─── Basic Info Section ─── */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Type className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-black text-text-primary">بيانات أساسية</h3>
                </div>

                <div className="glass-panel p-8 rounded-[32px] border border-border-subtle/50 space-y-8">
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
                                        onClick={() => updateFormData({ condition: opt.id as any })}
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
            </section>

            {/* ─── Pricing & Contact ─── */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-black text-text-primary">السعر والتواصل</h3>
                </div>

                <div className="glass-panel p-8 rounded-[32px] border border-border-subtle/50 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Price */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted mr-2 uppercase tracking-wide">السعر المطلوب</label>
                            <div className="relative">
                                <input 
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={(e) => updateFormData({ price: e.target.value })}
                                    className={`w-full h-14 pr-14 pl-6 rounded-2xl bg-background border ${errors.price ? 'border-red-500' : 'border-border-subtle'} font-black text-lg focus:border-primary transition-all outline-none`}
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted font-bold text-sm pointer-events-none">ج.م</div>
                            </div>
                            {errors.price && <p className="text-red-500 text-[10px] font-bold mt-1 mr-2">{errors.price}</p>}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted mr-2 uppercase tracking-wide">رقم الهاتف للتواصل</label>
                            <div className="relative">
                                <input 
                                    type="tel"
                                    placeholder="01xxxxxxxxx"
                                    value={formData.phone}
                                    onChange={(e) => updateFormData({ phone: e.target.value })}
                                    className={`w-full h-14 pl-14 pr-6 rounded-2xl bg-background border ${errors.phone ? 'border-red-500' : 'border-border-subtle'} font-bold focus:border-primary transition-all text-sm outline-none`}
                                    dir="ltr"
                                />
                                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                            </div>
                            {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 mr-2">{errors.phone}</p>}
                        </div>
                    </div>

                    {/* Area */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-text-muted mr-2 uppercase tracking-wide">المنطقة</label>
                        <div className="relative">
                            <select 
                                value={formData.areaId}
                                onChange={(e) => updateFormData({ areaId: e.target.value })}
                                className={`w-full h-14 px-12 rounded-2xl bg-background border ${errors.areaId ? 'border-red-500' : 'border-border-subtle'} font-bold focus:border-primary transition-all text-sm outline-none appearance-none`}
                            >
                                <option value="">اختر المنطقة</option>
                                {areas.map(area => (
                                    <option key={area.id} value={area.id}>{area.name}</option>
                                ))}
                            </select>
                            <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                        </div>
                        {errors.areaId && <p className="text-red-500 text-[10px] font-bold mt-1 mr-2">{errors.areaId}</p>}
                    </div>
                </div>
            </section>

            {/* Error Message */}
            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold text-center"
                >
                    {error}
                </motion.div>
            )}

            {/* Footer / Submit */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-xl border-t border-border-subtle z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
                    <div className="hidden sm:flex items-center gap-3 text-text-muted">
                        <Info className="w-5 h-5" />
                        <p className="text-[11px] font-bold">بمجرد الضغط على نشر الإعلان، فأنت توافق على شروط الاستخدام.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isUploading || isSubmitting}
                        className="flex-1 sm:flex-none h-14 px-12 rounded-2xl bg-primary text-white font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <PackageCheck className="w-5 h-5" />
                        )}
                        <span>{isSubmitting ? 'جاري النشر...' : 'انشر الإعلان دلوقتي'}</span>
                    </button>
                </div>
            </div>
        </form>
    );
}
