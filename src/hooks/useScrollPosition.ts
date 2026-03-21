import { useState, useEffect } from 'react';

export function useScrollPosition() {
    const [scrollPosition, setScrollPosition] = useState(0);

    useEffect(() => {
        const updatePosition = () => {
            setScrollPosition(window.pageYOffset || document.documentElement.scrollTop);
        };
        
        // Setup initial position
        updatePosition();

        window.addEventListener('scroll', updatePosition, { passive: true });
        return () => window.removeEventListener('scroll', updatePosition);
    }, []);

    return scrollPosition;
}
