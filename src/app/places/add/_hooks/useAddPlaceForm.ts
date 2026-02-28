'use client';

import { useState, useEffect } from 'react';
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import { addPlace } from '@/lib/actions/mutations';
import { getOrCreateArea } from '@/lib/actions/areas';
import { WeeklySchedule } from '@/lib/types/places';

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
    districts?: any[]; // added for future use if needed inside the hook
}

export function useAddPlaceForm({ categories, areas, districts }: UseAddPlaceFormProps) {
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

    // Update formData when hook state changes
    useEffect(() => {
        setFormData(prev => {
            // Only update if there's an actual change to prevent unnecessary renders
            const imagesChanged = JSON.stringify(prev.images) !== JSON.stringify(images);
            const publicIdsChanged = JSON.stringify(prev.publicIds) !== JSON.stringify(publicIds);

            if (imagesChanged || publicIdsChanged) {
                return { ...prev, images, publicIds };
            }
            return prev;
        });
    }, [images, publicIds]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateFormData = (data: Partial<typeof formData>) => {
        setFormData(prev => ({ ...prev, ...data }));
        if (Object.keys(data).length > 0) {
            const field = Object.keys(data)[0];
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateStep = (currentStep: number) => {
        const newErrors: Record<string, string> = {};

        if (currentStep === 1) {
            if (!formData.name || formData.name.length < 3) {
                newErrors.name = 'الاسم يجب أن يكون 3 أحرف على الأقل';
            }
            if (!formData.categoryId) newErrors.categoryId = 'يرجى اختيار التصنيف';
            if (!formData.areaId) newErrors.areaId = 'يرجى اختيار المنطقة';

            if (formData.areaId === -1) {
                newErrors.areaId = 'يرجى التحقق من المنطقة الجديدة وإضافتها أولاً';
                // Also validate the inputs themselves for immediate feedback
                if (!formData.customAreaName || formData.customAreaName.length < 2) {
                    newErrors.customAreaName = 'الرجاء إدخال اسم المنطقة بشكل صحيح';
                }
                if (!formData.customDistrictId) {
                    newErrors.customDistrictId = 'الرجاء اختيار الحي التابع للمنطقة';
                }
            }
        }

        if (currentStep === 2) {
            const phoneRegex = /^01[0125][0-9]{8}$/;
            if (!formData.phone.primary || !phoneRegex.test(formData.phone.primary)) {
                newErrors.phone = 'رقم الهاتف الأساسي غير صحيح (يجب أن يكون رقم مصري)';
            }
            if (!formData.address || formData.address.length < 5) {
                newErrors.address = 'العنوان يجب أن يكون 5 أحرف على الأقل';
            }

            Object.entries(formData.openHours).forEach(([day, schedule]) => {
                if (schedule.isOpen && (!schedule.from || !schedule.to)) {
                    newErrors.openHours = 'يرجى تحديد مواعيد العمل للأيام المفتوحة';
                }
            });
        }

        if (currentStep === 3) {
            if (!formData.description || formData.description.length < 10) {
                newErrors.description = 'الوصف يجب أن يكون 10 أحرف على الأقل';
            }
            if (formData.images.length === 0) {
                newErrors.images = 'يرجى رفع صورة واحدة على الأقل (صورة الغلاف)';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const prevStep = () => {
        setStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleVerifyArea = async () => {
        if (!formData.customAreaName || formData.customAreaName.length < 2) {
            setErrors({ ...errors, customAreaName: 'الرجاء إدخال اسم المنطقة بشكل صحيح' });
            return;
        }
        if (!formData.customDistrictId) {
            setErrors({ ...errors, customDistrictId: 'الرجاء اختيار الحي التابع للمنطقة' });
            return;
        }

        setIsVerifyingArea(true);
        setError(null);

        try {
            const searchName = formData.customAreaName.trim().toLowerCase();

            // 1. Client-Side Validation (Smart Match across all districts)
            const normalizeText = (text: string) => text
                .replace(/[أإآا]/g, 'ا') // Normalize aleph
                .replace(/[ةه]/g, 'ه')   // Normalize teh marbuta/heh
                .replace(/[يى]/g, 'ي')   // Normalize yeh/alef maksura
                .trim()
                .toLowerCase();

            const ignoreWords = ['حي', 'منطقة', 'شارع', 'ش', 'مدينة', 'مساكن', 'تعاونيات', 'تقسيم', 'قرية', 'عزبة', 'بمنطقة', 'بحي', 'مدينة', 'و', 'في', 'من', 'ال', 'ابو', 'أبو'];
            const normalizedIgnoreWords = ignoreWords.map(normalizeText);

            const normalizedSearch = normalizeText(formData.customAreaName);
            const searchWords = normalizedSearch
                .split(/\s+/)
                .filter(w => w.length > 2 && !normalizedIgnoreWords.includes(w));

            // First try exact normalized match
            let localMatch = localAreas.find(a => normalizeText(a.name) === normalizedSearch);

            // If no exact match, try smart word intersection match
            if (!localMatch && searchWords.length > 0) {
                localMatch = localAreas.find(a => {
                    const areaWords = normalizeText(a.name).split(/\s+/);
                    return searchWords.some(searchWord => areaWords.includes(searchWord));
                });
            }

            if (localMatch) {
                // Found locally! Just switch the dropdown to it
                updateFormData({ areaId: localMatch.id, customAreaName: '', customDistrictId: 0 });
                console.log('Area found locally (Smart Match), auto-selecting ID:', localMatch.id);
            } else {
                // 2. Not found locally, hit the server
                const newAreaId = await getOrCreateArea(formData.customAreaName, formData.customDistrictId);

                // Add to local state so dropdown has it
                setLocalAreas(prev => [...prev, { id: newAreaId, name: formData.customAreaName.trim() }]);

                // Switch dropdown to the new area
                updateFormData({ areaId: newAreaId, customAreaName: '', customDistrictId: 0 });
                console.log('New area created and selected:', newAreaId);
            }

            // Clear area errors
            const newErrors = { ...errors };
            delete newErrors.areaId;
            delete newErrors.customAreaName;
            delete newErrors.customDistrictId;
            setErrors(newErrors);

        } catch (err: any) {
            console.error('Area Verification Error:', err);
            setError(err.message || 'فشل التحقق من المنطقة');
        } finally {
            setIsVerifyingArea(false);
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!validateStep(3)) return;

        setIsSubmitting(true);
        setError(null);

        try {
            // 1. Start image upload
            const uploadResult = await startUpload();

            // 2. Add place with final URLs, Public IDs
            await addPlace({
                ...formData,
                images: uploadResult.urls,
                publicIds: uploadResult.publicIds
            });

            setIsSubmitted(true);
        } catch (err: any) {
            console.error('Submission error:', err);
            setError(err.message || 'حدث خطأ أثناء حفظ البيانات');
        } finally {
            setIsSubmitting(false);
        }
    };

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
        handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => uploadFiles(e.target.files!),
        handleDeleteImage: deleteImage,
        handleSubmit
    };
}
