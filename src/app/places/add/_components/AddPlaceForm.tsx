'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ArrowRight, MapPin, Phone, Building2,
    Image as ImageIcon, CheckCircle2, Send, Clock, Info, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCloudinarySignature, deleteCloudinaryImage } from '@/lib/actions/media';
import { addPlace } from '@/lib/actions/places';

interface AddPlaceFormProps {
    categories: { id: number; name: string }[];
    areas: { id: number; name: string }[];
}

export function AddPlaceForm({ categories, areas }: AddPlaceFormProps) {
    const [step, setStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        categoryId: categories[0]?.id || 0,
        areaId: areas[0]?.id || 0,
        phone: '',
        address: '',
        openHours: '',
        description: '',
        imageUrl: '',
        publicId: '' // Track publicId for cleanup
    });

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            // 1. Get Signature
            const { signature, timestamp, apiKey, cloudName, uploadPreset } = await getCloudinarySignature();

            // 2. Prepare Upload
            const uploadData = new FormData();
            uploadData.append('file', file);
            uploadData.append('api_key', apiKey!);
            uploadData.append('timestamp', timestamp.toString());
            uploadData.append('signature', signature);
            uploadData.append('upload_preset', uploadPreset!);

            // 3. Upload to Cloudinary
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: uploadData,
            });

            const result = await response.json();
            if (result.secure_url) {
                setFormData(prev => ({
                    ...prev,
                    imageUrl: result.secure_url,
                    publicId: result.public_id // Store public_id
                }));
            } else {
                throw new Error('فشل رفع الصورة');
            }
        } catch (err: any) {
            console.error('Upload error:', err);
            setError('حدث خطأ أثناء رفع الصورة. حاول مرة أخرى.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        setError(null);

        try {
            await addPlace({
                ...formData,
                images: formData.imageUrl ? [formData.imageUrl] : []
            });
            setIsSubmitted(true);
        } catch (err: any) {
            console.error('Submission error:', err);
            setError(err.message || 'حدث خطأ أثناء حفظ البيانات');

            // 🧹 Cleanup image if DB insert fails
            if (formData.publicId) {
                try {
                    await deleteCloudinaryImage(formData.publicId);
                    console.log('Orphaned image cleaned up');
                } catch (cleanupErr) {
                    console.error('Failed to cleanup image:', cleanupErr);
                }
            }
        } finally {
            setIsUploading(false);
        }
    };

    if (isSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full glass-panel p-10 rounded-[44px] text-center border-secondary-500/20 shadow-2xl shadow-secondary-500/10"
            >
                <div className="w-20 h-20 bg-secondary-500/20 rounded-3xl flex items-center justify-center text-secondary-500 mx-auto mb-8 shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-text-primary mb-4 tracking-tight">تم الإرسال بنجاح!</h2>
                <p className="text-text-muted font-medium mb-8 leading-relaxed">
                    شكراً لثقتك في دليل السويس. سنقوم بمراجعة بيانات نشاطك التجاري وتفعيله فوراً.
                </p>
                <Link
                    href="/places"
                    className="inline-flex h-14 px-8 rounded-2xl bg-secondary-600 text-white font-black items-center justify-center hover:bg-secondary-500 transition-all shadow-lg shadow-secondary-500/25"
                >
                    الرجوع للدليل
                </Link>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            {error && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold text-center">
                    {error}
                </div>
            )}

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="glass-panel p-8 rounded-[40px] border border-border-subtle/50 space-y-6">
                            <h3 className="text-xl font-black text-text-primary flex items-center gap-3 mb-2">
                                <Building2 className="w-6 h-6 text-primary-500" />
                                المعلومات الأساسية
                            </h3>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">اسم النشاط</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="مثال: كافيه النيل، مكتبة التحرير..."
                                    className="w-full h-16 px-6 rounded-2xl bg-base border border-border-subtle text-text-primary font-bold placeholder:text-text-muted/30 focus:border-primary-500 transition-all outline-hidden"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">تصنيف النشاط</label>
                                    <select
                                        required
                                        value={formData.categoryId}
                                        onChange={e => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                                        className="w-full h-16 px-6 rounded-2xl bg-base border border-border-subtle text-text-primary font-bold focus:border-primary-500 transition-all outline-hidden appearance-none"
                                    >
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">المنطقة</label>
                                    <select
                                        required
                                        value={formData.areaId}
                                        onChange={e => setFormData({ ...formData, areaId: parseInt(e.target.value) })}
                                        className="w-full h-16 px-6 rounded-2xl bg-base border border-border-subtle text-text-primary font-bold focus:border-primary-500 transition-all outline-hidden appearance-none"
                                    >
                                        {areas.map(area => <option key={area.id} value={area.id}>{area.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={nextStep}
                            disabled={!formData.name}
                            className="w-full h-16 rounded-2xl bg-primary-600 text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary-500/25 hover:bg-primary-500 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            <span>التالي</span>
                            <ArrowRight className="w-6 h-6 rotate-180" />
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="glass-panel p-8 rounded-[40px] border border-border-subtle/50 space-y-6">
                            <h3 className="text-xl font-black text-text-primary flex items-center gap-3 mb-2">
                                <Phone className="w-6 h-6 text-primary-500" />
                                بيانات التواصل
                            </h3>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">رقم الهاتف للعملاء</label>
                                <input
                                    required
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="01xxxxxxxxx"
                                    dir="ltr"
                                    className="w-full h-16 px-6 rounded-2xl bg-base border border-border-subtle text-text-primary font-bold placeholder:text-text-muted/30 focus:border-primary-500 transition-all outline-hidden pr-6 text-right"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">العنوان بالتفصيل</label>
                                <div className="relative">
                                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/40" />
                                    <input
                                        required
                                        type="text"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="مثال: شارع النهضة، خلف بنك مصر..."
                                        className="w-full h-16 px-6 rounded-2xl bg-base border border-border-subtle text-text-primary font-bold placeholder:text-text-muted/30 focus:border-primary-500 transition-all outline-hidden"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">مواعيد العمل اليومية</label>
                                <div className="relative">
                                    <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/40" />
                                    <input
                                        required
                                        type="text"
                                        value={formData.openHours}
                                        onChange={e => setFormData({ ...formData, openHours: e.target.value })}
                                        placeholder="مثال: من 10 صباحاً إلى 10 مساءً"
                                        className="w-full h-16 px-6 rounded-2xl bg-base border border-border-subtle text-text-primary font-bold placeholder:text-text-muted/30 focus:border-primary-500 transition-all outline-hidden"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={prevStep}
                                className="h-16 px-8 rounded-2xl bg-surface border border-border-subtle text-text-primary font-black flex items-center justify-center gap-2 hover:bg-elevated transition-all"
                            >
                                <ArrowRight className="w-5 h-5" />
                                <span>السابق</span>
                            </button>
                            <button
                                type="button"
                                onClick={nextStep}
                                className="flex-1 h-16 rounded-2xl bg-primary-600 text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary-500/25 hover:bg-primary-500 transition-all active:scale-[0.98]"
                            >
                                <span>التالي</span>
                                <ArrowRight className="w-6 h-6 rotate-180" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="glass-panel p-8 rounded-[40px] border border-border-subtle/50 space-y-6">
                            <h3 className="text-xl font-black text-text-primary flex items-center gap-3 mb-2">
                                <ImageIcon className="w-6 h-6 text-primary-500" />
                                الصور والوصف
                            </h3>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">وصف النشاط</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="احكي للناس أكتر عن اللي بتقدمه..."
                                    className="w-full p-6 rounded-2xl bg-base border border-border-subtle text-text-primary font-bold placeholder:text-text-muted/30 focus:border-primary-500 transition-all outline-hidden resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">صورة الغلاف</label>
                                <div className="relative h-48 rounded-3xl border-2 border-dashed border-border-subtle flex flex-col items-center justify-center text-text-muted/40 hover:border-primary-500/50 hover:text-primary-500 transition-all group overflow-hidden bg-base/30">
                                    {formData.imageUrl ? (
                                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 rounded-2xl bg-elevated border border-border-subtle flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                {isUploading ? <Loader2 className="w-8 h-8 animate-spin text-primary-500" /> : <ImageIcon className="w-8 h-8" />}
                                            </div>
                                            <span className="font-bold text-sm">{isUploading ? 'جاري الرفع...' : 'اضغط لرفع الصورة'}</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        disabled={isUploading}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 p-4 rounded-2xl bg-primary-500/5 border border-primary-500/10">
                                <Info className="w-5 h-5 text-primary-500 shrink-0" />
                                <p className="text-[11px] font-bold text-text-muted/80 leading-relaxed">
                                    بمجرد الإرسال، سيتم مراجعة نشاطك من قبل فريقنا للتأكد من صحة البيانات وجودة الصور.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={prevStep}
                                className="h-16 px-8 rounded-2xl bg-surface border border-border-subtle text-text-primary font-black flex items-center justify-center gap-2 hover:bg-elevated transition-all"
                            >
                                <ArrowRight className="w-5 h-5" />
                                <span>السابق</span>
                            </button>
                            <button
                                type="submit"
                                disabled={isUploading || !formData.imageUrl}
                                className="flex-1 h-16 rounded-2xl bg-linear-to-r from-secondary-600 to-secondary-500 text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-secondary-500/25 transition-all active:scale-[0.98] group disabled:opacity-50"
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
                )}
            </AnimatePresence>
        </form>
    );
}
