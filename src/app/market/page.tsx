"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowLeft, Store, Sparkles } from 'lucide-react';

export default function MarketPage() {
    return (
        <div className="relative min-h-screen w-full top-14 flex items-center justify-center p-4 md:p-8 overflow-hidden bg-black">

            {/* ── Background Image ────────────────────────────────────────── */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/auth-bg.png"
                    alt="Suez Bridge Background"
                    fill
                    className="object-cover opacity-60 scale-110"
                    priority
                />
                <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/20 to-black/80" />
                <div className="absolute inset-0 backdrop-blur-xs" />
            </div>

            {/* ── Back to Home (Absolute) ─────────────────────────────────── */}
            <Link
                href="/"
                className="absolute top-6 right-6 md:top-10 md:right-10 flex items-center gap-2 text-white/80 hover:text-white font-black transition-all group z-20 bg-black/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 hover:border-white/25 shadow-2xl"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm md:text-base">الرجوع للرئيسية</span>
            </Link>

            {/* ── Coming Soon Card ────────────────────────────────────────── */}
            <div className="relative z-10 w-full max-w-2xl animate-in fade-in zoom-in slide-in-from-bottom-12 duration-1000 ease-out-expo">
                <div className="bg-surface/75 backdrop-blur-3xl p-10 md:p-16 rounded-[48px] border border-white/10 shadow-[0_32px_128px_rgba(0,0,0,0.6)] relative overflow-hidden group text-center">

                    {/* Decorative Ambient Lights */}
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary-500/30 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

                    {/* Content */}
                    <div className="relative z-10 space-y-8">
                        {/* Icon Badge */}
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-linear-to-br from-primary-500 to-primary-600 shadow-2xl shadow-primary-500/40 mb-2 relative group-hover:scale-110 transition-transform duration-700 ease-out-expo">
                            <ShoppingBag className="w-10 h-10 text-white animate-bounce" style={{ animationDuration: '3s' }} />
                            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-accent animate-pulse" />
                        </div>

                        {/* Title & Subtitle */}
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-6xl font-black text-text-primary tracking-tight leading-tight">
                                <span className="text-primary-500">سوق السويس</span> <br />
                                متوفر قريباً
                            </h1>
                            <p className="text-text-muted font-bold text-lg md:text-xl leading-relaxed max-w-lg mx-auto opacity-80">
                                نعمل بجد لتوفير أفضل تجربة تسوق إلكتروني في مدينتك. ترقبوا انطلاقة أكبر تجمع للمحلات والخدمات في السويس.
                            </p>
                        </div>

                        {/* Progress Indicator (Decorative) */}
                        <div className="max-w-xs mx-auto space-y-3">
                            <div className="flex justify-between items-center text-xs font-black text-text-muted uppercase tracking-widest px-1">
                                <span>جاري التجهيز</span>
                                <span className="text-primary-500">85%</span>
                            </div>
                            <div className="h-2 w-full bg-base/50 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-linear-to-r from-primary-600 to-primary-400 rounded-full w-[85%] relative overflow-hidden">
                                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                                </div>
                            </div>
                        </div>

                        {/* Social/Actions */}
                        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/" className="w-full sm:w-auto px-8 h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black transition-all flex items-center justify-center gap-2 group/btn">
                                <Store className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                <span>استكشف المحلات الحالية</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
