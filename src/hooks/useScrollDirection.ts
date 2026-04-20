import { useState, useEffect, useRef } from 'react';

export type ScrollDirection = 'up' | 'down' | null;

export function useScrollDirection(threshold = 10) {
    const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
    const [scrollY, setScrollY] = useState(0);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const updateScrollDirection = () => {
            const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
            
            // Ensure we've scrolled enough to trigger a change (threshold)
            if (Math.abs(currentScrollY - lastScrollY.current) < threshold) {
                return;
            }

            const direction: ScrollDirection = currentScrollY > lastScrollY.current ? 'down' : 'up';
            
            // If we are at the very top, don't hide
            if (currentScrollY < 10) {
                setScrollDirection('up');
            } else if (direction !== scrollDirection) {
                setScrollDirection(direction);
            }

            setScrollY(currentScrollY);
            lastScrollY.current = currentScrollY > 0 ? currentScrollY : 0;
        };

        window.addEventListener('scroll', updateScrollDirection, { passive: true });
        return () => window.removeEventListener('scroll', updateScrollDirection);
    }, [scrollDirection, threshold]);

    return { scrollDirection, scrollY };
}
