'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, X, User } from 'lucide-react';
import Link from 'next/link';

interface AuthRequiredModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
}

export default function AuthRequiredModal({
    isOpen,
    onClose,
    title = "تسجيل الدخول مطلوب",
    description = "يجب عليك تسجيل الدخول للقيام بهذا الإجراء واستكشاف كافة مميزات دليل السويس."
}: AuthRequiredModalProps) {
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 flex items-end md:items-center justify-center pointer-events-none z-50">
                        {/* Mobile Bottom Sheet & Desktop Dialog */}
                        <motion.div
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-full md:max-w-sm bg-elevated border-t md:border border-border-subtle rounded-t-[32px] md:rounded-[32px] overflow-hidden shadow-2xl pointer-events-auto relative"
                        >
                            {/* Content */}
                            <div className="p-8 pb-10 md:pb-8 relative z-10 flex flex-col items-center text-center">
                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 left-4 p-2 rounded-full hover:bg-background/50 text-text-muted transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                {/* Handle for Mobile Bottom Sheet */}
                                <div className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-text-muted/20 rounded-full" />

                                {/* Icon */}
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-primary/10 flex items-center justify-center mb-5 md:mb-6 relative">
                                    <div className="absolute inset-0 bg-primary rounded-2xl md:rounded-3xl blur-md opacity-20" />
                                    <User className="w-7 h-7 md:w-8 md:h-8 text-primary relative z-10" />
                                </div>

                                <h2 className="text-xl md:text-2xl font-black text-text-primary mb-2 md:mb-3">
                                    {title}
                                </h2>
                                <p className="text-sm text-text-muted font-bold leading-relaxed mb-8 px-4 md:px-2 opacity-80">
                                    {description}
                                </p>

                                <div className="w-full">
                                    <Link
                                        href="/login"
                                        onClick={onClose}
                                        className="w-full h-14 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <LogIn className="w-5 h-5" />
                                        <span>تسجيل الدخول الآن</span>
                                    </Link>

                                    <Link
                                        href="/signup"
                                        onClick={onClose}
                                        className="mt-4 block text-xs font-black text-primary hover:underline"
                                    >
                                        أو إنشاء حساب جديد
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
