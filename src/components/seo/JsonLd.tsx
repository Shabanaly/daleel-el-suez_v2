'use client';

import Script from 'next/script';

export default function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://daleel-al-suez.com/#website",
        "url": "https://daleel-al-suez.com",
        "name": "دليل السويس",
        "description": "اكتشف أفضل الأماكن، الخدمات، والمطاعم في محافظة السويس.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://daleel-al-suez.com/places?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://daleel-al-suez.com/#organization",
        "url": "https://daleel-al-suez.com",
        "name": "دليل السويس",
        "logo": "https://daleel-al-suez.com/apple-touch-icon.png"
      }
    ]
  };

  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
