'use client';

import { useState } from 'react';
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import { createMarketAd, updateMarketAd } from '@/lib/actions/market';
import { useRouter } from 'next/navigation';
import { MarketAd } from '@/lib/types/market';

export function useCreateAdForm(initialAd?: MarketAd) {
    const router = useRouter();
    const {
        images,
        isBusy: isMediaBusy,
        error: mediaError,
        uploadFiles,
        startUpload,
        deleteImage
    } = useImageUpload({ 
        folder: 'market', 
        maxImages: 5,
        initialImages: initialAd?.images || []
    });

    const [step, setStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        title: initialAd?.title || '',
        description: initialAd?.description || '',
        price: initialAd?.price?.toString() || '',
        categoryId: initialAd?.category_id || '',
        areaId: initialAd?.area_id?.toString() || '',
        phone: initialAd?.seller_phone || '',
        condition: (initialAd?.condition as 'new' | 'used' | 'na') || 'used',
        isNegotiable: initialAd?.is_negotiable || false,
    });

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

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.categoryId) newErrors.categoryId = 'برجاء اختيار القسم';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title || formData.title.trim().length < 5) newErrors.title = 'العنوان يجب أن يكون 5 أحرف على الأقل';
        if (!formData.description || formData.description.trim().length < 10) newErrors.description = 'الوصف يحب أن يكون 10 أحرف على الأقل';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.price || isNaN(Number(formData.price))) newErrors.price = 'برجاء إدخال سعر صحيح';
        if (!formData.areaId) newErrors.areaId = 'برجاء اختيار المنطقة';
        const phoneRegex = /^01[0125][0-9]{8}$/;
        if (!formData.phone || !phoneRegex.test(formData.phone)) newErrors.phone = 'رقم الهاتف غير صحيح';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep4 = () => {
        const newErrors: Record<string, string> = {};
        if (images.length === 0) newErrors.images = 'برجاء رفع صورة واحدة على الأقل';
        if (images.length > 5) newErrors.images = 'الحد الأقصى هو 5 صور';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (step === 2 && validateStep2()) {
            setStep(3);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (step === 3 && validateStep3()) {
            setStep(4);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        if (step > 1) {
            setStep(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const validateAll = () => {
        return validateStep1() && validateStep2() && validateStep3() && validateStep4();
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!validateStep4() || !validateAll()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            // startUpload returns ALL images (existing + newly uploaded)
            const uploadResult = await startUpload();

            const currentAdData = {
                title: formData.title,
                description: formData.description,
                price: Number(formData.price),
                is_negotiable: formData.isNegotiable,
                currency: 'ج.م',
                category_id: formData.categoryId,
                area_id: Number(formData.areaId),
                condition: formData.condition,
                images: uploadResult.urls,
                status: 'active' as const,
                seller_phone: formData.phone,
            };

            if (initialAd) {
                await updateMarketAd(initialAd.id, currentAdData);
            } else {
                await createMarketAd(currentAdData);
            }

            setIsSubmitted(true);
            setTimeout(() => {
                router.push(initialAd ? '/market/my-ads' : '/market');
                router.refresh();
            }, 2000);
        } catch (err: unknown) {
            console.error('Submission error:', err);
            const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء نشر الإعلان';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        step,
        formData,
        errors,
        isSubmitting,
        isUploading: isMediaBusy || isSubmitting,
        isSubmitted,
        error: error || mediaError,
        images,
        updateFormData,
        handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => uploadFiles(e.target.files!),
        handleDeleteImage: deleteImage,
        nextStep,
        prevStep,
        handleSubmit
    };
}
