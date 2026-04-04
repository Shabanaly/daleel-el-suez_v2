'use client';

import Script from 'next/script';

interface BreadcrumbItem {
  name: string;
  item: string;
}

interface BreadcrumbsJsonLdProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbsJsonLd({ items }: BreadcrumbsJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daleel-al-suez.com';
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.item.startsWith('http') ? item.item : `${baseUrl}${item.item.startsWith('/') ? '' : '/'}${item.item}`
    }))
  };

  return (
    <Script
      id={`breadcrumbs-json-ld-${items.length}`}
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
