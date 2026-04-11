"use client";

import { SignupForm } from '@/features/auth/components/SignupForm';
import Image from 'next/image';

export default function SignupPage() {
    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-hidden bg-background">
            <div className="absolute inset-0 z-0 hidden md:block">
                <Image
                    src="/images/auth-bg.png"
                    alt="Suez Bridge Background"
                    fill
                    className="object-cover opacity-20 scale-105"
                    priority
                />
                <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/80" />
                <div className="absolute inset-0 backdrop-blur-[2px]" />
            </div>

            <div className="relative z-10 w-full max-w-[480px] flex flex-col gap-6 animate-in fade-in zoom-in duration-700 ease-out-expo items-center">
                <SignupForm />
            </div>
        </div>
    );
}
