'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, MapPin, Store, Users, Plus } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useAuthModal } from '@/hooks/useAuthModal';
import QuickActionsDrawer from './QuickActionsDrawer';

export default function BottomNav() {
    const pathname = usePathname();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { user } = useAuth();
    const { openModal } = useAuthModal();

    const isAuthPage = pathname === '/login' || pathname === '/signup';
    const isPlaceDetailsPage = pathname?.startsWith('/places/') && pathname.split('/').length === 3;
    if (isAuthPage || isPlaceDetailsPage) return null;

    const handleProtectedAction = (e: React.MouseEvent, href: string) => {
        if (!user) {
            e.preventDefault();
            openModal();
        }
    };

    return (
        <>
            <div className="xl:hidden fixed bottom-0 w-full z-50 px-4 pb-3 pointer-events-auto flex justify-center">
                <div className="relative w-full max-w-sm md:max-w-2xl lg:max-w-4xl h-[76px]">

                    {/* ── Custom Notch Background ── */}
                    <div className="absolute inset-0 z-0">
                        <svg width="100%" height="100%" viewBox="0 0 400 76" preserveAspectRatio="none" className="drop-shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                            <path
                                d="M 170,0 
                                   C 180,0 182,2 182,10 
                                   C 182,30 218,30 218,10 
                                   C 218,2 220,0 230,0 
                                   L 380,0 
                                   C 391,0 400,9 400,20 
                                   L 400,56 
                                   C 400,67 391,76 380,76 
                                   L 20,76 
                                   C 9,76 0,67 0,56 
                                   L 0,20 
                                   C 0,9 9,0 20,0 
                                   Z"
                                className="fill-background/80 dark:fill-background/90 stroke-border-subtle backdrop-blur-xl"
                                strokeWidth="1"
                            />
                        </svg>
                    </div>

                    {/* ── Nav Items Grid ── */}
                    <div className="relative z-10 flex items-center justify-between h-full px-2 md:px-8">
                        {/* Right side items (Home, Places) */}
                        <div className="flex-1 flex justify-around">
                            <NavItem
                                href="/"
                                icon={<Home />}
                                label="الرئيسية"
                                active={pathname === '/'}
                            />
                            <NavItem
                                href="/places"
                                icon={<MapPin />}
                                label="الأماكن"
                                active={pathname?.startsWith('/places')}
                            />
                        </div>

                        {/* Centered Elevated Button */}
                        <div className="relative -top-6 w-20 flex flex-col items-center justify-center group cursor-pointer" onClick={() => setIsDrawerOpen(true)}>
                            <div className="relative z-10 flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary shadow-xl shadow-primary/30 group-hover:scale-110 group-hover:bg-primary-hover active:scale-95 transition-all duration-300">
                                <Plus className="w-8 h-8 text-white" />
                                {/* Small inner glow */}
                                <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <span className="mt-2 text-[10px] sm:text-[11px] font-black text-primary tracking-widest uppercase">المزيد</span>
                        </div>

                        {/* Left side items (Community, Market) */}
                        <div className="flex-1 flex justify-around">
                            <NavItem
                                href="/community"
                                icon={<Users />}
                                label="المجتمع"
                                active={pathname === '/community'}
                                onClick={(e) => handleProtectedAction(e, '/community')}
                            />
                            <NavItem
                                href="/market"
                                icon={<Store />}
                                label="السوق"
                                active={pathname === '/market'}
                                onClick={(e) => handleProtectedAction(e, '/market')}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <QuickActionsDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        </>
    );
}

function NavItem({
    href,
    icon,
    label,
    active,
    onClick
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick?: (e: React.MouseEvent) => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="relative flex flex-col items-center justify-center h-full w-[68px] md:w-20 touch-none group"
        >
            {active && (
                <div className="absolute inset-0 flex flex-col items-center pointer-events-none overflow-hidden">
                    {/* Top Glow Line */}
                    <div className="absolute top-0 w-10 h-[3px] bg-primary rounded-b-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />

                    {/* Spotlight Beam */}
                    <div
                        className="absolute top-0 w-20 h-full 
                        bg-linear-to-b from-primary/20 via-primary/5 to-transparent 
                        dark:from-primary/30 dark:via-primary/10 dark:to-transparent"
                        style={{
                            clipPath: 'path("M 15,0 L 65,0 C 60,30 55,50 40,65 C 25,50 20,30 15,0 Z")'
                        }}
                    />
                </div>
            )}

            <div className={`relative z-10 flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 ${active
                ? 'bg-primary/10 border border-primary/20 shadow-md shadow-primary/10'
                : 'border border-transparent'
                }`}>
                <div className={`relative [&>svg]:w-6 [&>svg]:h-6 [&>svg]:transition-all [&>svg]:duration-500 ${active
                    ? 'text-primary'
                    : 'text-text-muted/60 hover:text-text-primary [&>svg]:stroke-[2px]'
                    }`}>
                    {icon}
                </div>
            </div>

            <span className={`relative z-10 text-[10px] sm:text-[11px] mt-1 transition-all duration-300 tracking-wide ${active
                ? 'font-bold text-primary scale-105 '
                : 'font-medium text-text-muted'
                }`}>
                {label}
            </span>
        </Link>
    );
}
