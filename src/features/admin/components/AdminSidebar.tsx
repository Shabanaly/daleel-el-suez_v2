'use client';

import CustomLink from '@/components/customLink/customLink';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    MapPin,
    Users,
    Menu,
    X,
    LogOut,
    ShoppingBag,
    MessageSquare,
    FileText,
    AlertTriangle,
    Settings,
    Globe,
    Megaphone
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';

export default function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        { href: '/admin', icon: LayoutDashboard, label: 'لوحة التحكم' },
        { href: '/admin/announcements', icon: Megaphone, label: 'شريط الإعلانات' },
        { href: '/admin/places', icon: MapPin, label: 'الأماكن' },
        { href: '/admin/users', icon: Users, label: 'المستخدمين' },
        { href: '/admin/market', icon: ShoppingBag, label: 'الماركت' },
        { href: '/admin/community', icon: MessageSquare, label: 'المجتمع' },
        { href: '/admin/blog', icon: FileText, label: 'المدونة' },
        { href: '/admin/reports', icon: AlertTriangle, label: 'البلاغات' },
        { href: '/admin/settings', icon: Settings, label: 'الإعدادات' },
    ];


    const toggleSidebar = () => setIsCollapsed(!isCollapsed);
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <>
            {/* Mobile Header (Sticky fixes the gap issue when scrolling) */}
            <div className="lg:hidden sticky top-0 left-0 right-0 h-16 bg-background border-b z-50 flex items-center justify-between px-4">
                <span className="font-bold text-lg text-primary">دليل السويس - الإدارة</span>
                <button onClick={toggleMobileMenu} className="p-2 -mr-2 text-text-muted hover:text-text-primary">
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-background/80 z-40 backdrop-blur-md transition-opacity"
                    style={{ top: 'calc(4rem + var(--ticker-height, 0px))' }}
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed top-(--ticker-height,0px) bottom-0 right-0 z-40 glass-panel border-l transition-all duration-300 flex flex-col",



                // Mobile positioning
                isMobileMenuOpen ? "translate-x-0 w-64 pt-16" : "translate-x-full lg:translate-x-0 pt-0",
                // Desktop sizing
                isCollapsed ? "lg:w-20" : "lg:w-64"
            )}>

                {/* Desktop Header */}
                <div className="hidden lg:flex items-center justify-between h-16 px-4 border-b border-border-subtle">
                    {!isCollapsed && <span className="font-bold text-lg text-primary truncate glow-primary">لوحة الإدارة</span>}
                    <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-surface-hover hover:text-primary transition-colors text-text-muted">
                        <Menu className="w-5 h-5 mx-auto" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                        return (
                            <CustomLink
                                key={item.href}
                                href={item.href}
                                onClick={closeMobileMenu}
                                className={cn(
                                    "flex items-center rounded-xl transition-all duration-300 group relative",
                                    isCollapsed ? "justify-center p-3" : "px-4 py-3",
                                    isActive
                                        ? "bg-primary/10 text-primary font-bold border border-primary/20 glow-primary"
                                        : "text-text-muted hover:bg-primary/5 hover:text-primary border border-transparent"
                                )}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <item.icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", !isCollapsed && "ml-3", isActive && "text-primary")} />
                                {!isCollapsed && (
                                    <span className="truncate">{item.label}</span>
                                )}
                                {isActive && !isCollapsed && (
                                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-l-full shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                                )}
                            </CustomLink>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-border-subtle bg-background/30 backdrop-blur-sm space-y-2">
                    <CustomLink
                        href="/"
                        className={cn(
                            "flex items-center text-primary hover:bg-primary/10 transition-colors rounded-lg w-full",
                            isCollapsed ? "justify-center p-3" : "px-3 py-2.5"
                        )}
                        title={isCollapsed ? "الرجوع للموقع" : undefined}
                    >
                        <Globe className={cn("w-5 h-5 shrink-0", !isCollapsed && "ml-3")} />
                        {!isCollapsed && <span>الرجوع للموقع</span>}
                    </CustomLink>

                    <button
                        onClick={logout}
                        className={cn(
                            "flex items-center text-error hover:bg-error/10 transition-colors rounded-lg w-full",
                            isCollapsed ? "justify-center p-3" : "px-3 py-2.5"
                        )}
                        title={isCollapsed ? "تسجيل الخروج" : undefined}
                    >
                        <LogOut className={cn("w-5 h-5 shrink-0", !isCollapsed && "ml-3")} />
                        {!isCollapsed && <span>تسجيل الخروج</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
