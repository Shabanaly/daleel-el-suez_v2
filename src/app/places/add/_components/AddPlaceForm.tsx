'use client';

import { AnimatePresence } from 'framer-motion';
import { useAddPlaceForm } from '../_hooks/useAddPlaceForm';
import { StepIndicator } from './StepIndicator';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2ContactInfo } from './Step2ContactInfo';
import { Step3MediaInfo } from './Step3MediaInfo';
import { SuccessState } from './SuccessState';

interface AddPlaceFormProps {
    categories: { id: number; name: string }[];
    areas: { id: number; name: string }[];
    districts: any[];
}

export function AddPlaceForm({ categories, areas, districts }: AddPlaceFormProps) {
    const {
        step,
        isSubmitted,
        isUploading,
        isVerifyingArea,
        error,
        formData,
        errors,
        localAreas,
        updateFormData,
        nextStep,
        prevStep,
        handleVerifyArea,
        handleFileChange,
        handleDeleteImage,
        handleSubmit
    } = useAddPlaceForm({ categories, areas });

    if (isSubmitted) {
        return <SuccessState />;
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
                        <Step1BasicInfo
                            formData={formData}
                            updateFormData={updateFormData}
                            categories={categories}
                            areas={localAreas}
                            districts={districts}
                            isVerifyingArea={isVerifyingArea}
                            handleVerifyArea={handleVerifyArea}
                            onNext={nextStep}
                            errors={errors}
                        />
                    )}

                    {step === 2 && (
                        <Step2ContactInfo
                            formData={formData}
                            updateFormData={updateFormData}
                            onNext={nextStep}
                            onBack={prevStep}
                            errors={errors}
                        />
                    )}

                    {step === 3 && (
                        <Step3MediaInfo
                            formData={formData}
                            updateFormData={updateFormData}
                            onFileChange={handleFileChange}
                            onDeleteImage={handleDeleteImage}
                            isUploading={isUploading}
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
