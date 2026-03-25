'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { toggleFavorite, isItemFavorite } from '@/lib/actions/favorites';
import { useAuth } from '@/hooks/useAuth';
import AuthRequiredModal from '@/components/auth/AuthRequiredModal';
import { useDialog } from '@/components/providers/DialogProvider';
// import { useRouter } from 'next/navigation';
import { useEffect, useTransition } from 'react';

interface FavoriteButtonProps {
    itemId: string;
    itemType: 'place' | 'listing';
    initialIsFavorite?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function FavoriteButton({
    itemId,
    itemType,
    initialIsFavorite = false,
    size = 'md',
    className = ''
}: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const { user } = useAuth();
    const { showAlert } = useDialog();
    const [isPending, startTransition] = useTransition();
    // const router = useRouter();

    // Fetch actual status on mount to ensure persistence
    useEffect(() => {
        if (user && itemId) {
            const checkStatus = async () => {
                try {
                    const status = await isItemFavorite(itemId, itemType);
                    setIsFavorite(status);
                } catch (error) {
                    console.error('Error checking favorite status:', error);
                }
            };
            checkStatus();
        }
    }, [user, itemId, itemType]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }

        if (isLoading) return;

        // Optimistic UI update
        setIsFavorite(!isFavorite);
        setIsLoading(true);

        startTransition(async () => {
            try {
                const result = await toggleFavorite(itemId, itemType);
                if (result.error) {
                    // Rollback if error
                    setIsFavorite(isFavorite);
                    showAlert({
                        title: 'خطأ',
                        message: result.error,
                        type: 'error'
                    });
                } else if (result.success) {
                    setIsFavorite(result.isFavorite!);
                }
            } catch {
                setIsFavorite(isFavorite);
            } finally {
                setIsLoading(false);
            }
        });
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm': return 'w-8 h-8 rounded-lg';
            case 'lg': return 'w-12 h-12 md:w-16 md:h-16 rounded-2xl';
            default: return 'w-10 h-10 rounded-xl';
        }
    };

    const getIconSize = () => {
        switch (size) {
            case 'sm': return 'w-4 h-4';
            case 'lg': return 'w-5 h-5 md:w-7 md:h-7';
            default: return 'w-5 h-5';
        }
    };

    return (
        <>
            <button
                onClick={handleToggle}
                disabled={isLoading}
                className={`flex items-center justify-center border transition-all duration-300 shrink-0 ${isFavorite
                    ? 'bg-rose-50 text-rose-500 border-rose-200 shadow-sm shadow-rose-500/10 ring-4 ring-rose-500/5'
                    : 'bg-surface text-text-muted border-border-subtle hover:border-rose-300 hover:text-rose-500 active:bg-rose-50'
                    } ${getSizeClasses()} ${className} ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            >
                <motion.div
                    animate={isFavorite ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.3 }}
                >
                    <Heart
                        className={`${getIconSize()} ${isFavorite ? 'fill-current' : ''}`}
                    />
                </motion.div>
            </button>

            <AuthRequiredModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                title="تنبيه"
                description="يجب تسجيل الدخول لإضافة الأماكن إلى قائمتك المفضلة"
            />
        </>
    );
}
