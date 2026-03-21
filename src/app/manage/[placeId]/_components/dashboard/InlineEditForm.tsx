'use client';

import { useState } from 'react';
import { Pencil, Check, X, Phone, MapPin, Clock, Type, AlignLeft } from 'lucide-react';
import { Place } from '@/lib/types/places';
import { updatePlaceBasicInfo } from '@/lib/actions/business';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useDialog } from '@/components/providers/DialogProvider';

interface InlineEditFormProps {
    place: Place;
}

interface EditableFieldProps {
    label: string;
    value: string;
    fieldName: string;
    icon: React.ReactNode;
    type?: 'text' | 'textarea' | 'tel';
    onSave: (fieldName: string, newValue: string) => Promise<void>;
}

function EditableField({ label, value, fieldName, icon, type = 'text', onSave }: EditableFieldProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (currentValue === value) {
            setIsEditing(false);
            return;
        }
        setIsLoading(true);
        await onSave(fieldName, currentValue);
        setIsLoading(false);
        setIsEditing(false);
    };

    return (
        <div className="group border-b border-border-subtle last:border-0 py-5 transition-colors">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="p-1.5 rounded-lg bg-surface-elevated text-text-muted">
                            {icon}
                        </span>
                        <span className="text-xs font-black text-text-muted uppercase tracking-wider">{label}</span>
                    </div>

                    <AnimatePresence mode="wait">
                        {isEditing ? (
                            <motion.div 
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="mt-2"
                            >
                                {type === 'textarea' ? (
                                    <textarea
                                        autoFocus
                                        value={currentValue}
                                        onChange={(e) => setCurrentValue(e.target.value)}
                                        className="w-full bg-background border-2 border-primary/20 rounded-2xl p-4 text-sm font-bold focus:border-primary outline-none min-h-[120px] transition-all"
                                    />
                                ) : (
                                    <input
                                        autoFocus
                                        type={type}
                                        value={currentValue}
                                        onChange={(e) => setCurrentValue(e.target.value)}
                                        className="w-full h-12 bg-background border-2 border-primary/20 rounded-xl px-4 text-sm font-bold focus:border-primary outline-none transition-all"
                                    />
                                )}
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={handleSave}
                                        disabled={isLoading}
                                        className="bg-primary text-white h-10 px-6 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                                        حفظ التغيير
                                    </button>
                                    <button
                                        onClick={() => {
                                            setCurrentValue(value);
                                            setIsEditing(false);
                                        }}
                                        className="bg-surface-elevated text-text-muted h-10 px-6 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-border-subtle transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                        إلغاء
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex items-center justify-between group/val">
                                <p className="text-sm md:text-base font-bold text-text-primary px-1">
                                    {value || <span className="text-text-muted opacity-40 font-medium italic">لم يتم التحديد بعد...</span>}
                                </p>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-95"
                                    title="تعديل هذا الحقل"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export function InlineEditForm({ place }: InlineEditFormProps) {
    const router = useRouter();
    const { showAlert } = useDialog();

    const handleFieldSave = async (fieldName: string, newValue: string) => {
        // Now calling a single specialized server action that handles all formatting
        const result = await updatePlaceBasicInfo(place.id, fieldName, newValue);
        
        if (!result.success) {
            console.error('Update failed:', result.error);
            showAlert({
                title: 'فشل التحديث',
                message: `حدث خطأ أثناء حفظ البيانات: ${result.error}`,
                type: 'error'
            });
        } else {
            router.refresh();
        }
    };

    return (
        <div className="flex flex-col">
            <EditableField
                label="اسم النشاط"
                value={place.name}
                fieldName="name"
                icon={<Type className="w-3.5 h-3.5" />}
                onSave={handleFieldSave}
            />
            <EditableField
                label="وصف المكان"
                value={place.description || ''}
                fieldName="description"
                type="textarea"
                icon={<AlignLeft className="w-3.5 h-3.5" />}
                onSave={handleFieldSave}
            />
            <EditableField
                label="رقم الهاتف"
                value={place.phoneNumber.primary || ''}
                fieldName="phone"
                type="tel"
                icon={<Phone className="w-3.5 h-3.5" />}
                onSave={handleFieldSave}
            />
            <EditableField
                label="ساعات العمل"
                value={place.openHours || ''}
                fieldName="working_hours"
                icon={<Clock className="w-3.5 h-3.5" />}
                onSave={handleFieldSave}
            />
            <EditableField
                label="العنوان بالتفصيل"
                value={place.address || ''}
                fieldName="address"
                icon={<MapPin className="w-3.5 h-3.5" />}
                onSave={handleFieldSave}
            />
        </div>
    );
}
