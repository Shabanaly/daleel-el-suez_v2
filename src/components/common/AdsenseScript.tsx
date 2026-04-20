'use client';

import { useEffect } from 'react';

/**
 * AdsenseScript - Defensive AdSense script injector.
 *
 * Injects the AdSense script via DOM after full client hydration.
 * Uses a robust try/catch + duplicate-prevention guard to ensure
 * that any failure in script loading NEVER throws an unhandled
 * exception that would brick the entire app.
 */
export function AdsenseScript() {
    useEffect(() => {
        try {
            // Prevent duplicate injection (e.g. hot reload, React Strict Mode)
            if (document.getElementById('adsbygoogle-init')) return;

            const script = document.createElement('script');
            script.id = 'adsbygoogle-init';
            script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5152627364584775';
            script.async = true;
            script.crossOrigin = 'anonymous';

            // Silently swallow any load errors so they don't bubble up
            script.onerror = () => {
                console.warn('[AdsenseScript] Failed to load AdSense script. This is non-critical.');
            };

            document.head.appendChild(script);
        } catch (err) {
            // Any DOM manipulation error should be silent — never crash the app
            console.warn('[AdsenseScript] Could not inject script:', err);
        }
    }, []);

    return null;
}
