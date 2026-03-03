'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    MapPin,
    Menu,
    X,
    LogOut
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
        { href: '/admin/places', icon: MapPin, label: 'الأماكن' },
    ];

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b z-50 flex items-center justify-between px-4">
                <span className="font-bold text-lg text-primary">دليل السويس - الإدارة</span>
                <button onClick={toggleMobileMenu} className="p-2 -mr-2 text-text-muted hover:text-text-primary">
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed top-0 bottom-0 right-0 z-40 bg-surface border-l transition-all duration-300 flex flex-col",
                // Mobile positioning
                isMobileMenuOpen ? "translate-x-0 w-64 pt-16" : "translate-x-full lg:translate-x-0 pt-0",
                // Desktop sizing
                isCollapsed ? "lg:w-20" : "lg:w-64"
            )}>
                {/* Desktop Header */}
                <div className="hidden lg:flex items-center justify-between h-16 px-4 border-b">
                    {!isCollapsed && <span className="font-bold text-lg text-primary truncate">لوحة الإدارة</span>}
                    <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-surface-hover text-text-muted transition-colors">
                        <Menu className="w-5 h-5 mx-auto" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMobileMenu}
                                className={cn(
                                    "flex items-center rounded-lg transition-colors group relative",
                                    isCollapsed ? "justify-center p-3" : "px-3 py-2.5",
                                    isActive
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-text-muted hover:bg-surface-hover hover:text-text-primary"
                                )}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <item.icon className={cn("w-5 h-5 shrink-0", !isCollapsed && "ml-3", isActive && "text-primary")} />
                                {!isCollapsed && (
                                    <span className="truncate">{item.label}</span>
                                )}
                                {isActive && !isCollapsed && (
                                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t">
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
