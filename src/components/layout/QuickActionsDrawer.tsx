'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, MapPin, Store, Users, Settings, LogOut, Info, Heart, Share2, User, FileText, ShieldCheck, ShoppingBag, Copyright as CopyIcon } from 'lucide-react';
import ShareButton from '@/components/ui/ShareButton';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useAuthModal } from '@/hooks/useAuthModal';
import { logout } from '@/lib/actions/auth';

interface QuickActionsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function QuickActionsDrawer({ isOpen, onClose }: QuickActionsDrawerProps) {
    const pathname = usePathname();
    const { user, logout: authLogout } = useAuth();
    const { openModal } = useAuthModal();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const handleProtectedAction = (e: React.MouseEvent, href: string) => {
        if (!user) {
            e.preventDefault();
            onClose();
            openModal();
        } else {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-100"
                    />

                    {/* Drawer Content */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-x-0 bottom-0 bg-surface rounded-t-[32px] pb-safe z-101 border-t border-border-subtle shadow-2xl max-h-[75vh] flex flex-col"
                    >
                        <div className="bg-surface/90 dark:bg-background/95 backdrop-blur-2xl rounded-[32px] border border-border-subtle shadow-[0_-20px_50px_rgba(0,0,0,0.3)] flex flex-col h-full overflow-hidden">
                            {/* Handle Bar */}
                            <div className="flex justify-center py-4">
                                <div className="w-12 h-1.5 bg-text-muted/20 rounded-full" />
                            </div>

                            {/* Header */}
                            <div className="flex items-center justify-between px-8 pb-6 border-b border-border-subtle/50">
                                <h3 className="text-xl font-black text-text-primary tracking-tight">الوصول السريع</h3>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-elevated/50 border border-border-subtle text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="overflow-y-auto custom-scrollbar flex-1 pb-6">
                                {/* Actions Grid */}
                                <div className="p-6 grid grid-cols-3 gap-4">
                                    <ActionItem
                                        href="/places/add"
                                        icon={<Plus className="w-6 h-6" />}
                                        label="أضف مكان"
                                        color="bg-primary"
                                        onClick={(e) => handleProtectedAction(e, '/places/add')}
                                    />
                                    <ActionItem
                                        href="/places"
                                        icon={<MapPin className="w-6 h-6" />}
                                        label="استكشف"
                                        color="bg-primary"
                                        onClick={onClose}
                                    />
                                    <ActionItem
                                        href="/favorites"
                                        icon={<Heart className="w-6 h-6" />}
                                        label="المفضلة"
                                        color="bg-accent"
                                        onClick={(e) => handleProtectedAction(e, '/favorites')}
                                    />
                                    <ActionItem
                                        href="/market/create"
                                        icon={<Plus className="w-6 h-6" />}
                                        label="أضف إعلان"
                                        color="bg-primary"
                                        onClick={(e) => handleProtectedAction(e, '/market/create')}
                                    />
                                    <ActionItem
                                        href="/market"
                                        icon={<Store className="w-6 h-6" />}
                                        label="سوق السويس"
                                        color="bg-primary"
                                        onClick={onClose}
                                    />
                                    <ActionItem
                                        href="/market/my-ads"
                                        icon={<ShoppingBag className="w-6 h-6" />}
                                        label="إعلاناتي"
                                        color="bg-primary"
                                        onClick={(e) => handleProtectedAction(e, '/market/my-ads')}
                                    />
                                    <ActionItem
                                        href="/community"
                                        icon={<Users className="w-6 h-6" />}
                                        label="المجتمع"
                                        color="bg-primary"
                                        onClick={onClose}
                                    />
                                    <ShareButton
                                        title="دليل السويس"
                                        text="دليل السويس - كل ما تحتاجه في مكان واحد"
                                        url={typeof window !== 'undefined' ? window.location.origin : ''}
                                        className="flex flex-col items-center gap-2 group"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-white border border-white/20 shadow-lg shadow-black/5 group-hover:scale-110 active:scale-95 transition-all duration-300">
                                            <Share2 className="w-6 h-6" />
                                        </div>
                                        <span className="text-[11px] font-black text-text-primary tracking-tight">مشاركة</span>
                                    </ShareButton>
                                </div>

                                {/* Bottom Links List */}
                                <div className="px-6 pt-2 space-y-2">
                                    <ListLink icon={<User className="w-5 h-5" />} label="البروفايل" href="/profile" onClick={(e) => handleProtectedAction(e, '/profile')} />
                                    <ListLink icon={<Settings className="w-5 h-5" />} label="الإعدادات" href="/settings" onClick={(e) => handleProtectedAction(e, '/settings')} />

                                    <div className="h-px bg-border-subtle/50 my-2" />

                                    <ListLink icon={<Info className="w-5 h-5" />} label="عن دليل السويس" href="/about" onClick={onClose} />
                                    <ListLink icon={<FileText className="w-5 h-5" />} label="الشروط والأحكام" href="/terms" onClick={onClose} />
                                    <ListLink icon={<ShieldCheck className="w-5 h-5" />} label="سياسة الخصوصية" href="/privacy" onClick={onClose} />
                                    <ListLink icon={<CopyIcon className="w-5 h-5" />} label="حقوق النشر" href="/copyright" onClick={onClose} />
                                    {user && (
                                        <button
                                            onClick={async () => {
                                                await authLogout();
                                                await logout();
                                                onClose();
                                            }}
                                            className="w-full flex items-center justify-between p-4 rounded-2xl bg-accent/5 hover:bg-accent/10 border border-accent/10 text-accent transition-all font-bold group cursor-pointer mt-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                                <span>تسجيل الخروج</span>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function ActionItem({
    href,
    icon,
    label,
    color,
    onClick
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    color: string;
    onClick: (e: React.MouseEvent) => void
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex flex-col items-center gap-2 group"
        >
            <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center text-white border border-white/20 shadow-lg shadow-black/5 group-hover:scale-110 active:scale-95 transition-all duration-300`}>
                {icon}
            </div>
            <span className="text-[11px] font-black text-text-primary tracking-tight">{label}</span>
        </Link>
    );
}

function ListLink({
    icon,
    label,
    href,
    onClick
}: {
    icon: React.ReactNode;
    label: string;
    href: string;
    onClick: (e: React.MouseEvent) => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-elevated hover:bg-elevated/80 border border-border-subtle text-text-primary hover:shadow-lg transition-all font-bold group"
        >
            <div className="flex items-center gap-3">
                <span className="text-primary">{icon}</span>
                <span>{label}</span>
            </div>
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-background border border-border-subtle group-hover:bg-primary group-hover:text-white transition-all">
                <Plus className="w-4 h-4 rotate-45" />
            </div>
        </Link>
    );
}
