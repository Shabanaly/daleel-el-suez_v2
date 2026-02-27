"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, LogIn, ArrowLeft, Facebook, Eye, EyeOff, Loader2 } from 'lucide-react';
import { login, signInWithGoogle, signInWithFacebook } from '@/lib/actions/auth';
import { GoogleOneTap } from '@/components/auth/GoogleOneTap';

export default function LoginPage() {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await login(formData);

        if (result?.error) {
            setError(result.error);
            setIsLoading(false);
        }
    }

    async function handleSocialLogin(provider: 'google' | 'facebook') {
        setSocialLoading(provider);
        setError(null);
        try {
            if (provider === 'google') {
                await signInWithGoogle();
            } else {
                await signInWithFacebook();
            }
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء الاتصال');
            setSocialLoading(null);
        }
    }

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-hidden bg-black">

            {/* ── Background Image ────────────────────────────────────────── */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/auth-bg.png"
                    alt="Suez Bridge Background"
                    fill
                    className="object-cover opacity-60 scale-105"
                    priority
                />
                <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/60" />
                <div className="absolute inset-0 backdrop-blur-[2px]" />
            </div>

            {googleClientId && <GoogleOneTap clientId={googleClientId} />}

            {/* ── Back to Home (Absolute) ─────────────────────────────────── */}
            <Link
                href="/"
                className="absolute top-6 right-6 md:top-10 md:right-10 flex items-center gap-2 text-white/80 hover:text-white font-black transition-all group z-20 bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 hover:border-white/25"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm md:text-base">الرجوع للرئيسية</span>
            </Link>

            {/* ── Login Card ──────────────────────────────────────────────── */}
            <div className="relative z-10 w-full max-w-[480px] animate-in fade-in zoom-in duration-700 ease-out-expo">
                <div className="bg-surface/75 backdrop-blur-2xl p-8 md:p-12 rounded-[40px] border border-white/10 shadow-[0_32px_128px_rgba(0,0,0,0.5)] relative overflow-hidden group">

                    {/* Decorative Ambient Light */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/20 rounded-full blur-[100px] group-hover:bg-primary-500/30 transition-colors duration-1000" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/20 rounded-full blur-[100px] group-hover:bg-accent/30 transition-colors duration-1000" />

                    {/* Header */}
                    <div className="text-right mb-10 relative z-10">
                        <h1 className="text-3xl md:text-4xl font-black text-text-primary mb-3 tracking-tight">أهلاً بك في <span className="text-primary-500">دليل السويس</span></h1>
                        <p className="text-text-muted font-bold text-sm md:text-base leading-relaxed opacity-80">سجل الدخول لاستكشاف أفضل الأماكن والخدمات في مدينتك</p>
                    </div>

                    {/* Form */}
                    <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm font-bold text-center animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted mr-3 mb-1 block uppercase tracking-wider">البريد الإلكتروني</label>
                            <div className="relative group/input">
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="name@example.com"
                                    className="w-full h-16 pr-14 pl-4 rounded-2xl bg-base/50 border border-border-subtle/50 text-text-primary font-bold placeholder:text-text-muted/30 focus:border-primary-500/60 focus:ring-4 focus:ring-primary-500/5 transition-all outline-hidden text-lg focus:bg-base"
                                />
                                <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-text-muted group-focus-within/input:text-primary-500 transition-colors" />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between mr-3 mb-1">
                                <label className="text-xs font-black text-text-muted block uppercase tracking-wider">كلمة المرور</label>
                                <Link href="#" className="text-[10px] font-black text-primary-500 hover:text-primary-400 underline decoration-primary-500/30 underline-offset-4">هل نسيت كلمة السر؟</Link>
                            </div>
                            <div className="relative group/input">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="w-full h-16 pr-14 pl-14 rounded-2xl bg-base/50 border border-border-subtle/50 text-text-primary font-bold placeholder:text-text-muted/30 focus:border-primary-500/60 focus:ring-4 focus:ring-primary-500/5 transition-all outline-hidden text-lg focus:bg-base"
                                />
                                <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-text-muted group-focus-within/input:text-primary-500 transition-colors" />

                                {/* Visibility Toggle */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary-500 transition-all hover:scale-110 active:scale-90"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            disabled={isLoading}
                            className="w-full h-16 rounded-2xl bg-linear-to-l from-primary-600 to-primary-400 hover:from-primary-500 hover:to-primary-300 text-white font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-primary-500/25 transition-all active:scale-[0.98] group mt-8 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <LogIn className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            )}
                            <span>{isLoading ? 'جاري الدخول...' : 'دخول إلى حسابك'}</span>
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-5 py-8 relative z-10">
                        <div className="flex-1 h-px bg-border-subtle/50" />
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-40">أو سجل عبر</span>
                        <div className="flex-1 h-px bg-border-subtle/50" />
                    </div>

                    {/* Social Buttons */}
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('google')}
                            disabled={isLoading || socialLoading !== null}
                            className="h-14 rounded-2xl bg-base/50 border border-border-subtle/50 flex items-center justify-center gap-3 font-black text-text-primary hover:bg-elevated transition-all active:scale-[0.98] group disabled:opacity-50"
                        >
                            {socialLoading === 'google' ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            )}
                            <span>جوجل</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('facebook')}
                            disabled={isLoading || socialLoading !== null}
                            className="h-14 rounded-2xl bg-base/50 border border-border-subtle/50 flex items-center justify-center gap-3 font-black text-text-primary hover:bg-elevated transition-all active:scale-[0.98] group disabled:opacity-50"
                        >
                            {socialLoading === 'facebook' ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Facebook className="w-5 h-5 text-[#1877F2] fill-[#1877F2] group-hover:scale-110 transition-transform" />
                            )}
                            <span>فيسبوك</span>
                        </button>
                    </div>

                    {/* Signup Link */}
                    <div className="text-center pt-10 relative z-10">
                        <p className="text-sm font-bold text-text-muted">
                            ليس لديك حساب بعد؟ <Link href="/signup" className="text-primary-500 hover:text-primary-400 underline decoration-2 underline-offset-4 font-black transition-colors">أنشئ حساباً جديداً</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
