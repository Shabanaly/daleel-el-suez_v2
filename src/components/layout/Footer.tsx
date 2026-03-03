'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin } from 'lucide-react';

export default function Footer() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isAuthPage = pathname === '/login' || pathname === '/signup';
    const isAdminPage = pathname?.startsWith('/admin');
    if (isAuthPage || isAdminPage) return null;

    return (
        <footer className="w-full bg-background border-t border-border-subtle pt-20 pb-28 md:pb-12 mt-auto relative overflow-hidden">
            {/* Background glowing layer — canal teal pulse */}
            <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-primary/20 filter blur-[150px] opacity-20 pointer-events-none animate-pulse" />

            <div className="max-w-5xl mx-auto px-4 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-12 gap-12 md:gap-8 pb-16">

                    {/* Brand Section */}
                    <div className="col-span-2 md:col-span-3 lg:col-span-5">
                        <Link href="/" className="flex items-center gap-2 mb-6 group">
                            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-primary to-primary-hover flex items-center justify-center glow-primary shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                                <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-black text-2xl text-text-primary tracking-tighter">دليل السويس</span>
                        </Link>
                        <p className="text-text-muted text-sm md:text-base leading-relaxed max-w-sm font-medium opacity-80">
                            اكتشف مدينتك بشكل جديد. مشروع يهدف لتوثيق كل شبر في السويس وتسهيل الوصول للخدمات بجودة واحترافية عالية.
                        </p>
                    </div>

                    {/* Links Column 1 */}
                    <div className="col-span-1 md:col-span-1 lg:col-span-2">
                        <h3 className="text-text-primary font-black text-sm mb-6 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1 h-3 rounded-full bg-primary" />
                            روابط سريعة
                        </h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/" className="text-text-muted text-sm font-bold hover:text-primary transition-colors">
                                    الرئيسية
                                </Link>
                            </li>
                            <li>
                                <Link href="/places" className="text-text-muted text-sm font-bold hover:text-primary transition-colors">
                                    الأماكن
                                </Link>
                            </li>
                            <li>
                                <Link href="/community" className="text-text-muted text-sm font-bold hover:text-primary transition-colors">
                                    المجتمع
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-text-muted text-sm font-bold hover:text-primary transition-colors">
                                    عن السويس
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div className="col-span-1 md:col-span-1 lg:col-span-2">
                        <h3 className="text-text-primary font-black text-sm mb-6 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1 h-3 rounded-full bg-accent" />
                            قانوني
                        </h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/terms" className="text-text-muted text-sm font-bold hover:text-text-primary transition-colors">
                                    الشروط والأحكام
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-text-muted text-sm font-bold hover:text-text-primary transition-colors">
                                    سياسة الخصوصية
                                </Link>
                            </li>
                            <li>
                                <Link href="/copyright" className="text-text-muted text-sm font-bold hover:text-text-primary transition-colors">
                                    حقوق النشر
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="col-span-2 md:col-span-1 lg:col-span-3">
                        <h3 className="text-text-primary font-black text-sm mb-6 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1 h-3 rounded-full bg-primary/40" />
                            تواصل معنا
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex flex-col gap-1">
                                <span className="text-[10px] text-text-muted font-black uppercase opacity-60">البريد الإلكتروني</span>
                                <span className="text-sm font-bold text-text-primary tracking-tight">hello@suezguide.com</span>
                            </li>
                            <li className="flex flex-col gap-1">
                                <span className="text-[10px] text-text-muted font-black uppercase opacity-60">واتساب</span>
                                <span className="text-sm font-bold text-text-primary tracking-tight">+20 100 000 0000</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border-subtle/50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-text-muted text-xs md:text-sm font-bold opacity-60">
                        © {mounted ? new Date().getFullYear() : '2026'} دليل السويس • صنع بكل حب في مدينة الغريب 🌊
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="#" className="text-text-muted hover:text-primary transition-all scale-110">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                        </Link>
                        <Link href="#" className="text-text-muted hover:text-accent transition-all scale-110">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                        </Link>
                        <Link href="#" className="text-text-muted hover:text-primary transition-all scale-110">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.012 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.012 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.012-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.584-.071 4.85c-.055 1.17-.249 1.805-.415 2.227-.217.562-.477.96-.896 1.382-.42.419-.819.679-1.381.896-.422.164-1.057.36-2.227.413-1.266.057-1.646.07-4.85.07s-3.584-.015-4.85-.071c-1.17-.055-1.805-.249-2.227-.415-.562-.217-.96-.477-1.382-.896-.419-.42-.679-.819-.896-1.381-.164-.422-.36-1.057-.413-2.227-.057-1.266-.07-1.646-.07-4.85s.015-3.584.071-4.85c.055-1.17.249-1.805.415-2.227.217-.562.477-.96.896-1.382.42-.419.819-.679 1.381-.896.422-.164 1.057-.36 2.227-.413 1.266-.057 1.646-.07 4.85-.07zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
