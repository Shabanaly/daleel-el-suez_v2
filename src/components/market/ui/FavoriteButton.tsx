'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleFavorite, isItemFavorite } from '@/lib/actions/favorites';

interface FavoriteButtonProps {
    adId: string;
    className?: string;
}

export default function FavoriteButton({ adId, className = "" }: FavoriteButtonProps) {
    const [isFavorited, setIsFavorited] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            const favorited = await isItemFavorite(adId, 'listing');
            setIsFavorited(favorited);
            setIsLoading(false);
        };
        checkStatus();
    }, [adId]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Optimistic update
        setIsFavorited(!isFavorited);

        const result = await toggleFavorite(adId, 'listing');
        if (result.error) {
            // Revert on failure
            setIsFavorited(isFavorited);
            alert(result.error);
        }
    };

    if (isLoading) return <div className={`w-8 h-8 rounded-full bg-surface/50 animate-pulse ${className}`} />;

    return (
        <button
            onClick={handleToggle}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isFavorited 
                ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                : "bg-white/80 dark:bg-black/40 backdrop-blur-md text-text-muted hover:text-red-500 border border-border-subtle"
            } ${className}`}
        >
            <motion.div
                animate={isFavorited ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
            >
                <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
            </motion.div>
        </button>
    );
}
