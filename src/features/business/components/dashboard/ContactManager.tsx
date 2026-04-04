'use client';

import { useState } from 'react';
import { Place } from '@/features/places/types';
import { updatePlaceBasicInfo } from '@/features/business/actions/business.server';
import { Phone, Check, X, RotateCcw, Plus, MessageCircle } from 'lucide-react';
import { useDialog } from '@/components/providers/DialogProvider';
import { useRouter } from 'next/navigation';

interface PhoneData {
    primary: string;
    whatsapp: string;
    others: string[];
}

interface ContactManagerProps {
    place: Place;
}

export function ContactManager({ place }: ContactManagerProps) {
    const router = useRouter();
    const { showAlert, showConfirm } = useDialog();

    // ensure structure matches DB expectations
    const initialPhone: PhoneData = {
        primary: place.phoneNumber?.primary || '',
        whatsapp: place.phoneNumber?.whatsapp || '',
        others: place.phoneNumber?.others || []
    };

    const [phone, setPhone] = useState<PhoneData>(initialPhone);
    const [isSaving, setIsSaving] = useState(false);
    
    const isDirty = JSON.stringify(phone) !== JSON.stringify(initialPhone);

    const handleAddOtherField = () => {
        setPhone(prev => ({ ...prev, others: [...prev.others, ''] }));
    };

    const handleRemoveOtherField = (indexToRemove: number) => {
        setPhone(prev => ({
            ...prev,
            others: prev.others.filter((_, idx) => idx !== indexToRemove)
        }));
    };

    const handleUpdateOtherField = (index: number, value: string) => {
        setPhone(prev => {
            const updated = [...prev.others];
            updated[index] = value;
            return { ...prev, others: updated };
        });
    };

    const handleSave = async () => {
        if (!phone.primary.trim()) {
            showAlert({ title: 'خطأ', message: 'رقم الهاتف الأساسي مطلوب.', type: 'error' });
            return;
        }

        // Clean empty other phones
        const cleanedPhone = {
            ...phone,
            others: phone.others.filter(p => p.trim() !== '')
        };

        setIsSaving(true);
        const result = await updatePlaceBasicInfo(place.id, 'phone', cleanedPhone);
        setIsSaving(false);

        if (result.success) {
            showAlert({ title: 'تم الحفظ', message: 'تم حفظ أرقام التواصل بنجاح.', type: 'success' });
            // update state array to match cleaned version
            setPhone(cleanedPhone); 
            router.refresh();
        } else {
            showAlert({ title: 'خطأ', message: result.error || 'حدث خطأ غير متوقع.', type: 'error' });
        }
    };

    const handleReset = () => {
        showConfirm({
            title: 'تأكيد التراجع',
            message: 'هل أنت متأكد من رغبتك في إلغاء التغييرات غير المحفوظة؟',
            onConfirm: () => {
                setPhone(initialPhone);
            }
        });
    };

    return (
        <div className="border-b border-border-subtle last:border-0 py-5">
            <div className="flex items-center gap-2 mb-4">
                <span className="p-1.5 rounded-lg bg-surface-elevated text-text-muted">
                    <Phone className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-black text-text-muted uppercase tracking-wider">أرقام التواصل</span>
                {isDirty && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 mr-auto">
                        غير محفوظ
                    </span>
                )}
            </div>

            <div className="space-y-4">
                {/* Primary & Whatsapp */}
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-text-muted mb-1 block">رقم الهاتف (الأساسي تعتمد عليه الحجوزات)</label>
                        <div className="relative">
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                                <Phone className="w-4 h-4" />
                            </span>
                            <input
                                type="tel"
                                value={phone.primary}
                                onChange={(e) => setPhone({ ...phone, primary: e.target.value })}
                                placeholder="01xxxxxxxxx"
                                className="w-full h-11 bg-background border border-border-subtle rounded-xl pr-10 pl-3 text-sm focus:border-primary outline-none transition-colors dir-ltr text-right"
                                disabled={isSaving}
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-text-muted mb-1 block">رقم الواتساب (اختياري)</label>
                        <div className="relative">
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                                <MessageCircle className="w-4 h-4" />
                            </span>
                            <input
                                type="tel"
                                value={phone.whatsapp}
                                onChange={(e) => setPhone({ ...phone, whatsapp: e.target.value })}
                                placeholder="01xxxxxxxxx"
                                className="w-full h-11 bg-background border border-border-subtle rounded-xl pr-10 pl-3 text-sm focus:border-emerald-500 outline-none transition-colors dir-ltr text-right"
                                disabled={isSaving}
                                dir="ltr"
                            />
                        </div>
                    </div>
                </div>

                {/* Additional phones */}
                <div className="space-y-2 pt-2 border-t border-border-subtle">
                    <label className="text-xs font-bold text-text-muted mb-1 block">أرقام هواتف إضافية (اختياري)</label>
                    {phone.others.map((otherPhone, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <div className="relative flex-1">
                                <input
                                    type="tel"
                                    value={otherPhone}
                                    onChange={(e) => handleUpdateOtherField(index, e.target.value)}
                                    placeholder="رقم آخر..."
                                    className="w-full h-11 bg-background border border-border-subtle rounded-xl px-3 text-sm focus:border-primary outline-none transition-colors"
                                    disabled={isSaving}
                                    dir="ltr"
                                />
                            </div>
                            <button 
                                onClick={() => handleRemoveOtherField(index)}
                                disabled={isSaving}
                                className="h-11 w-11 flex items-center justify-center shrink-0 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    
                    <button
                        onClick={handleAddOtherField}
                        disabled={isSaving || phone.others.length >= 3}
                        className="w-full h-10 bg-surface-elevated text-text-muted rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-dashed border-border-standard hover:border-primary/50 hover:text-primary transition-all disabled:opacity-50"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        إضافة رقم آخر
                    </button>
                </div>

                {/* Action Buttons */}
                {isDirty && (
                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 h-10 bg-primary text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40"
                        >
                            {isSaving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            حفظ أرقام الهاتف
                        </button>
                        <button
                            onClick={handleReset}
                            disabled={isSaving}
                            className="h-10 px-4 bg-surface-elevated text-text-muted rounded-xl text-xs font-black flex items-center gap-1.5 hover:bg-border-subtle transition-all"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
