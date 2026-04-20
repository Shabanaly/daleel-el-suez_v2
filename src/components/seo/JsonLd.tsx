/**
 * JsonLd — Root-level Organization & WebSite structured data.
 *
 * IMPORTANT: This is a Server Component with a plain <script> tag.
 * Do NOT add 'use client' or use next/script here.
 * Plain <script type="application/ld+json"> is rendered in the initial HTML
 * so Google Bot and all crawlers see it immediately without executing JS.
 */

const BASE_URL = 'https://daleel-al-suez.com';

export default function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: BASE_URL,
        name: "دليل السويس",
        alternateName: "Suez Guide",
        description:
          "الدليل الأول والشامل لمحافظة السويس. اكتشف الأماكن، الخدمات، الوظائف، وسوق السويس في مكان واحد.",
        inLanguage: "ar-EG",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${BASE_URL}/places?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        url: BASE_URL,
        name: "دليل السويس",
        logo: {
          "@type": "ImageObject",
          url: `${BASE_URL}/apple-touch-icon.png`,
        },
        sameAs: [
          "https://www.facebook.com/daleel.al.suez",
          "https://www.instagram.com/daleel_al_suez",
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
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
