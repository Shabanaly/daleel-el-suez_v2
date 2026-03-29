'use client';

import { Phone, MapPin, Clock, ArrowRight, X, Facebook, Instagram, Globe, MessageCircle, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayKey, WeeklySchedule } from '@/lib/types/places';

interface Step2Props {
    formData: {
        phone: {
            primary: string;
            others: string[];
            whatsapp: string;
        };
        address: string;
        openHours: WeeklySchedule;
        socialLinks: { platform: string; url: string }[];
    };
    updateFormData: (data: Partial<Step2Props['formData']>) => void;
    onNext: () => void;
    onBack: () => void;
    errors?: Record<string, string>;
}

const daysMapping: { key: DayKey; label: string }[] = [
    { key: 'saturday', label: 'السبت' },
    { key: 'sunday', label: 'الأحد' },
    { key: 'monday', label: 'الاثنين' },
    { key: 'tuesday', label: 'الثلاثاء' },
    { key: 'wednesday', label: 'الأربعاء' },
    { key: 'thursday', label: 'الخميس' },
    { key: 'friday', label: 'الجمعة' },
];

export function Step2ContactInfo({ formData, updateFormData, onNext, onBack, errors }: Step2Props) {
    const is24Hours = (formData.openHours?.saturday?.isOpen && formData.openHours?.saturday?.from === '00:00' && formData.openHours?.saturday?.to === '23:59') || false;
    const fromTime = (!formData.openHours?.saturday?.isOpen || formData.openHours.saturday.from === '00:00') ? '09:00' : formData.openHours.saturday.from;
    const toTime = (!formData.openHours?.saturday?.isOpen || formData.openHours.saturday.to === '23:59') ? '22:00' : formData.openHours.saturday.to;

    const updateWorkingHours = (updates: { is24: boolean; from: string; to: string }) => {
        const payload = daysMapping.reduce((acc, { key }) => {
            acc[key] = {
                isOpen: true,
                from: updates.is24 ? '00:00' : updates.from,
                to: updates.is24 ? '23:59' : updates.to
            };
            return acc;
        }, {} as WeeklySchedule);
        updateFormData({ openHours: payload });
    };

    return (
        <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="glass-panel p-8 rounded-[40px] border border-border-subtle/50 space-y-6">
                <h3 className="text-xl font-black text-text-primary flex items-center gap-3 mb-2">
                    <Phone className="w-6 h-6 text-primary" />
                    بيانات التواصل
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">رقم الهاتف الأساسي</label>
                            <input
                                required
                                type="tel"
                                value={formData.phone.primary}
                                onChange={e => updateFormData({ phone: { ...formData.phone, primary: e.target.value } })}
                                placeholder="01xxxxxxxxx"
                                dir="ltr"
                                className={`w-full h-16 px-6 rounded-2xl bg-background border ${errors?.phone ? 'border-red-500' : 'border-border-subtle'} text-text-primary font-bold placeholder:text-text-muted/30 focus:border-primary transition-all outline-hidden pr-6 text-right`}
                            />
                            {errors?.phone && <p className="text-red-500 text-[10px] font-bold mt-1 mr-3">{errors.phone}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted mr-3 block uppercase tracking-wide">رقم واتساب (اختياري)</label>
                            <div className="relative">
                                <MessageCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/40" />
                                <input
                                    type="tel"
                                    value={formData.phone.whatsapp}
                                    onChange={e => updateFormData({ phone: { ...formData.phone, whatsapp: e.target.value } })}
                                    placeholder="01xxxxxxxxx"
                                    dir="ltr"
                                    className="w-full h-16 px-6 rounded-2xl bg-background border border-border-subtle text-text-primary font-bold placeholder:text-text-muted/30 focus:border-primary transition-all outline-hidden pr-6 text-right"
                                />
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
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={e => {
                                                const newOthers = [...formData.phone.others];
                                                newOthers[idx] = e.target.value;
                                                updateFormData({ phone: { ...formData.phone, others: newOthers } });
                                            }}
                                            dir="ltr"
                                            className="flex-1 h-16 px-6 rounded-2xl bg-background border border-border-subtle text-text-primary font-bold focus:border-primary transition-all outline-hidden pr-6 text-right"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newOthers = formData.phone.others.filter((_, i) => i !== idx);
                                                updateFormData({ phone: { ...formData.phone, others: newOthers } });
                                            }}
                                            className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shrink-0 active:scale-95"
                                        >
                                            <Trash2 className="w-6 h-6" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <button
                            type="button"
                            onClick={() => {
                                updateFormData({ phone: { ...formData.phone, others: [...formData.phone.others, ''] } });
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
                            <input
                                required
                                type="text"
                                value={formData.address}
                                onChange={e => updateFormData({ address: e.target.value })}
                                placeholder="مثال: شارع النهضة، خلف بنك مصر..."
                                className={`w-full h-16 px-6 rounded-2xl bg-background border ${errors?.address ? 'border-red-500' : 'border-border-subtle'} text-text-primary font-bold placeholder:text-text-muted/30 focus:border-primary transition-all outline-hidden`}
                            />
                        </div>
                        {errors?.address && <p className="text-red-500 text-[10px] font-bold mt-1 mr-3">{errors.address}</p>}
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border-subtle/30">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-black text-text-muted mr-3 uppercase tracking-wide flex items-center gap-2">
                            <Globe className="w-4 h-4 text-primary" />
                            الروابط الاجتماعية
                        </label>
                        <button
                            type="button"
                            onClick={() => {
                                updateFormData({
                                    socialLinks: [...formData.socialLinks, { platform: 'website', url: '' }]
                                });
                            }}
                            className="text-[10px] font-black text-primary hover:text-primary-hover px-3 py-1 rounded-lg bg-primary/10 transition-colors uppercase tracking-wider"
                        >
                            + إضافة رابط آخر
                        </button>
                    </div>

                    <div className="space-y-3">
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
                                                    updateFormData({ socialLinks: newLinks });
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
                                                    updateFormData({ socialLinks: newLinks });
                                                }}
                                                className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shrink-0"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border-subtle/30">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-text-muted mr-3 uppercase tracking-wide flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            مواعيد العمل الأسبوعية
                        </label>
                        {errors?.openHours && <p className="text-red-500 text-[10px] font-bold">{errors.openHours}</p>}
                    </div>

                    <div className="grid gap-3">
                        <div className="bg-surface-elevated/50 border border-border-subtle/50 rounded-[28px] overflow-hidden">
                            <label 
                                onClick={(e) => { e.preventDefault(); updateWorkingHours({ is24: !is24Hours, from: fromTime as string, to: toTime as string }); }}
                                className="flex items-center justify-between p-5 cursor-pointer hover:bg-surface-elevated transition-colors"
                            >
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-text-primary">مفتوح 24 ساعة</span>
                                    <span className="text-[10px] font-bold text-text-muted mt-0.5">المكان يعمل طوال اليوم بدون إغلاق</span>
                                </div>
                                <div className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${is24Hours ? 'bg-primary' : 'bg-text-muted/20'}`}>
                                    <div className={`absolute top-1.5 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${is24Hours ? 'right-6' : 'right-1.5'}`} />
                                </div>
                            </label>
                            
                            <AnimatePresence>
                                {!is24Hours && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex gap-4 p-5 pt-0 border-t border-border-subtle/20 mt-2">
                                            <div className="flex-1 space-y-2">
                                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mr-2 block">وقت الفتح</span>
                                                <input
                                                    type="time"
                                                    value={fromTime || ''}
                                                    onChange={e => updateWorkingHours({ is24: false, from: e.target.value, to: toTime as string })}
                                                    className="w-full h-12 px-4 rounded-xl bg-background border border-border-subtle text-sm font-black focus:border-primary transition-all outline-none"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mr-2 block">وقت الإغلاق</span>
                                                <input
                                                    type="time"
                                                    value={toTime || ''}
                                                    onChange={e => updateWorkingHours({ is24: false, from: fromTime as string, to: e.target.value })}
                                                    className="w-full h-12 px-4 rounded-xl bg-background border border-border-subtle text-sm font-black focus:border-primary transition-all outline-none"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="h-16 px-8 rounded-2xl bg-surface border border-border-subtle text-text-primary font-black flex items-center justify-center gap-2 hover:bg-elevated transition-all"
                >
                    <ArrowRight className="w-5 h-5" />
                    <span>السابق</span>
                </button>
                <button
                    type="button"
                    onClick={onNext}
                    className="flex-1 h-16 rounded-2xl bg-primary text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/25 hover:bg-primary-hover transition-all active:scale-[0.98]"
                >
                    <span>التالي</span>
                    <ArrowRight className="w-6 h-6 rotate-180" />
                </button>
            </div>
        </motion.div>
    );
}
