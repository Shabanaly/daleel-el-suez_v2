'use client';

import { useState, useEffect, useCallback } from 'react';
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import { addPlace } from '@/lib/actions/mutations';
import { getOrCreateArea } from '@/features/taxonomy/actions/areas';
import { WeeklySchedule } from '@/features/places/types';

const defaultSchedule: WeeklySchedule = {
    saturday: { isOpen: false, from: '09:00', to: '22:00' },
    sunday: { isOpen: false, from: '09:00', to: '22:00' },
    monday: { isOpen: false, from: '09:00', to: '22:00' },
    tuesday: { isOpen: false, from: '09:00', to: '22:00' },
    wednesday: { isOpen: false, from: '09:00', to: '22:00' },
    thursday: { isOpen: false, from: '09:00', to: '22:00' },
    friday: { isOpen: false, from: '09:00', to: '22:00' },
};

interface UseAddPlaceFormProps {
    categories: { id: number; name: string }[];
    areas: { id: number; name: string }[];
}

export function useAddPlaceForm({ areas }: UseAddPlaceFormProps) {
    const {
        images,
        publicIds,
        isUploading: isMediaUploading,
        error: mediaError,
        uploadFiles,
        startUpload,
        deleteImage
    } = useImageUpload({ folder: 'places', maxImages: 5 });

    const [localAreas, setLocalAreas] = useState(areas);
    const [step, setStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifyingArea, setIsVerifyingArea] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        categoryId: 0,
        areaId: 0,
        phone: {
            primary: '',
            others: [] as string[],
            whatsapp: ''
        },
        address: '',
        openHours: defaultSchedule,
        description: '',
        images: [] as string[],
        publicIds: [] as string[],
        socialLinks: [
            { platform: 'website', url: '' }
        ],
        customAreaName: '',
        customDistrictId: 0
    });

    useEffect(() => {
        setFormData(prev => {
            if (JSON.stringify(prev.images) === JSON.stringify(images) && JSON.stringify(prev.publicIds) === JSON.stringify(publicIds)) {
                return prev;
            }
            return { ...prev, images, publicIds };
        });
    }, [images, publicIds]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateFormData = useCallback((data: Partial<typeof formData>) => {
        setFormData(prev => {
            // Shallow comparison for top-level keys to avoid unnecessary updates
            const hasChange = Object.entries(data).some(([key, value]) => prev[key as keyof typeof prev] !== value);
            if (!hasChange) return prev;
            
            return { ...prev, ...data };
        });

        // Clear error for the field being updated
        if (Object.keys(data).length > 0) {
            const field = Object.keys(data)[0];
            setErrors(prev => {
                if (!prev[field]) return prev;
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }, []);

    const validateStep = useCallback((currentStep: number, currentData: typeof formData) => {
        const newErrors: Record<string, string> = {};

        if (currentStep === 1) {
            if (!currentData.name || currentData.name.length < 3) {
                newErrors.name = 'الاسم يجب أن يكون 3 أحرف على الأقل';
            }
            if (!currentData.categoryId) newErrors.categoryId = 'يرجى اختيار التصنيف';
            if (!currentData.areaId) newErrors.areaId = 'يرجى اختيار المنطقة';

            if (currentData.areaId === -1) {
                if (!currentData.customAreaName || currentData.customAreaName.length < 2) {
                    newErrors.customAreaName = 'الرجاء إدخال اسم المنطقة بشكل صحيح';
                }
                if (!currentData.customDistrictId) {
                    newErrors.customDistrictId = 'الرجاء اختيار الحي التابع للمنطقة';
                }
            }
        }

        if (currentStep === 2) {
            // Support both local 01... and international +201... formats
            const phoneRegex = /^(\+20|0)1[0125][0-9]{8}$/;
            if (!currentData.phone.primary || !phoneRegex.test(currentData.phone.primary)) {
                newErrors.phone = 'رقم الهاتف الأساسي غير صحيح (يجب أن يكون رقم مصري)';
            }
            if (!currentData.address || currentData.address.length < 5) {
                newErrors.address = 'العنوان يجب أن يكون 5 أحرف على الأقل';
            }

            Object.entries(currentData.openHours).forEach(([, schedule]) => {
                if (schedule.isOpen && (!schedule.from || !schedule.to)) {
                    newErrors.openHours = 'يرجى تحديد مواعيد العمل للأيام المفتوحة';
                }
            });
        }

        if (currentStep === 3) {
            if (!currentData.description || currentData.description.length < 10) {
                newErrors.description = 'الوصف يجب أن يكون 10 أحرف على الأقل';
            }
            if (currentData.images.length === 0) {
                newErrors.images = 'يرجى رفع صورة واحدة على الأقل (صورة الغلاف)';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, []);

    const nextStep = useCallback(() => {
        if (validateStep(step, formData)) {
            setStep(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    }, [step, validateStep, formData]);

    const prevStep = useCallback(() => {
        setStep(prev => prev - 1);
        window.scrollTo(0, 0);
    }, []);

    const handleVerifyArea = useCallback(async () => {
        if (!formData.customAreaName || formData.customAreaName.length < 2) {
            setErrors(prev => ({ ...prev, customAreaName: 'الرجاء إدخال اسم المنطقة بشكل صحيح' }));
            return;
        }
        if (!formData.customDistrictId) {
            setErrors(prev => ({ ...prev, customDistrictId: 'الرجاء اختيار الحي التابع للمنطقة' }));
            return;
        }

        setIsVerifyingArea(true);
        setError(null);

        try {
            // Normalize text helper
            const normalizeText = (text: string) => text
                .replace(/[أإآا]/g, 'ا').replace(/[ةه]/g, 'ه').replace(/[يى]/g, 'ي')
                .trim().toLowerCase();

            const ignoreWords = ['حي', 'منطقة', 'شارع', 'ش', 'مدينة', 'مساكن', 'تعاونيات', 'تقسيم', 'قرية', 'عزبة', 'بمنطقة', 'بحي', 'مدينة', 'و', 'في', 'من', 'ال', 'ابو', 'أبو'];
            const normalizedSearch = normalizeText(formData.customAreaName);
            
            const searchWords = normalizedSearch.split(/\s+/)
                .filter(w => w.length > 2 && !ignoreWords.map(normalizeText).includes(w));

            let localMatch = localAreas.find(a => normalizeText(a.name) === normalizedSearch);

            if (!localMatch && searchWords.length > 0) {
                localMatch = localAreas.find(a => {
                    const areaWords = normalizeText(a.name).split(/\s+/);
                    return searchWords.some(searchWord => areaWords.includes(searchWord));
                });
            }

            if (localMatch) {
                updateFormData({ areaId: localMatch.id, customAreaName: '', customDistrictId: 0 });
            } else {
                const newAreaId = await getOrCreateArea(formData.customAreaName, formData.customDistrictId);
                setLocalAreas(prev => [...prev, { id: newAreaId, name: formData.customAreaName.trim() }]);
                updateFormData({ areaId: newAreaId, customAreaName: '', customDistrictId: 0 });
            }

            setErrors(prev => {
                const next = { ...prev };
                delete next.areaId; delete next.customAreaName; delete next.customDistrictId;
                return next;
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : 'فشل التحقق من المنطقة');
        } finally {
            setIsVerifyingArea(false);
        }
    }, [formData, localAreas, updateFormData]);

    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        if (!validateStep(3, formData)) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const uploadResult = await startUpload();
            await addPlace({
                ...formData,
                images: uploadResult.urls,
                publicIds: uploadResult.publicIds
            });
            setIsSubmitted(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ البيانات');
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, startUpload, validateStep]);


    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) uploadFiles(e.target.files);
    }, [uploadFiles]);

    return {
        step,
        isSubmitted,
        isUploading: isMediaUploading || isSubmitting,
        isVerifyingArea,
        error: error || mediaError,
        formData,
        errors,
        localAreas,
        updateFormData,
        nextStep,
        prevStep,
        handleVerifyArea,
        handleFileChange,
        handleDeleteImage: deleteImage,
        handleSubmit
    };
}

