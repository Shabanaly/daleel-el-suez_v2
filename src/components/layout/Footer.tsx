'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin } from 'lucide-react';

export default function Footer() {
    const pathname = usePathname();

    const isAuthPage = pathname === '/login' || pathname === '/signup';
    if (isAuthPage) return null;

    return (
        <footer className="w-full bg-base border-t border-border-subtle pt-16 pb-28 md:pb-12 mt-auto relative overflow-hidden">
            {/* Background glowing layer — canal teal */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-32 bg-primary-600 filter blur-[100px] opacity-10 pointer-events-none" />

            <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12 relative z-10">
                {/* Brand */}
                <div className="col-span-1 md:col-span-2">
                    <Link href="/" className="flex items-center gap-2 mb-4 group">
                        <div className="w-8 h-8 rounded-full bg-linear-to-tr from-primary-600 to-primary-400 flex items-center justify-center shadow-[0_0_15px_rgba(8,145,178,0.3)] group-hover:shadow-[0_0_25px_rgba(8,145,178,0.5)] transition-all">
                            <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-extrabold text-2xl text-text-primary tracking-tight">دليل السويس</span>
                    </Link>
                    <p className="text-text-muted text-sm leading-relaxed max-w-sm">
                        دليلك الشامل للأماكن والخدمات في السويس. اكتشف أفضل المطاعم، الكافيهات، الأنشطة التجارية، وتواصل مع المجتمع المحلي في مكان واحد.
                    </p>
                </div>



                {/* Contact */}
                <div>
                    <h3 className="text-text-primary font-bold mb-5 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                        تواصل معنا
                    </h3>
                    <ul className="space-y-3">
                        <li className="text-text-muted text-sm hover:text-text-primary transition-colors cursor-pointer">support@suezguide.com</li>
                        <li className="text-text-muted text-sm hover:text-text-primary transition-colors cursor-pointer">+20 100 000 0000</li>
                    </ul>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 mt-12 pt-8 border-t border-border-subtle text-center relative z-10">
                <p className="text-text-muted text-sm">
                    جميع الحقوق محفوظة © {new Date().getFullYear()} دليل السويس
                </p>
            </div>
        </footer>
    );
}
