'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDialog } from "@/components/providers/DialogProvider";
import {
    ArrowRight, MapPin, Phone, Building2,
    Image as ImageIcon, CheckCircle2, Send, Clock, Info, Loader2, Trash2,
    Facebook, Instagram, Globe, Tag, FileText, ChevronRight, Plus, X, MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCloudinarySignature, deleteCloudinaryImage } from '@/lib/actions/media';
import { updatePlace, deletePlace } from '@/lib/actions/mutations';
import { StepIndicator } from '@/app/places/add/_components/StepIndicator';
import { Place } from '@/lib/types/places';

interface EditPlaceFormProps {
    place: Place;
    categories: { id: number; name: string }[];
    areas: { id: number; name: string }[];
}

type PlaceFormData = {
    name: string;
    categoryId: number;
    areaId: number;
    phone: {
        primary: string;
        others: string[];
        whatsapp: string;
    };
    address: string;
    openHours: string | null;
    description: string;
    imageUrl: string | null;
    publicId: string;
    socialLinks: { platform: string; url: string }[];
};

export function EditPlaceForm({ place, categories, areas }: EditPlaceFormProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { showConfirm, showAlert } = useDialog();

    const [formData, setFormData] = useState<PlaceFormData>({
        name: place.name,
        categoryId: categories.find(c => c.name === place.category)?.id || 0,
        areaId: areas.find(a => a.name === place.area)?.id || 0,
        phone: place.phoneNumber,
        address: place.address,
        openHours: place.openHours,
        description: place.description || '',
        imageUrl: place.imageUrl,
        publicId: '',
        socialLinks: (place.socialLinks && place.socialLinks.length > 0)
            ? place.socialLinks
            : [{ platform: 'website', url: '' }]
    });

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            const { signature, timestamp, apiKey, cloudName, uploadPreset } = await getCloudinarySignature();
            const uploadData = new FormData();
            uploadData.append('file', file);
            uploadData.append('api_key', apiKey!);
            uploadData.append('timestamp', timestamp.toString());
            uploadData.append('signature', signature);
            uploadData.append('upload_preset', uploadPreset!);

            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: uploadData,
            });

            const result = await response.json();
            if (result.secure_url) {
                setFormData(prev => ({
                    ...prev,
                    imageUrl: result.secure_url,
                    publicId: result.public_id
                }));
            } else {
                throw new Error('فشل رفع الصورة');
            }
        } catch (err: any) {
            setError('حدث خطأ أثناء رفع الصورة');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        setError(null);

        try {
            await updatePlace(place.id, {
                ...formData,
                images: formData.imageUrl ? [formData.imageUrl] : []
            });
            setIsSubmitted(true);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء تحديث البيانات');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async () => {
        showConfirm({
            title: 'حذف المكان',
            message: 'هل أنت متأكد من حذف هذا المكان؟ لا يمكن التراجع عن هذا الإجراء.',
            type: 'warning',
            confirmLabel: 'حذف',
            onConfirm: async () => {
                setIsDeleting(true);
                try {
                    const result = await deletePlace(place.id);
                    if (result && result.success) {
                        router.push('/places');
                        router.refresh();
                        showAlert({
                            title: 'تم الحذف',
                            message: 'تم حذف المكان بنجاح',
                            type: 'success'
                        });
                    }
                } catch (err: any) {
                    console.error('Delete error:', err);
                    showAlert({
                        title: 'خطأ',
                        message: err.message || 'حدث خطأ غير متوقع',
                        type: 'error'
                    });
                } finally {
                    setIsDeleting(false);
                }
            }
        });
    };

    if (isSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full glass-panel p-10 rounded-[44px] text-center border-accent/20 shadow-2xl shadow-accent/10 mx-auto"
            >
                <div className="w-20 h-20 bg-accent/20 rounded-3xl flex items-center justify-center text-accent mx-auto mb-8 shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-text-primary mb-4 tracking-tight">تم التحديث!</h2>
                <p className="text-text-muted font-medium mb-8">تم حفظ تعديلات المكان بنجاح.</p>
                <Link href={`/places/${place.slug}`} className="inline-flex h-14 px-8 rounded-2xl bg-accent text-white font-black items-center justify-center hover:bg-accent transition-all shadow-lg shadow-accent/25">
                    العودة للمكان
                </Link>
            </motion.div>
        );
    }

    return (
        <div className="w-full">
            <StepIndicator currentStep={step} />

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-accent/10 border border-accent/20 text-accent text-sm font-bold text-center">
                        {error}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <div className="glass-panel p-8 rounded-[40px] border border-border-subtle/50 space-y-6">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xl font-black text-text-primary flex items-center gap-3">
                                        <Building2 className="w-6 h-6 text-primary" />
                                        المعلومات الأساسية
                                    </h3>
                                    <button type="button" onClick={handleDelete} className="p-2 text-accent/40 hover:text-accent transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">اسم النشاط</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full h-16 px-6 rounded-2xl bg-background border border-border-subtle text-text-primary font-bold focus:border-primary transition-all outline-hidden" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">تصنيف النشاط</label>
                                        <select required value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: parseInt(e.target.value) })} className="w-full h-16 px-6 rounded-2xl bg-background border border-border-subtle text-text-primary font-bold focus:border-primary transition-all outline-hidden appearance-none">
                                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">المنطقة</label>
                                        <select required value={formData.areaId} onChange={e => setFormData({ ...formData, areaId: parseInt(e.target.value) })} className="w-full h-16 px-6 rounded-2xl bg-background border border-border-subtle text-text-primary font-bold focus:border-primary transition-all outline-hidden appearance-none">
                                            {areas.map(area => <option key={area.id} value={area.id}>{area.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button type="button" onClick={nextStep} className="w-full h-16 rounded-2xl bg-primary text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/25 hover:bg-primary-hover transition-all">
                                <span>التالي</span>
                                <ArrowRight className="w-6 h-6 rotate-180" />
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <div className="glass-panel p-8 rounded-[40px] border border-border-subtle/50 space-y-6">
                                <h3 className="text-xl font-black text-text-primary flex items-center gap-3 mb-2">
                                    <Phone className="w-6 h-6 text-primary" />
                                    بيانات التواصل
                                </h3>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">رقم الهاتف الأساسي</label>
                                        <input required type="tel" value={formData.phone.primary} onChange={e => setFormData({ ...formData, phone: { ...formData.phone, primary: e.target.value } })} dir="ltr" className="w-full h-16 px-6 rounded-2xl bg-background border border-border-subtle text-text-primary font-bold focus:border-primary transition-all outline-hidden pr-6 text-right" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">رقم واتساب (اختياري)</label>
                                        <div className="relative">
                                            <MessageCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/40" />
                                            <input type="tel" value={formData.phone.whatsapp} onChange={e => setFormData({ ...formData, phone: { ...formData.phone, whatsapp: e.target.value } })} dir="ltr" placeholder="مثال: 01012345678" className="w-full h-16 px-6 rounded-2xl bg-background border border-border-subtle text-text-primary font-bold focus:border-primary transition-all outline-hidden pr-6 text-right" />
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {formData.phone.others.map((phone, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="space-y-2 relative group"
                                            >
                                                <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">رقم هاتف إضافي {idx + 1}</label>
                                                <div className="flex gap-2">
                                                    <input type="tel" value={phone} onChange={e => {
                                                        const newOthers = [...formData.phone.others];
                                                        newOthers[idx] = e.target.value;
                                                        setFormData({ ...formData, phone: { ...formData.phone, others: newOthers } });
                                                    }} dir="ltr" className="flex-1 h-16 px-6 rounded-2xl bg-background border border-border-subtle text-text-primary font-bold focus:border-primary transition-all outline-hidden pr-6 text-right" />
                                                    <button type="button" onClick={() => {
                                                        const newOthers = formData.phone.others.filter((_, i) => i !== idx);
                                                        setFormData({ ...formData, phone: { ...formData.phone, others: newOthers } });
                                                    }} className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shrink-0 active:scale-95">
                                                        <Trash2 className="w-6 h-6" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData({ ...formData, phone: { ...formData.phone, others: [...formData.phone.others, ''] } });
                                        }}
                                        className="w-full h-14 rounded-2xl border-2 border-dashed border-border-subtle/50 text-text-muted font-black flex items-center justify-center gap-3 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group mt-2"
                                    >
                                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        <span>إضافة رقم هاتف آخر</span>
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">العنوان بالتفصيل</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/40" />
                                        <input required type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full h-16 px-6 rounded-2xl bg-background border border-border-subtle text-text-primary font-bold focus:border-primary transition-all outline-hidden" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">مواعيد العمل اليومية</label>
                                    <div className="relative">
                                        <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/40" />
                                        <input required type="text" value={formData.openHours as string} onChange={e => setFormData({ ...formData, openHours: e.target.value })} className="w-full h-16 px-6 rounded-2xl bg-background border border-border-subtle text-text-primary font-bold focus:border-primary transition-all outline-hidden" />
                                    </div>
                                </div>
                            </div>

                            <div className="glass-panel p-8 rounded-[40px] border border-border-subtle/50 space-y-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xl font-black text-text-primary flex items-center gap-3">
                                        <Globe className="w-6 h-6 text-primary" />
                                        الروابط الاجتماعية
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData(prev => ({
                                                ...prev,
                                                socialLinks: [...prev.socialLinks, { platform: 'website', url: '' }]
                                            }));
                                        }}
                                        className="text-[10px] font-black text-primary hover:text-primary-hover px-3 py-1 rounded-lg bg-primary/10 transition-colors uppercase tracking-wider"
                                    >
                                        + إضافة رابط آخر
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <AnimatePresence initial={false}>
                                        {formData.socialLinks.map((link, index) => {
                                            const detectPlatform = (url: string) => {
                                                if (url.includes('facebook') || url.includes('fb.com')) return 'facebook';
                                                if (url.includes('instagram') || url.includes('instagr.am')) return 'instagram';
                                                return 'website';
                                            };

                                            const getIcon = (platform: string) => {
                                                switch (platform) {
                                                    case 'facebook': return <Facebook className="w-5 h-5" />;
                                                    case 'instagram': return <Instagram className="w-5 h-5" />;
                                                    default: return <Globe className="w-5 h-5" />;
                                                }
                                            };

                                            return (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                                    animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
                                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                                    className="relative group flex items-center gap-3"
                                                >
                                                    <div className="relative flex-1 group">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40 group-focus-within:text-primary transition-colors">
                                                            {getIcon(link.platform)}
                                                        </div>
                                                        <input
                                                            type="url"
                                                            value={link.url}
                                                            onChange={e => {
                                                                const newLinks = [...formData.socialLinks];
                                                                const url = e.target.value;
                                                                newLinks[index] = {
                                                                    url,
                                                                    platform: detectPlatform(url)
                                                                };
                                                                setFormData(prev => ({ ...prev, socialLinks: newLinks }));
                                                            }}
                                                            placeholder="أدخل رابط (فيسبوك، انستجرام، أو موقع)..."
                                                            className="w-full h-14 pl-12 pr-4 rounded-xl bg-background border border-border-subtle text-sm font-bold focus:border-primary transition-all outline-hidden"
                                                        />
                                                    </div>
                                                    {formData.socialLinks.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newLinks = formData.socialLinks.filter((_, i) => i !== index);
                                                                setFormData(prev => ({ ...prev, socialLinks: newLinks }));
                                                            }}
                                                            className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shrink-0"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button type="button" onClick={prevStep} className="h-16 px-8 rounded-2xl bg-surface border border-border-subtle text-text-primary font-black flex items-center justify-center gap-2 hover:bg-elevated transition-all">
                                    <ArrowRight className="w-5 h-5" />
                                    <span>السابق</span>
                                </button>
                                <button type="button" onClick={nextStep} className="flex-1 h-16 rounded-2xl bg-primary text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/25 hover:bg-primary-hover transition-all">
                                    <span>التالي</span>
                                    <ArrowRight className="w-6 h-6 rotate-180" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <div className="glass-panel p-8 rounded-[40px] border border-border-subtle/50 space-y-6">
                                <h3 className="text-xl font-black text-text-primary flex items-center gap-3 mb-2">
                                    <ImageIcon className="w-6 h-6 text-primary" />
                                    الصور والوصف
                                </h3>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">وصف النشاط</label>
                                    <textarea required rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-6 rounded-2xl bg-background border border-border-subtle text-text-primary font-bold focus:border-primary transition-all outline-hidden resize-none" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">صورة الغلاف</label>
                                    <div className="relative h-48 rounded-3xl border-2 border-dashed border-border-subtle flex flex-col items-center justify-center text-text-muted/40 hover:border-primary/50 hover:text-primary transition-all group overflow-hidden bg-background/30">
                                        {formData.imageUrl ? (
                                            <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 rounded-2xl bg-elevated border border-border-subtle flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                    {isUploading ? <Loader2 className="w-8 h-8 animate-spin text-primary" /> : <ImageIcon className="w-8 h-8" />}
                                                </div>
                                                <span className="font-bold text-sm">{isUploading ? 'جاري الرفع...' : 'اضغط لرفع الصورة'}</span>
                                            </>
                                        )}
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" disabled={isUploading} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button type="button" onClick={prevStep} className="h-16 px-8 rounded-2xl bg-surface border border-border-subtle text-text-primary font-black flex items-center justify-center gap-2 hover:bg-elevated transition-all">
                                    <ArrowRight className="w-5 h-5" />
                                    <span>السابق</span>
                                </button>
                                <button type="submit" disabled={isUploading} className="flex-1 h-16 rounded-2xl bg-linear-to-r from-accent to-accent/90 text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-accent/25 transition-all active:scale-[0.98] group">
                                    {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                    <span>حفظ التعديلات</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </div>
    );
}
