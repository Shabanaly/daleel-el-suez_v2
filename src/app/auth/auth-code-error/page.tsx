"use client";

import CustomLink from '@/components/customLink/customLink';
import { ShieldAlert, ChevronRight, RefreshCcw } from 'lucide-react';

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
            <div className="max-w-md w-full bg-surface/50 backdrop-blur-xl p-8 md:p-12 rounded-[40px] border border-border-subtle/50 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-8">
                    <ShieldAlert className="w-10 h-10 text-accent" />
                </div>

                <h1 className="text-3xl font-black text-text-primary mb-4">خطأ في المصادقة</h1>
                <p className="text-text-muted font-bold mb-10 leading-relaxed">
                    حدث خطأ أثناء محاولة تسجيل الدخول. قد يكون ذلك بسبب انتهاء صلاحية الجلسة أو مشكلة في الاتصال بمزود الخدمة.
                </p>

                <div className="space-y-4">
                    <CustomLink
                        href="/login"
                        className="w-full h-14 rounded-2xl bg-primary hover:bg-primary-hover text-white font-black flex items-center justify-center gap-3 transition-all active:scale-95"
                    >
                        <RefreshCcw className="w-5 h-5" />
                        <span>حاول مرة أخرى</span>
                    </CustomLink>

                    <CustomLink
                        href="/"
                        className="w-full h-14 rounded-2xl bg-surface hover:bg-elevated text-text-primary border border-border-subtle font-black flex items-center justify-center gap-3 transition-all"
                    >
                        <span>الرجوع للرئيسية</span>
                        <ChevronRight className="w-5 h-5" />
                    </CustomLink>
                </div>
            </div>
        </div>
    );
}
