'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home, MapPin, Store, Users, Menu, Building2, Plus } from 'lucide-react';
import QuickActionsDrawer from './QuickActionsDrawer';

export default function BottomNav() {
    const pathname = usePathname();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const isAuthPage = pathname === '/login' || pathname === '/signup';
    if (isAuthPage) return null;
    return (
        <>
            <div className="xl:hidden fixed bottom-0 w-full z-50 px-4 pb-4 pointer-events-none flex justify-center">
                {/* Premium Floating Pill Background - Harmonized with Navbar */}
                <div className="pointer-events-auto relative rounded-xl 
                    glass-panel bg-base/80 dark:bg-base/90 
                    border border-border-subtle 
                    shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] 
                    overflow-hidden px-2 h-[76px] transition-all duration-500
                    w-full max-w-sm md:max-w-2xl lg:max-w-4xl">

                    {/* Nav Items Area - Balanced Distribution */}
                    <div className="relative flex items-center justify-between md:justify-center md:gap-8 lg:gap-16 px-2 md:px-8 h-full">
                        <NavItem href="/" icon={<Home />} label="الرئيسية" active={pathname === '/'} />
                        <NavItem href="/places" icon={<MapPin />} label="الأماكن" active={pathname?.startsWith('/places')} />
                        <NavItem href="/community" icon={<Users />} label="المجتمع" active={pathname?.startsWith('/community')} />
                        <NavItem href="/market" icon={<Store />} label="السوق" active={pathname?.startsWith('/market')} />

                        {/* Quick Actions Trigger */}
                        <button
                            onClick={() => setIsDrawerOpen(true)}
                            className="relative flex flex-col items-center justify-center h-full w-[68px] md:w-20 touch-none group"
                        >
                            <div className="relative z-10 flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full border border-primary-500/20 bg-primary-500/5 group-hover:bg-primary-500/10 transition-all">
                                <Plus className="w-6 h-6 text-primary-500 group-hover:scale-110 transition-transform" />
                            </div>
                            <span className="relative z-10 text-[10px] sm:text-[11px] mt-1 font-medium text-text-muted/80 dark:text-text-muted/50">المزيد</span>
                        </button>
                    </div>
                </div>
            </div>

            <QuickActionsDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        </>
    );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
    return (
        <Link
            href={href}
            className="relative flex flex-col items-center justify-center h-full w-[68px] md:w-20 touch-none group"
        >
            {/* Spotlight Effect Area (Sapphire Blue Accent) */}
            {active && (
                <div className="absolute inset-0 flex flex-col items-center pointer-events-none">
                    {/* Top glowing line - Reactive Blue */}
                    <div className="absolute top-0 w-12 h-[3.5px] bg-primary-500 rounded-b-full 
                        shadow-[0_0_15px_rgba(8,124,247,0.5)] dark:shadow-[0_0_20px_rgba(8,124,247,0.7)]" />

                    {/* Trapezoid spotlight - Adaptive Opacity */}
                    <div
                        className="absolute top-0 w-24 h-full 
                        bg-linear-to-b from-primary-500/15 dark:from-primary-400/25 via-primary-500/5 to-transparent 
                        mix-blend-overlay dark:mix-blend-plus-lighter"
                        style={{ clipPath: 'polygon(15% 0, 85% 0, 100% 100%, 0 100%)' }}
                    />
                </div>
            )}

            {/* Icon Container with Golden Border */}
            <div className={`relative z-10 flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 ${active
                ? 'bg-accent/10 border border-accent/40 shadow-[0_0_12px_rgba(234,179,8,0.2)]'
                : 'border border-transparent'
                }`}>
                <div className={`relative [&>svg]:w-6 [&>svg]:h-6 [&>svg]:transition-all [&>svg]:duration-500 ${active
                    ? 'text-primary-600 dark:text-primary-400 [&>svg]:stroke-[2.5px] scale-110 drop-shadow-[0_0_8px_rgba(8,124,247,0.2)]'
                    : 'text-text-muted/60 dark:text-text-muted/40 group-hover:text-text-primary [&>svg]:stroke-[2px]'
                    }`}>
                    {icon}
                </div>
            </div>

            {/* Label */}
            <span className={`relative z-10 text-[10px] sm:text-[11px] mt-1 transition-all duration-300 tracking-wide ${active
                ? 'font-bold text-primary-700 dark:text-primary-300 scale-105 '
                : 'font-medium text-text-muted/80 dark:text-text-muted/50'
                }`}>
                {label}
            </span>
        </Link>
    );
}
