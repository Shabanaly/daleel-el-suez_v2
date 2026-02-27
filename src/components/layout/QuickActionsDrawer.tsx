'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, MapPin, Store, Users, Settings, LogOut, Info, Heart, Share2 } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/lib/actions/auth';

interface QuickActionsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function QuickActionsDrawer({ isOpen, onClose }: QuickActionsDrawerProps) {
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
                        className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm xl:hidden"
                    />

                    {/* Drawer Content */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 z-101 px-4 pb-10 xl:hidden"
                    >
                        <div className="bg-surface/90 dark:bg-base/95 backdrop-blur-2xl rounded-[32px] border border-border-subtle shadow-[0_-20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
                            {/* Handle Bar */}
                            <div className="flex justify-center py-4">
                                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                            </div>

                            {/* Header */}
                            <div className="flex items-center justify-between px-8 pb-6 border-b border-border-subtle/50">
                                <h3 className="text-xl font-black text-text-primary tracking-tight">الوصول السريع</h3>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-elevated/50 border border-border-subtle text-text-muted hover:text-text-primary transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Actions Grid */}
                            <div className="p-6 grid grid-cols-3 gap-4">
                                <ActionItem
                                    href="/places/add"
                                    icon={<Plus className="w-6 h-6" />}
                                    label="أضف مكان"
                                    color="bg-primary-500"
                                    onClick={onClose}
                                />
                                <ActionItem
                                    href="/places"
                                    icon={<MapPin className="w-6 h-6" />}
                                    label="استكشف"
                                    color="bg-blue-500"
                                    onClick={onClose}
                                />
                                <ActionItem
                                    href="/market"
                                    icon={<Store className="w-6 h-6" />}
                                    label="السوق"
                                    color="bg-accent"
                                    onClick={onClose}
                                />
                                <ActionItem
                                    href="#"
                                    icon={<Heart className="w-6 h-6" />}
                                    label="المفضلة"
                                    color="bg-pink-500"
                                    onClick={onClose}
                                />
                                <ActionItem
                                    href="/community"
                                    icon={<Users className="w-6 h-6" />}
                                    label="المجتمع"
                                    color="bg-purple-500"
                                    onClick={onClose}
                                />
                                <ActionItem
                                    href="#"
                                    icon={<Share2 className="w-6 h-6" />}
                                    label="مشاركة"
                                    color="bg-green-500"
                                    onClick={onClose}
                                />
                            </div>

                            {/* Bottom Links List */}
                            <div className="px-6 pb-6 pt-2 space-y-2">
                                <ListLink icon={<Settings className="w-5 h-5" />} label="إعدادات الحساب" href="#" onClick={onClose} />
                                <ListLink icon={<Info className="w-5 h-5" />} label="عن دليل السويس" href="#" onClick={onClose} />
                                <button
                                    onClick={() => { logout(); onClose(); }}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-500 transition-all font-bold group"
                                >
                                    <div className="flex items-center gap-3">
                                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                        <span>تسجيل الخروج</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function ActionItem({ href, icon, label, color, onClick }: { href: string; icon: React.ReactNode; label: string; color: string; onClick: () => void }) {
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

function ListLink({ icon, label, href, onClick }: { icon: React.ReactNode; label: string; href: string; onClick: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-elevated/50 hover:bg-elevated border border-border-subtle text-text-primary hover:shadow-lg transition-all font-bold group"
        >
            <div className="flex items-center gap-3">
                <span className="text-primary-500">{icon}</span>
                <span>{label}</span>
            </div>
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-base border border-border-subtle group-hover:bg-primary-500 group-hover:text-white transition-all">
                <Plus className="w-4 h-4 rotate-45" />
            </div>
        </Link>
    );
}
