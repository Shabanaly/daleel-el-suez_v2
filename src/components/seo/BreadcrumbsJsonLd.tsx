/**
 * BreadcrumbsJsonLd — Server Component for BreadcrumbList structured data.
 *
 * IMPORTANT: This is a Server Component with a plain <script> tag.
 * Do NOT add 'use client' or use next/script here.
 * Plain <script type="application/ld+json"> is rendered in the initial HTML
 * so Google Bot sees it without needing to execute JavaScript.
 *
 * FIX: The `item` field in every ListItem MUST be a fully-qualified absolute URL.
 * Relative paths like "/places" cause the Google Search Console warning:
 * "Invalid URL in the 'id' field (in 'itemListElement.item')"
 */

const BASE_URL = 'https://daleel-al-suez.com';

interface BreadcrumbItem {
  name: string;
  /** Can be a full URL or a relative path starting with "/" */
  item: string;
}

interface BreadcrumbsJsonLdProps {
  items: BreadcrumbItem[];
}

/**
 * Ensures the URL is always a fully-qualified absolute URL.
 * Google Search Console requires absolute URLs in itemListElement.item.
 */
function toAbsoluteUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Ensure exactly one slash between base and path
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${BASE_URL}${path}`;
}

export default function BreadcrumbsJsonLd({ items }: BreadcrumbsJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": toAbsoluteUrl(crumb.item),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
