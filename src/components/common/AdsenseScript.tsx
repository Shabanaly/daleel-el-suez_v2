'use client';

import { useEffect } from 'react';

/**
 * Optimized AdSense script injector.
 * Uses manual DOM injection into the <head> to avoid Next.js's 'data-nscript' attribute,
 * which can cause warnings or stability issues with AdSense.
 * The useEffect ensures it only runs on the client after hydration.
 */
export function AdsenseScript() {
    useEffect(() => {
        // Prevent duplicate injection
        if (document.getElementById('adsbygoogle-init')) return;

        const script = document.createElement('script');
        script.id = 'adsbygoogle-init';
        script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5152627364584775";
        script.async = true;
        script.crossOrigin = "anonymous";
        
        // Append to head
        document.head.appendChild(script);
    }, []);

    return null;
}
