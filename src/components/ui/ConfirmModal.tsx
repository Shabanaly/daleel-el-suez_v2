'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'success' | 'info';
    isLoading?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'تأكيد',
    cancelText = 'إلغاء',
    type = 'danger',
    isLoading = false
}: ConfirmModalProps) {
    const isInfo = type === 'info';
    const isSuccess = type === 'success';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-500"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 m-auto w-[90%] max-w-sm h-fit bg-surface rounded-3xl p-6 z-501 shadow-2xl border border-border-subtle flex flex-col items-center text-center"
                        dir="rtl"
                    >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${type === 'danger' ? 'bg-red-50 text-red-500' :
                                type === 'success' ? 'bg-green-50 text-green-500' :
                                    'bg-blue-50 text-blue-500'
                            }`}>
                            {type === 'danger' && <AlertCircle className="w-8 h-8" />}
                            {type === 'success' && <CheckCircle2 className="w-8 h-8" />}
                            {type === 'info' && <Info className="w-8 h-8" />}
                        </div>

                        <h3 className="text-xl font-black text-text-primary mb-2">{title}</h3>
                        <p className="text-sm font-bold text-text-muted mb-6">
                            {description}
                        </p>

                        <div className="flex gap-3 w-full">
                            {!isInfo && !isSuccess && (
                                <button
                                    onClick={onClose}
                                    className="flex-1 h-12 rounded-2xl bg-background border border-border-subtle text-text-primary font-black text-sm hover:bg-background/80 transition-all"
                                >
                                    {cancelText}
                                </button>
                            )}
                            <button
                                onClick={onConfirm || onClose}
                                disabled={isLoading}
                                className={`flex-1 h-12 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20' :
                                        type === 'success' ? 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/20' :
                                            'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20'
                                    } ${isInfo || isSuccess ? 'w-full' : ''}`}
                            >
                                {isLoading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : confirmText}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
