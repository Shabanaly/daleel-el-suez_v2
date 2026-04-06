"use client";

import Image from 'next/image';
import CustomLink from '@/components/customLink/customLink';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { AuthFormUI } from '@/features/auth/components/AuthFormUI';

export default function SignupPage() {
    const { error, loading, socialLoading, handleSignup, handleSocialLogin } = useAuth();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await handleSignup(formData);
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-hidden bg-background">
            <div className="absolute inset-0 z-0 hidden md:block">
                <Image
                    src="/images/auth-bg.png"
                    alt="Suez Bridge Background"
                    fill
                    className="object-cover opacity-60 scale-105"
                    priority
                />
                <div className="absolute inset-0 bg-linear-to-b from-base/40 via-transparent to-base/60" />
                <div className="absolute inset-0 backdrop-blur-[2px]" />
            </div>

            <div className="relative z-10 w-full max-w-[480px] flex flex-col gap-6 animate-in fade-in zoom-in duration-700 ease-out-expo">
                {/* Back to Home Button - Aligned to Left */}
                <div className="flex justify-start">
                    <CustomLink
                        href="/"
                        className="flex items-center gap-2 text-text-primary/80 hover:text-text-primary font-black transition-all group bg-surface/20 backdrop-blur-md px-4 py-2 rounded-xl border border-border-subtle hover:border-primary/25"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs md:text-sm">الرجوع للرئيسية</span>
                    </CustomLink>
                </div>

                <div className="w-full max-w-[480px]">
                    <AuthFormUI
                        type="signup"
                        onSubmit={onSubmit}
                        isLoading={loading}
                        socialLoading={socialLoading}
                        error={error}
                        onSocialLogin={handleSocialLogin}
                    />
                </div>
            </div>
        </div>
    );
}
