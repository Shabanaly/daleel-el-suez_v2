'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';

export function AdsenseScript() {
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        // Adsense is heavy, so we delay it more or wait for interaction
        const timer = setTimeout(() => {
            setShouldLoad(true);
        }, 6000); // 6 seconds delay

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
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5152627364584775" 
            strategy="afterInteractive"
            crossOrigin="anonymous"
        />
    );
}
