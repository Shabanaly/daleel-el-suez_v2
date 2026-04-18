"use client";

import Script from "next/script";

export function AdsenseScript() {
  return (
    <Script
      id="adsbygoogle-init"
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5152627364584775"
      crossOrigin="anonymous"
      strategy="beforeInteractive"
    />
  );
}
