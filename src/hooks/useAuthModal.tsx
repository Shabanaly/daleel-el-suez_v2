'use client';

import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import AuthRequiredModal from '@/components/auth/AuthRequiredModal';

interface AuthModalContextType {
    openModal: (title?: string, description?: string) => void;
    closeModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<{ title?: string; description?: string }>({});

    const openModal = useCallback((title?: string, description?: string) => {
        setModalConfig({ title, description });
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
    }, []);

    return (
        <AuthModalContext.Provider value={{ openModal, closeModal }}>
            {children}
            <AuthRequiredModal
                isOpen={isOpen}
                onClose={closeModal}
                title={modalConfig.title}
                description={modalConfig.description}
            />
        </AuthModalContext.Provider>
    );
}

export function useAuthModal() {
    const context = useContext(AuthModalContext);
    if (context === undefined) {
        throw new Error('useAuthModal must be used within an AuthModalProvider');
    }
    return context;
}
