"use client";

import { useState, useEffect, useRef } from "react";
import Script from "next/script";

/**
 * Reusable component for ad units that require atOptions configuration.
 *
 * FIX: Removed the module-level `adLoadCounter` global mutable variable
 * that was leaking state between component instances in React Strict Mode
 * and causing race conditions. Each ad now uses its own local ref for state.
 * All DOM operations are wrapped in try/catch to prevent uncaught exceptions.
 */
interface AtOptionsAdProps {
  id: string;
  format: "iframe" | "container";
  height?: number;
  width?: number;
  scriptSrc: string;
  containerId?: string;
}

function AtOptionsAd({
  id,
  format,
  height,
  width,
  scriptSrc,
  containerId,
}: AtOptionsAdProps) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const hasLoaded = useRef(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Use a microtask to safely defer mount after hydration
    const id = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!isMounted || !bannerRef.current || hasLoaded.current) return;

    hasLoaded.current = true;

    try {
      if (!bannerRef.current) return;

      // Create the atOptions config script
      const optionsScript = document.createElement("script");
      optionsScript.type = "text/javascript";
      optionsScript.textContent = `
        atOptions = {
          'key' : '${id}',
          'format' : '${format}',
          'height' : ${height || 0},
          'width' : ${width || 0},
          'params' : {},
          ${containerId ? `'container' : '${containerId}'` : ""}
        };
      `;
      bannerRef.current.appendChild(optionsScript);

      // Create the invoke script
      const invokeScript = document.createElement("script");
      invokeScript.type = "text/javascript";
      invokeScript.src = scriptSrc;
      invokeScript.onerror = () => {
        console.warn(`[ThirdPartyAds] Failed to load ad script: ${scriptSrc}`);
      };
      bannerRef.current.appendChild(invokeScript);
    } catch (err) {
      console.warn("[ThirdPartyAds] Error loading ad:", err);
    }
  }, [isMounted, id, format, height, width, scriptSrc, containerId]);

  return (
    <div
      className="flex justify-center items-center my-4 min-h-[50px] w-full"
      ref={bannerRef}
    >
      {isMounted && containerId && <div id={containerId}></div>}
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
      scriptSrc="https://www.highperformanceformat.com/843d15223e56c8a9f4d9d3f9541ddfb4/invoke.js"
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
      scriptSrc="https://www.highperformanceformat.com/76b98c6858820b366a5e8cb28287c016/invoke.js"
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
      scriptSrc="https://www.highperformanceformat.com/87b18c7b582e69eb6add705c6d7deb3d/invoke.js"
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
      scriptSrc="https://www.highperformanceformat.com/8cf7e83baee5427622d7e33fa975fb14/invoke.js"
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
  scriptSrc = "https://pl29155098.profitablecpmratenetwork.com/4e21bf42bd3b28d4054a768b2cab88fe/invoke.js",
}: {
  containerId?: string;
  invokeId?: string;
  scriptSrc?: string;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="flex justify-center items-center my-4 min-h-[50px]">
      {isMounted && (
        <>
          <Script
            id={invokeId}
            async={true}
            data-cfasync="false"
            src={scriptSrc}
            strategy="afterInteractive"
            onError={() =>
              console.warn(`[ContainerAd] Failed to load: ${scriptSrc}`)
            }
          />
          <div id={containerId}></div>
        </>
      )}
    </div>
  );
}
