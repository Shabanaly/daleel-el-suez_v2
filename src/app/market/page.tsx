"use client";

import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";

export default function MarketPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-24 pb-16">

            {/* Back Button */}
            <Link
                href="/"
                className="absolute top-6 right-6 flex items-center gap-2 text-text-muted hover:text-text-primary transition"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">الرجوع للرئيسية</span>
            </Link>

            {/* Card */}
            <div className="w-full max-w-xl text-center bg-surface border border-border-subtle rounded-2xl p-10 shadow-sm">

                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="w-7 h-7 text-primary" />
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-semibold text-text-primary mb-4">
                    سوق السويس
                </h1>

                {/* Subtitle */}
                <p className="text-text-muted text-sm md:text-base leading-relaxed mb-8 max-w-md mx-auto">
                    نعمل حالياً على تطوير سوق محلي مخصص لأهل السويس لبيع وشراء المنتجات الجديدة والمستعملة بين الأفراد بطريقة آمنة وسهلة.
                </p>

                {/* Simple Progress */}
                <div className="w-full max-w-sm mx-auto mb-8 space-y-2">

                    <div className="flex justify-between text-xs text-text-muted font-medium">
                        <span>جاري الإطلاق</span>
                        <span className="text-primary font-semibold">70%</span>
                    </div>

                    <div className="relative h-2.5 w-full rounded-full bg-background border border-border-subtle overflow-hidden">
                        <div className="relative h-full w-[70%] rounded-full bg-primary transition-all duration-700">

                            {/* Soft highlight */}
                            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent opacity-40" />

                        </div>
                    </div>

                </div>
                {/* Action */}
                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 h-11 rounded-lg bg-linear-to-r from-primary to-primary-hover text-white text-sm font-medium hover:bg-primary-hover transition"
                >
                    العودة للصفحة الرئيسية
                </Link>
            </div>
        </div>
    );
}