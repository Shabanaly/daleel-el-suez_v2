'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';

export function GoogleIdScript() {
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        // Load after 5 seconds of idle time
        const timer = setTimeout(() => {
            setShouldLoad(true);
        }, 5000);

        // Or load immediately on user interaction (scroll or click)
        const handleInteraction = () => {
            setShouldLoad(true);
            clearTimeout(timer);
            window.removeEventListener('scroll', handleInteraction);
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };

        window.addEventListener('scroll', handleInteraction, { passive: true });
        window.addEventListener('click', handleInteraction, { passive: true });
        window.addEventListener('touchstart', handleInteraction, { passive: true });

        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', handleInteraction);
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };
    }, []);

    if (!shouldLoad) return null;

    return (
        <Script 
            id="google-gsi-client"
            src="https://accounts.google.com/gsi/client" 
            strategy="lazyOnload"
            onLoad={() => {
                console.log('[GSI] Google Sign-In script loaded successfully');
            }}
            onError={(e) => {
                console.error('[GSI] Google Sign-In script failed to load', e);
            }}
        />
    );
}
