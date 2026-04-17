'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { LucideIcon, HelpCircle, Grid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';

interface BlogCategoryNavProps {
  categories: {
    name: string;
    slug: string;
    icon: string;
  }[];
}

const IconRenderer = ({ iconName, className }: { iconName: string; className?: string }) => {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[iconName];
  if (!Icon) {
    return <HelpCircle className={className} />;
  }
  return <Icon className={className} />;
};

export default function BlogCategoryNav({ categories }: BlogCategoryNavProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');

  const handleCategoryClick = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    // Reset to page 1 when category changes
    params.delete('page');
    router.push(`${ROUTES.BLOG}?${params.toString()}`);
  };

  return (
    <div className="hidden w-full py-6 md:block">
      <div className="flex w-full flex-wrap items-center justify-center gap-3">
        {/* All Categories Chip */}
        <button
          onClick={() => handleCategoryClick(null)}
          className={cn(
            'flex items-center gap-2 rounded-2xl border px-6 py-3 text-sm font-black transition-all duration-300 active:scale-95',
            !currentCategory
              ? 'border-primary/30 bg-primary/10 text-primary shadow-lg shadow-primary/5'
              : 'border-border-subtle bg-surface/50 text-text-muted hover:border-primary/20 hover:bg-surface'
          )}
        >
          <Grid className="h-4 w-4" />
          كل المقالات
        </button>

        {/* Dynamic Category Chips */}
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => handleCategoryClick(cat.slug)}
            className={cn(
              'flex items-center gap-2 rounded-2xl border px-6 py-3 text-sm font-black transition-all duration-300 active:scale-95',
              currentCategory === cat.slug
                ? 'border-primary/30 bg-primary/10 text-primary shadow-lg shadow-primary/5'
                : 'border-border-subtle bg-surface/50 text-text-muted hover:border-primary/20 hover:bg-surface'
            )}
          >
            <IconRenderer iconName={cat.icon} className="h-4 w-4" />
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
