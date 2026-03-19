'use client';

import * as Icons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
  fallback?: React.ReactNode;
}

/**
 * Renders a Lucide icon dynamically based on its string name.
 * Example: <DynamicIcon name="ShoppingBag" className="w-6 h-6" />
 */
export default function DynamicIcon({ name, fallback, ...props }: DynamicIconProps) {
  // @ts-ignore - Dynamic access to icons
  const IconComponent = Icons[name];

  if (!IconComponent) {
    return fallback || <Icons.HelpCircle {...props} />;
  }

  return <IconComponent {...props} />;
}
