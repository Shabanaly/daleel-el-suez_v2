'use client';

import Script from 'next/script';

export default function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://daleel-al-suez.com/#website",
        url: "https://daleel-al-suez.com",
        name: "دليل السويس",
        alternateName: "Suez Guide",
        description:
          "الدليل الأول والشامل لمحافظة السويس. اكتشف الأماكن، الخدمات، الوظائف، وسوق السويس في مكان واحد.",
        inLanguage: "ar-EG",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate:
              "https://daleel-al-suez.com/places?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": "https://daleel-al-suez.com/#organization",
        url: "https://daleel-al-suez.com",
        name: "دليل السويس",
        logo: "https://daleel-al-suez.com/apple-touch-icon.png",
        sameAs: [
          "https://www.facebook.com/daleel.al.suez",
          "https://www.instagram.com/daleel_al_suez",
          "https://wa.me/201019979315"
        ],
        areaServed: {
          "@type": "State",
          name: "Suez",
          addressRegion: "Suez Governorate",
          addressCountry: "EG",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+201019979315",
          contactType: "customer service",
          areaServed: "EG",
          availableLanguage: "Arabic",
        },
      },
    ],
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
