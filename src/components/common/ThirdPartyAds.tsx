'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

// Global counter to stagger ad loading to prevent atOptions collision
let adLoadCounter = 0;

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
    const hasLoaded = useRef(false);

    useEffect(() => {
        if (!bannerRef.current || hasLoaded.current) return;
        
        const currentCounter = adLoadCounter++;
        const delay = currentCounter * 800; // 800ms stagger between ads

        const timer = setTimeout(() => {
            if (!bannerRef.current) return;
            hasLoaded.current = true;

            // Create the script element for atOptions
            const optionsScript = document.createElement('script');
            optionsScript.type = 'text/javascript';
            optionsScript.innerHTML = `
                atOptions = {
                    'key' : '${id}',
                    'format' : '${format}',
                    'height' : ${height || 0},
                    'width' : ${width || 0},
                    'params' : {},
                    ${containerId ? `'container' : '${containerId}'` : ''}
                };
            `;
            
            bannerRef.current.appendChild(optionsScript);

            // Create the invoke script
            const invokeScript = document.createElement('script');
            invokeScript.type = 'text/javascript';
            invokeScript.src = scriptSrc;
            
            bannerRef.current.appendChild(invokeScript);
        }, delay);

        return () => clearTimeout(timer);
    }, [id, format, height, width, scriptSrc, containerId]);

    return (
        <div className="flex justify-center items-center my-4 overflow-hidden min-h-[50px] w-full" ref={bannerRef}>
            {containerId && <div id={containerId}></div>}
        </div>
    );
}

// 728x90 Horizontal Banner
export function Banner728x90({ containerId }: { containerId?: string }) {
    return (
        <AtOptionsAd 
            id="843d15223e56c8a9f4d9d3f9541ddfb4"
            format="iframe"
            height={90}
            width={728}
            scriptSrc="//www.highperformanceformat.com/843d15223e56c8a9f4d9d3f9541ddfb4/invoke.js"
            containerId={containerId}
        />
    );
}

// 468x60 Banner
export function Banner468x60({ containerId }: { containerId?: string }) {
    return (
        <AtOptionsAd 
            id="76b98c6858820b366a5e8cb28287c016"
            format="iframe"
            height={60}
            width={468}
            scriptSrc="//www.highperformanceformat.com/76b98c6858820b366a5e8cb28287c016/invoke.js"
            containerId={containerId}
        />
    );
}

// 300x250 Rectangle
export function Rectangle300x250({ containerId }: { containerId?: string }) {
    return (
        <AtOptionsAd 
            id="87b18c7b582e69eb6add705c6d7deb3d"
            format="iframe"
            height={250}
            width={300}
            scriptSrc="//www.highperformanceformat.com/87b18c7b582e69eb6add705c6d7deb3d/invoke.js"
            containerId={containerId}
        />
    );
}

// 160x600 Vertical Banner
export function Vertical160x600({ containerId }: { containerId?: string }) {
    return (
        <AtOptionsAd 
            id="8cf7e83baee5427622d7e33fa975fb14"
            format="iframe"
            height={600}
            width={160}
            scriptSrc="//www.highperformanceformat.com/8cf7e83baee5427622d7e33fa975fb14/invoke.js"
            containerId={containerId}
        />
    );
}

// 320x50 Mobile Banner
export function Banner320x50({ containerId }: { containerId?: string }) {
    return (
        <AtOptionsAd 
            id="529a4d95dd9526bcd4a570c443954942"
            format="iframe"
            height={50}
            width={320}
            scriptSrc="https://www.highperformanceformat.com/529a4d95dd9526bcd4a570c443954942/invoke.js"
            containerId={containerId}
        />
    );
}

// Container-based ad (ProfitableCPM / Adsterra)
export function ContainerAd({ 
    containerId = "container-4e21bf42bd3b28d4054a768b2cab88fe", 
    invokeId = "invoke-4e21bf42bd3b28d4054a768b2cab88fe",
    scriptSrc = "https://pl29155098.profitablecpmratenetwork.com/4e21bf42bd3b28d4054a768b2cab88fe/invoke.js"
}: { containerId?: string, invokeId?: string, scriptSrc?: string }) {
    return (
        <div className="flex justify-center items-center my-4">
            <Script 
                id={invokeId}
                async={true}
                data-cfasync="false"
                src={scriptSrc}
                strategy="afterInteractive"
            />
            <div id={containerId}></div>
        </div>
    );
}
