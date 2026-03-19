'use client';

import { useState, useEffect } from 'react';
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import { createMarketAd } from '@/lib/actions/market';
import { MarketCategory } from '@/lib/types/market';
import { useRouter } from 'next/navigation';

interface UseCreateAdFormProps {
    categories: MarketCategory[];
    areas: { id: number; name: string }[];
}

export function useCreateAdForm({ categories, areas }: UseCreateAdFormProps) {
    const router = useRouter();
    const {
        images,
        publicIds,
        isUploading: isMediaUploading,
        isBusy: isMediaBusy,
        error: mediaError,
        uploadFiles,
        startUpload,
        deleteImage
    } = useImageUpload({ folder: 'market', maxImages: 10 });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        categoryId: '',
        areaId: '',
        phone: '',
        condition: 'used' as 'new' | 'used' | 'na',
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

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title || formData.title.length < 5) {
            newErrors.title = 'العنوان يجب أن يكون 5 أحرف على الأقل';
        }
        if (!formData.description || formData.description.length < 10) {
            newErrors.description = 'الوصف يحب أن يكون 10 أحرف على الأقل';
        }
        if (!formData.price || isNaN(Number(formData.price))) {
            newErrors.price = 'برجاء إدخال سعر صحيح';
        }
        if (!formData.categoryId) {
            newErrors.categoryId = 'برجاء اختيار القسم';
        }
        if (!formData.areaId) {
            newErrors.areaId = 'برجاء اختيار المنطقة';
        }
        const phoneRegex = /^01[0125][0-9]{8}$/;
        if (!formData.phone || !phoneRegex.test(formData.phone)) {
            newErrors.phone = 'رقم الهاتف غير صحيح';
        }
        if (images.length === 0) {
            newErrors.images = 'برجاء رفع صورة واحدة على الأقل';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            // 1. Upload images first
            const uploadResult = await startUpload();

            // 2. Create the ad
            await createMarketAd({
                title: formData.title,
                description: formData.description,
                price: Number(formData.price),
                currency: 'ج.م',
                category_id: formData.categoryId,
                area_id: Number(formData.areaId),
                condition: formData.condition,
                images: uploadResult.urls,
                status: 'active',
                seller_phone: formData.phone,
                // seller_id will be handled by the server action from the session
            });

            setIsSubmitted(true);
            setTimeout(() => {
                router.push('/market');
                router.refresh();
            }, 2000);
        } catch (err: any) {
            console.error('Submission error:', err);
            setError(err.message || 'حدث خطأ أثناء نشر الإعلان');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
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
        handleSubmit
    };
}
