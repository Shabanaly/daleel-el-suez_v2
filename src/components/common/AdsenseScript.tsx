'use client';

import { useState, useEffect } from 'react';

/**
 * Modern AdsenseScript that avoids hydration mismatches and "data-nscript" warnings.
 * It uses isMounted to only render on the client, and dangerouslySetInnerHTML 
 * to provide a clean <script> tag for AdSense verification.
 */
export function AdsenseScript() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <div 
            dangerouslySetInnerHTML={{
                __html: `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5152627364584775" crossorigin="anonymous"></script>`
            }}
        />
    );
}
