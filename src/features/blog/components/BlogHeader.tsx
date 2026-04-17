'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Grid, HelpCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { AppBar } from '@/components/ui/AppBar';
import { ContextMenu, ContextMenuItem } from '@/components/ui/ContextMenu';
import { ROUTES } from '@/constants';

interface BlogHeaderProps {
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

export default function BlogHeader({ categories }: BlogHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategorySlug = searchParams.get('category');

  const handleCategoryClick = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    params.delete('page');
    router.push(`${ROUTES.BLOG}?${params.toString()}`);
  };

  const filterItems: ContextMenuItem[] = [
    {
      label: 'كل المقالات',
      icon: <Grid className="h-4 w-4" />,
      variant: (!currentCategorySlug ? 'active' : 'default') as 'active' | 'default',
      onClick: () => handleCategoryClick(null),
    },
    ...categories.map((cat) => ({
      label: cat.name,
      icon: <IconRenderer iconName={cat.icon} className="h-4 w-4" />,
      variant: (currentCategorySlug === cat.slug ? 'active' : 'default') as 'active' | 'default',
      onClick: () => handleCategoryClick(cat.slug),
    })),
  ];

  const FilterTrigger = ({ isMobile = false }) => (
    <button
      className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all ${
        isMobile ? 'border-border-subtle bg-surface' : 'bg-surface border-border-subtle hover:border-primary/50'
      }`}
    >
      <Filter className="h-5 w-5 text-primary" />
    </button>
  );

  return (
    <AppBar
      title="المدونة"
      backHref={ROUTES.HOME}
      actions={
        <ContextMenu
          trigger={<FilterTrigger isMobile />}
          items={filterItems}
          align="left"
        />
      }
    />
  );
}
