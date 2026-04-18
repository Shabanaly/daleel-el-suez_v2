'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type DeviceVisibility = 'all' | 'mobile' | 'desktop';

interface AdSlotProps {
  children: React.ReactNode;
  exactPaths?: string[];
  prefixPaths?: string[];
  excludeExactPaths?: string[];
  excludePrefixPaths?: string[];
  device?: DeviceVisibility;
  showLabel?: boolean;
  className?: string;
}

function matchesPath(pathname: string, exactPaths: string[], prefixPaths: string[]) {
  if (exactPaths.includes(pathname)) return true;

  return prefixPaths.some((prefix) => {
    if (prefix === '/') return pathname === '/';
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

export default function AdSlot({
  children,
  exactPaths = [],
  prefixPaths = [],
  excludeExactPaths = [],
  excludePrefixPaths = [],
  device = 'all',
  showLabel = true,
  className,
}: AdSlotProps) {
  const pathname = usePathname();

  const isExcluded = matchesPath(pathname, excludeExactPaths, excludePrefixPaths);
  const hasIncludeRules = exactPaths.length > 0 || prefixPaths.length > 0;
  const isIncluded = hasIncludeRules ? matchesPath(pathname, exactPaths, prefixPaths) : true;

  if (isExcluded || !isIncluded) return null;

  const visibilityClass =
    device === 'mobile' ? 'lg:hidden' : device === 'desktop' ? 'hidden lg:flex' : '';

  return (
    <div className={cn('flex flex-col items-center gap-2', visibilityClass, className)}>
      {showLabel ? (
        <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-50">
          إعلان
        </span>
      ) : null}
      {children}
    </div>
  );
}
