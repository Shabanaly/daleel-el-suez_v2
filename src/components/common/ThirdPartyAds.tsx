'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

/**
 * Reusable component for ad units that require atOptions configuration
 */
interface AtOptionsAdProps {
    id: string;
    format: 'iframe' | 'container';
    height?: number;
    width?: number;
    scriptSrc: string;
    containerId?: string;
}

function AtOptionsAd({ id, format, height, width, scriptSrc, containerId }: AtOptionsAdProps) {
    const bannerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!bannerRef.current) return;

        // Create the script element for atOptions
        const optionsScript = document.createElement('script');
        optionsScript.type = 'text/javascript';
        optionsScript.innerHTML = `
            atOptions = {
                'key' : '${id}',
                'format' : '${format}',
                'height' : ${height || 0},
                'width' : ${width || 0},
                'params' : {}
            };
        `;
        
        bannerRef.current.appendChild(optionsScript);

        // Create the invoke script
        const invokeScript = document.createElement('script');
        invokeScript.type = 'text/javascript';
        invokeScript.src = scriptSrc;
        
        bannerRef.current.appendChild(invokeScript);
    }, [id, format, height, width, scriptSrc]);

    return (
        <div className="flex justify-center items-center my-4 overflow-hidden min-h-[50px] w-full" ref={bannerRef}>
            {containerId && <div id={containerId}></div>}
        </div>
    );
}

// 728x90 Horizontal Banner
export function Banner728x90() {
    return (
        <AtOptionsAd 
            id="843d15223e56c8a9f4d9d3f9541ddfb4"
            format="iframe"
            height={90}
            width={728}
            scriptSrc="//www.highperformanceformat.com/843d15223e56c8a9f4d9d3f9541ddfb4/invoke.js"
        />
    );
}

// 160x600 Vertical Banner
export function Vertical160x600() {
    return (
        <AtOptionsAd 
            id="8cf7e83baee5427622d7e33fa975fb14"
            format="iframe"
            height={600}
            width={160}
            scriptSrc="//www.highperformanceformat.com/8cf7e83baee5427622d7e33fa975fb14/invoke.js"
        />
    );
}

// 320x50 Mobile Banner
export function Banner320x50() {
    return (
        <AtOptionsAd 
            id="529a4d95dd9526bcd4a570c443954942"
            format="iframe"
            height={50}
            width={320}
            scriptSrc="https://www.highperformanceformat.com/529a4d95dd9526bcd4a570c443954942/invoke.js"
        />
    );
}

