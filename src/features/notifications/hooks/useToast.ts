'use client';

import { useContext } from 'react';
import { ToastContext } from '@/features/notifications/components/ToastProvider';

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
