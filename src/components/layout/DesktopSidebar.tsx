'use client';

import { motion } from 'framer-motion';
import { Plus, MapPin, Store, Users, Heart, Share2, Settings, Info, User, LogOut, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { logout as serverLogout } from '@/lib/actions/auth';
import Image from 'next/image';

export default function DesktopSidebar() {
    const pathname = usePathname();
    const { user, isLoading: loading, logout: supabaseLogout } = useAuth();




    const SIDEBAR_ITEMS = [
        { icon: <Plus className="w-5 h-5" />, label: 'أضف مكان جديد', href: '/places/add', color: 'bg-primary' },
        { icon: <MapPin className="w-5 h-5" />, label: 'استكشف الأماكن', href: '/places', color: 'bg-primary' },
        { icon: <Heart className="w-5 h-5" />, label: 'الأماكن المفضلة', href: '#', color: 'bg-accent' },
        { icon: <Share2 className="w-5 h-5" />, label: 'مشاركة الموقع', href: '#', color: 'bg-accent' },
        { icon: <User className="w-5 h-5" />, label: 'البروفايل', href: '/profile', color: 'bg-accent' },
        { icon: <Info className="w-5 h-5" />, label: 'عن دليل السويس', href: '#', color: 'bg-accent' },
    ];

    const isAuthPage = pathname === '/login' || pathname === '/signup';
    if (isAuthPage) return null;

    const handleLogout = async () => {
        await supabaseLogout();
        await serverLogout();
    };

    return (

        <aside className="hidden xl:flex fixed top-[72px] right-0 z-40 w-72 h-[calc(100vh-72px)] flex-col bg-surface/50 dark:bg-background/50 backdrop-blur-2xl border-l border-border-subtle shadow-[20px_0_50px_rgba(0,0,0,0.1)]">

            {/* 👤 Header: User Profile Section (Persistent) */}
            <div className="p-4 border-b border-border-subtle/30 bg-surface/30 dark:bg-background/30">
                <div className="p-5 rounded-3xl bg-elevated border border-primary/20 relative overflow-hidden group">
                    {/* Animated Glow Background */}
                    <div className="absolute inset-0 bg-linear-to-tr from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {loading ? (
                        <div className="flex items-center justify-center py-2">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        </div>
                    ) : user ? (
                        <div className="relative z-10 flex items-center gap-4">
                            {/* Avatar Container */}
                            <div className="relative shrink-0">
                                <div className="absolute inset-0 bg-primary rounded-full blur-lg opacity-20" />
                                <div className="relative w-14 h-14 rounded-full p-0.5 bg-linear-to-tr from-primary via-accent to-primary-hover">
                                    <div className="w-full h-full rounded-full bg-background overflow-hidden border-2 border-background">
                                        {user.user_metadata?.avatar_url ? (
                                            <Image
                                                src={user.user_metadata.avatar_url}
                                                alt={user.user_metadata?.full_name || 'User'}
                                                width={56}
                                                height={56}
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        ) : (
                                            <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="w-6 h-6 text-primary" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Info Container */}
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] md:text-[11px] font-bold text-primary/80 block uppercase tracking-widest mb-1">أهلاً بك مجدداً</span>
                                <h3 className="text-sm md:text-lg font-black text-text-primary truncate leading-tight">
                                    {user.user_metadata?.full_name?.split(' ')[0] || 'مستخدم'} 👋
                                </h3>
                            </div>
                        </div>
                    ) : (
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-background border border-border-subtle flex items-center justify-center shrink-0">
                                <User className="w-6 h-6 text-text-muted/40" />
                            </div>
                            <div className="flex flex-col flex-1">
                                <h3 className="text-xs font-black text-text-primary mb-1.5 leading-tight">مرحباً بك في السويس</h3>
                                <Link href="/login" className="w-fit px-5 py-2 rounded-xl bg-primary text-white text-[11px] font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                                    دخول
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Scrollable Content: Navigation Items */}
            <div className="flex flex-col gap-1 p-4 h-full overflow-y-auto custom-scrollbar">
                <div className="flex flex-col gap-2">
                    {SIDEBAR_ITEMS.map((item, index) => (
                        <SidebarItem
                            key={index}
                            {...item}
                            active={pathname === item.href}
                        />
                    ))}
                </div>

                {/* Bottom section with Logout and Copyright info */}
                <div className="mt-auto pt-6 space-y-4">
                    {user && (
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-between p-4 rounded-2xl bg-accent/5 hover:bg-accent/10 border border-accent/10 text-accent transition-all font-black group active:scale-95"
                        >
                            <div className="flex items-center gap-3">
                                <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                <span className="text-xs">تسجيل الخروج</span>
                            </div>
                        </button>
                    )}

                    <div className="border-t border-border-subtle/50 pt-4 px-2 pb-2">
                        <p className="text-[10px] text-text-muted/40 font-bold leading-relaxed">© 2026 دليل السويس. جميع الحقوق محفوظة.</p>
                    </div>
                </div>
            </div>
        </aside>

    );
}

function SidebarItem({ icon, label, href, color, active }: { icon: React.ReactNode; label: string; href: string; color: string; active: boolean }) {
    return (
        <Link href={href} className="group flex items-center gap-3 w-full p-3 rounded-2xl transition-all duration-300 relative overflow-hidden active:scale-95">
            {/* Active Highlight Background */}
            {active && (
                <motion.div
                    layoutId="active-nav-bg"
                    className="absolute inset-0 bg-primary/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}

            {/* Icon Box */}
            <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border ${active
                ? `${color} text-white border-white/20 shadow-lg`
                : 'bg-elevated group-hover:bg-elevated border-border-subtle text-text-muted group-hover:text-text-primary'
                }`}>
                {icon}
            </div>

            {/* Label */}
            <span className={`relative z-10 text-sm font-bold tracking-tight transition-all duration-300 ${active ? 'text-primary' : 'text-text-muted group-hover:text-text-primary'
                }`}>
                {label}
            </span>

            {/* Active Indicator Line */}
            {active && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full" />
            )}
        </Link>
    );
}
