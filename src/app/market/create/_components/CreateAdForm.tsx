'use client';

import { useCreateAdForm } from '../_hooks/useCreateAdForm';
import { MarketCategory } from '@/lib/types/market';
import { CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

import { MarketStepIndicator } from './MarketStepIndicator';
import MarketStep1Category from './MarketStep1Category';
import { MarketStep1BasicInfo } from './MarketStep1BasicInfo';
import { MarketStep2PricingContact } from './MarketStep2PricingContact';
import { MarketStep3Media } from './MarketStep3Media';

interface CreateAdFormProps {
    categories: MarketCategory[];
    areas: { id: number; name: string }[];
}

export function CreateAdForm({ categories, areas }: CreateAdFormProps) {
    const {
        step,
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
        nextStep,
        prevStep,
        handleSubmit
    } = useCreateAdForm();

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
        <div className="w-full max-w-4xl mx-auto pb-32">
            <MarketStepIndicator currentStep={step} />

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold text-center mb-6"
                    >
                        {error}
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <MarketStep1Category
                            key="category-step"
                            categories={categories}
                            selectedId={formData.categoryId}
                            onSelect={(id) => updateFormData({ categoryId: id })}
                            onNext={nextStep}
                        />
                    )}

                    {step === 2 && (
                        <MarketStep1BasicInfo
                            key="basic-info-step"
                            formData={formData}
                            updateFormData={updateFormData}
                            categories={categories}
                            onNext={nextStep}
                            errors={errors}
                        />
                    )}

                    {step === 3 && (
                        <MarketStep2PricingContact
                            key="pricing-step"
                            formData={formData}
                            updateFormData={updateFormData}
                            areas={areas}
                            onNext={nextStep}
                            onBack={prevStep}
                            errors={errors}
                        />
                    )}

                    {step === 4 && (
                        <MarketStep3Media
                            key="media-step"
                            images={images}
                            onFileChange={handleFileChange}
                            onDeleteImage={handleDeleteImage}
                            isUploading={isUploading || isSubmitting}
                            onSubmit={handleSubmit}
                            onBack={prevStep}
                            errors={errors}
                        />
                    )}
                </AnimatePresence>
            </form>
        </div>
    );
}
