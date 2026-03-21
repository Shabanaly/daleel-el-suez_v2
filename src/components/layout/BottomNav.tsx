'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home, MapPin, Store, Users, Plus } from 'lucide-react';
// import { useAuth } from '@/components/providers/AuthProvider';
// import { useAuthModal } from '@/hooks/useAuthModal';
import QuickActionsDrawer from './QuickActionsDrawer';

export default function BottomNav() {
    const pathname = usePathname();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    // const { user } = useAuth();
    // Removed handleProtectedAction to allow guest access to Community & Market

    const isAuthPage = pathname === '/login' || pathname === '/signup';
    const isAdminPage = pathname?.startsWith('/admin');
    const isPlaceDetailsPage = pathname?.startsWith('/places/') && pathname.split('/').length === 3;
    const isPostDetailsPage = pathname?.startsWith('/community/posts/');
    const isMarketInside = pathname !== '/market' && pathname?.startsWith('/market');
    const isProfileSection = pathname?.startsWith('/profile');
    const isSettings = pathname?.startsWith('/settings');
    const isFavorites = pathname?.startsWith('/favorites');
    const isManage = pathname?.startsWith('/manage');

    if (
        isAuthPage || 
        isAdminPage || 
        isPlaceDetailsPage || 
        isPostDetailsPage || 
        isMarketInside || 
        isProfileSection || 
        isSettings || 
        isFavorites ||
        isManage
    ) return null;

    return (
        <>
            <div className="lg:hidden fixed bottom-0 w-full z-50 pointer-events-auto flex justify-center">
                <div className="relative w-full max-w-sm md:max-w-2xl lg:max-w-4xl h-[76px]">

                    {/* ── Custom Notch Background ── */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[2000px] h-[76px] z-0 pointer-events-none drop-shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <svg width="2000" height="76" viewBox="0 0 2000 76" className="w-[2000px] h-[76px]">
                            <path
                                d="M 0,0 
                                   L 945,0 
                                   C 952,0 957,2 960,8 
                                   C 970,38 982,46 1000,46 
                                   C 1018,46 1030,38 1040,8 
                                   C 1043,2 1048,0 1055,0 
                                   L 2000,0 
                                   L 2000,76 
                                   L 0,76 
                                   Z"
                                className="fill-background/95 dark:fill-background/98 stroke-border-subtle backdrop-blur-3xl"
                                strokeWidth="1"
                            />
                        </svg>
                    </div>

                    {/* ── Nav Items Flex ── */}
                    <div className="relative z-10 flex items-center justify-between h-full px-2 md:px-6">
                        {/* Right side items (Home, Places) */}
                        <div className="flex items-center justify-evenly flex-1 h-full">
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

                        {/* Spacer for Center Button to maintain precise center spacing */}
                        <div className="w-[72px] shrink-0 pointer-events-none" />

                        {/* Left side items (Community, Market) */}
                        <div className="flex items-center justify-evenly flex-1 h-full">
                            <NavItem
                                href="/community"
                                icon={<Users />}
                                label="المجتمع"
                                active={pathname === '/community'}
                            />
                            <NavItem
                                href="/market"
                                icon={<Store />}
                                label="السوق"
                                active={pathname === '/market'}
                            />
                        </div>
                    </div>

                    {/* ── Absolutely Centered FAB ── */}
                    <div className="absolute left-1/2 -translate-x-1/2 -top-4 w-[60px] flex flex-col items-center justify-center group cursor-pointer z-20" onClick={() => setIsDrawerOpen(true)}>
                        <div className="relative z-10 flex items-center justify-center w-[60px] h-[60px] rounded-full bg-primary shadow-xl shadow-primary/30 group-hover:scale-110 group-hover:bg-primary-hover active:scale-95 transition-all duration-300">
                            <Plus className="w-8 h-8 text-white" />
                            {/* Small inner glow */}
                            <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
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
