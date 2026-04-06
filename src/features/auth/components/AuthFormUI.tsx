'use client';

import { useState } from 'react';
import CustomLink from '@/components/customLink/customLink';
import { Mail, Lock, LogIn, Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';

interface AuthFormUIProps {
    type: 'login' | 'signup';
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isLoading: boolean;
    socialLoading: 'google' | 'facebook' | null;
    error: string | null;
    onSocialLogin: (provider: 'google' | 'facebook') => void;
}

export function AuthFormUI({
    type,
    onSubmit,
    isLoading,
    socialLoading,
    error,
    onSocialLogin
}: AuthFormUIProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="bg-surface/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group w-full max-w-[440px]">
            {/* Ambient Lights - Subtly active on all but hidden if preferred. User didn't specify, but for native feel, let's keep them very subtle */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-colors duration-1000" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/10 rounded-full blur-[100px] group-hover:bg-accent/20 transition-colors duration-1000" />

            <div className="text-right mb-8 relative z-10">
                <h1 className="text-2xl font-black text-text-primary mb-2 tracking-tight">
                    {type === 'login' ? 'أهلاً بك في ' : 'إنشاء حساب في '}
                    <span className="text-primary">دليل السويس</span>
                </h1>
                <p className="text-text-muted font-bold text-xs leading-relaxed opacity-80">
                    {type === 'login'
                        ? 'سجل الدخول لاستكشاف أفضل الأماكن والخدمات في مدينتك'
                        : 'انضم إلينا واكتشف كل ما هو جديد في مدينة السويس'}
                </p>
            </div>

            <form className="space-y-4 relative z-10" onSubmit={onSubmit}>
                {error && (
                    <div className="bg-accent/10 border border-accent/20 text-accent p-3 rounded-xl text-xs font-bold text-center animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                {type === 'signup' && (
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-text-muted mr-3 mb-1 block uppercase tracking-wider">الاسم بالكامل</label>
                        <div className="relative group/input">
                            <input
                                name="full_name"
                                type="text"
                                required
                                placeholder="اكتب اسمك"
                                className="w-full h-14 pr-12 pl-4 rounded-xl bg-background/50 border border-border-subtle/50 text-text-primary font-bold placeholder:text-text-muted/30 focus:border-primary/60 focus:ring-4 focus:ring-primary/5 transition-all outline-hidden text-base focus:bg-background"
                            />
                            <LogIn className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within/input:text-primary transition-colors" />
                        </div>
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-text-muted mr-3 mb-1 block uppercase tracking-wider">البريد الإلكتروني</label>
                    <div className="relative group/input">
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="اكتب بريدك الالكتروني"
                            className="w-full h-14 pr-12 pl-4 rounded-xl bg-background/50 border border-border-subtle/50 text-text-primary font-bold placeholder:text-text-muted/30 focus:border-primary/60 focus:ring-4 focus:ring-primary/5 transition-all outline-hidden text-base focus:bg-background"
                        />
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within/input:text-primary transition-colors" />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between mr-3 mb-1">
                        <label className="text-[10px] font-black text-text-muted block uppercase tracking-wider">كلمة المرور</label>
                        {type === 'login' && (
                            <CustomLink href="#" className="text-[9px] font-black text-primary hover:text-primary-hover underline decoration-primary/30 underline-offset-4">هل نسيت كلمة السر؟</CustomLink>
                        )}
                    </div>
                    <div className="relative group/input">
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="••••••••"
                            className="w-full h-14 pr-12 pl-12 rounded-xl bg-background/50 border border-border-subtle/50 text-text-primary font-bold placeholder:text-text-muted/30 focus:border-primary/60 focus:ring-4 focus:ring-primary/5 transition-all outline-hidden text-base focus:bg-background"
                        />
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within/input:text-primary transition-colors" />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-all hover:scale-110 active:scale-90"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <button
                    disabled={isLoading}
                    className="w-full h-14 rounded-xl bg-linear-to-l from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-primary/25 transition-all active:scale-[0.98] group mt-6 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        type === 'login' ? <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> : <UserPlus className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    )}
                    <span>{isLoading ? (type === 'login' ? 'جاري الدخول...' : 'جاري الإنشاء...') : (type === 'login' ? 'دخول إلى حسابك' : 'إنشاء حساب جديد')}</span>
                </button>
            </form>

            <div className="flex items-center gap-4 py-8 relative z-10">
                <div className="flex-1 h-px bg-border-subtle/50" />
                <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] opacity-40">أو سجل عبر</span>
                <div className="flex-1 h-px bg-border-subtle/50" />
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
                <button
                    type="button"
                    onClick={() => onSocialLogin('google')}
                    disabled={isLoading || socialLoading !== null}
                    className="h-12 rounded-xl bg-white border border-border-subtle/50 flex items-center justify-center gap-2 font-black text-[#1a1a1a] hover:bg-gray-50 transition-all active:scale-[0.98] group disabled:opacity-50 shadow-sm"
                >
                    {socialLoading === 'google' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.74 24.55c0-1.64-.15-3.22-.44-4.74H24v9h12.75c-.56 3.06-2.29 5.64-4.89 7.39l7.7 5.96C44.07 37.8 46.74 31.78 46.74 24.55z" />
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.7-5.96c-2.21 1.49-5.04 2.37-8.19 2.37-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                            <path fill="none" d="M0 0h48v48H0z" />
                        </svg>
                    )}
                    <span className="text-sm">جوجل</span>
                </button>
                {/* <button
                    type="button"
                    onClick={() => onSocialLogin('facebook')}
                    disabled={isLoading || socialLoading !== null}
                    className="h-12 rounded-xl bg-[#1877F2] flex items-center justify-center gap-2 font-black text-white hover:bg-[#166fe5] transition-all active:scale-[0.98] group disabled:opacity-50 shadow-sm shadow-[#1877F2]/20"
                >
                    {socialLoading === 'facebook' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Facebook className="w-5 h-5 text-white fill-white group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-sm">فيسبوك</span>
                </button> */}
            </div>

            <div className="text-center pt-8 relative z-10">
                <p className="text-xs font-bold text-text-muted">
                    {type === 'login' ? 'ليس لديك حساب بعد؟ ' : 'لديك حساب بالفعل؟ '}
                    <CustomLink href={type === 'login' ? '/signup' : '/login'} className="text-primary hover:text-primary-hover underline decoration-2 underline-offset-4 font-black transition-colors">
                        {type === 'login' ? 'أنشئ حساباً جديداً' : 'سجل دخولك الآن'}
                    </CustomLink>
                </p>
            </div>
        </div>
    );
}
