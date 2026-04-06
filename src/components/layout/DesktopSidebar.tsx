'use client';

import { motion } from 'framer-motion';
import { Plus, MessageSquare, Heart, User, LogOut, ShoppingBag, Copyright as CopyIcon, Settings } from 'lucide-react';
import CustomLink from '@/components/customLink/customLink';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import Image from 'next/image';

export default function DesktopSidebar() {
    const pathname = usePathname();
    const { user, loading, handleLogout } = useAuth();




    const SIDEBAR_ITEMS = [
        { icon: <User className="w-5 h-5" />, label: 'البروفايل', href: '/profile', color: 'bg-accent' },
        { icon: <Plus className="w-5 h-5" />, label: 'أضف مكان جديد', href: '/places/add', color: 'bg-primary' },
        { icon: <ShoppingBag className="w-5 h-5" />, label: 'إعلاناتي', href: '/market/my-ads', color: 'bg-primary' },
        { icon: <Heart className="w-5 h-5" />, label: 'الأماكن المفضلة', href: '/favorites', color: 'bg-accent' },
        { icon: <MessageSquare className="w-5 h-5" />, label: 'المجتمع', href: '/community', color: 'bg-primary' },
        { icon: <Settings className="w-5 h-5" />, label: 'الإعدادات', href: '/settings', color: 'bg-primary' },

    ];

    const isAuthPage = pathname === '/login' || pathname === '/signup';
    const isAdminPage = pathname?.startsWith('/admin');
    if (isAuthPage || isAdminPage) return null;


    return (

        <aside className="group/sidebar hidden lg:flex fixed top-16 right-0 z-40 w-20 hover:w-56 h-[calc(100vh-4rem)] flex-col bg-surface/50 dark:bg-background/50 backdrop-blur-2xl border-l border-border-subtle shadow-[20px_0_50px_rgba(0,0,0,0.1)] hover:shadow-[30px_0_60px_rgba(0,0,0,0.15)] transition-all duration-300 ease-in-out overflow-visible">

            {/* Content: Navigation Items */}
            <div className="flex flex-col gap-1 p-2 group-hover/sidebar:p-3 h-full transition-all duration-300">
                <div className="flex flex-col gap-2">
                    {SIDEBAR_ITEMS.map((item, index) => (
                        <SidebarItem
                            key={index}
                            {...item}
                            active={pathname === item.href}
                        />
                    ))}
                </div>

                {/* Bottom section with Logout */}
                <div className="mt-auto pt-4 space-y-2 pb-2">
                    {user && (
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center group-hover/sidebar:justify-start p-2 group-hover/sidebar:p-3 rounded-xl bg-accent/5 hover:bg-accent/10 border border-accent/10 text-accent transition-all font-bold group/logout active:scale-95"
                        >
                            <div className="flex items-center gap-0 group-hover/sidebar:gap-3">
                                <LogOut className="w-5 h-5 shrink-0 group-hover/logout:-translate-x-1 transition-transform" />
                                <span className="text-sm border-0 whitespace-nowrap opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto overflow-hidden transition-all duration-300">تسجيل الخروج</span>
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </aside>

    );
}

function SidebarItem({ icon, label, href, color, active }: { icon: React.ReactNode; label: string; href: string; color: string; active: boolean }) {
    return (
        <CustomLink href={href} className="group/item flex items-center justify-center group-hover/sidebar:justify-start gap-0 group-hover/sidebar:gap-3 w-full p-2 group-hover/sidebar:p-3 rounded-2xl transition-all duration-300 relative overflow-hidden active:scale-95">
            {/* Active Highlight Background */}
            {active && (
                <motion.div
                    layoutId="active-nav-bg"
                    className="absolute inset-0 bg-primary/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}

            {/* Icon Box */}
            <div className={`relative z-10 shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border ${active
                ? `${color} text-white border-white/20 shadow-lg`
                : 'bg-elevated group-hover/item:bg-elevated border-border-subtle text-text-muted group-hover/item:text-text-primary'
                }`}>
                {icon}
            </div>

            {/* Label */}
            <span className={`relative z-10 text-sm font-bold tracking-tight transition-all duration-300 whitespace-nowrap opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto overflow-hidden ${active ? 'text-primary' : 'text-text-muted group-hover/item:text-text-primary'
                }`}>
                {label}
            </span>

            {/* Active Indicator Line */}
            {active && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full" />
            )}
        </CustomLink>
    );
}
