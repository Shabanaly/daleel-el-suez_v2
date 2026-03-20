'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X, HelpCircle } from 'lucide-react';

type DialogType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

interface DialogOptions {
    title: string;
    message: string;
    type?: DialogType;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface DialogContextType {
    showAlert: (options: Omit<DialogOptions, 'type' | 'onCancel' | 'cancelLabel'> & { type?: Exclude<DialogType, 'confirm'> }) => void;
    showConfirm: (options: DialogOptions & { onConfirm: () => void }) => void;
    closeDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialog = () => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('useDialog must be used within a DialogProvider');
    }
    return context;
};

export const DialogProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<DialogOptions | null>(null);

    const showAlert = useCallback((opts: Omit<DialogOptions, 'type' | 'onCancel' | 'cancelLabel'> & { type?: Exclude<DialogType, 'confirm'> }) => {
        setOptions({ ...opts, type: opts.type || 'info' } as DialogOptions);
        setIsOpen(true);
    }, []);

    const showConfirm = useCallback((opts: DialogOptions) => {
        setOptions({ ...opts, type: 'confirm' });
        setIsOpen(true);
    }, []);

    const closeDialog = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleConfirm = () => {
        options?.onConfirm?.();
        closeDialog();
    };

    const handleCancel = () => {
        options?.onCancel?.();
        closeDialog();
    };

    const getIcon = (type?: DialogType) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-12 h-12 text-green-500" />;
            case 'error': return <AlertCircle className="w-12 h-12 text-accent" />;
            case 'warning': return <AlertCircle className="w-12 h-12 text-yellow-500" />;
            case 'confirm': return <HelpCircle className="w-12 h-12 text-primary" />;
            default: return <Info className="w-12 h-12 text-blue-500" />;
        }
    };

    return (
        <DialogContext.Provider value={{ showAlert, showConfirm, closeDialog }}>
            {children}
            <AnimatePresence>
                {isOpen && options && (
                    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeDialog}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm bg-background rounded-[32px] p-8 shadow-2xl border border-border-subtle overflow-hidden"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="mb-6 p-4 rounded-full bg-surface">
                                    {getIcon(options.type)}
                                </div>

                                <h3 className="text-xl font-black text-text-primary mb-2">
                                    {options.title}
                                </h3>
                                <p className="text-text-muted text-sm font-bold opacity-70 leading-relaxed mb-8">
                                    {options.message}
                                </p>

                                <div className="flex flex-col gap-3 w-full">
                                    <button
                                        onClick={handleConfirm}
                                        className={`h-12 w-full rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg ${options.type === 'confirm' || options.type === 'success' || options.type === 'info'
                                                ? 'bg-primary text-white shadow-primary/20 hover:bg-primary-hover'
                                                : 'bg-accent text-white shadow-accent/20 hover:bg-accent/80'
                                            }`}
                                    >
                                        {options.confirmLabel || (options.type === 'confirm' ? 'تأكيد' : 'حسناً')}
                                    </button>

                                    {options.type === 'confirm' && (
                                        <button
                                            onClick={handleCancel}
                                            className="h-12 w-full rounded-2xl bg-surface text-text-muted font-black text-sm hover:bg-surface/80 transition-all active:scale-95"
                                        >
                                            {options.cancelLabel || 'إلغاء'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={closeDialog}
                                className="absolute top-6 left-6 p-2 rounded-xl hover:bg-surface text-text-muted transition-colors opacity-50 hover:opacity-100"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DialogContext.Provider>
    );
};
