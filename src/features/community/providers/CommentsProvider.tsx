'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface CommentsContextType {
    isOpen: boolean;
    activePostId: string | null;
    openComments: (postId: string) => void;
    closeComments: () => void;
}

const CommentsContext = createContext<CommentsContextType | undefined>(undefined);

export const useComments = () => {
    const context = useContext(CommentsContext);
    if (!context) {
        throw new Error('useComments must be used within a CommentsProvider');
    }
    return context;
};

export const CommentsProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activePostId, setActivePostId] = useState<string | null>(null);

    const openComments = useCallback((postId: string) => {
        setActivePostId(postId);
        setIsOpen(true);
    }, []);

    const closeComments = useCallback(() => {
        setIsOpen(false);
        setActivePostId(null);
    }, []);

    return (
        <CommentsContext.Provider value={{ isOpen, activePostId, openComments, closeComments }}>
            {children}
        </CommentsContext.Provider>
    );
};
