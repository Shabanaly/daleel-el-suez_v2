'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { useScrollDirection } from '@/hooks/useScrollDirection';

export default function ScrollToTop() {
    const { scrollY } = useScrollDirection();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show button when scrolled down 400px
        setIsVisible(scrollY > 400);
    }, [scrollY]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={scrollToTop}
                    className="fixed bottom-24 left-6 z-60 flex h-12 w-12 items-center justify-center rounded-2xl border border-border-subtle/50 bg-surface/80 text-primary shadow-2xl backdrop-blur-xl transition-colors hover:bg-elevated md:bottom-10 md:left-10 lg:left-80"
                    aria-label="العودة للأعلى"
                >
                    <ChevronUp className="h-6 w-6 stroke-[3px]" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
