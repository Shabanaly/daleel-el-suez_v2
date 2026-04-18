import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Home } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs = ({ items, className = "" }: BreadcrumbsProps) => {
  // Generate BreadcrumbList JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.href ? `${process.env.NEXT_PUBLIC_BASE_URL || ''}${item.href}` : undefined,
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className={`flex flex-col gap-4 ${className}`}>
      {/* JSON-LD for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ol className="flex flex-wrap items-center gap-2 text-xs md:text-sm font-bold text-text-muted">
        <li className="flex items-center">
          <Link 
            href={ROUTES.HOME} 
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">الرئيسية</span>
          </Link>
        </li>

        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <ChevronLeft className="w-3 h-3 opacity-50" />
            {item.href && index < items.length - 1 ? (
              <Link 
                href={item.href} 
                className="hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-text-primary/60 truncate max-w-[150px] md:max-w-none">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
