import React from 'react';
import { AdCondition } from '@/features/market/types';

interface ConditionBadgeProps {
    condition: AdCondition;
    className?: string;
}

export default function ConditionBadge({ condition, className = '' }: ConditionBadgeProps) {
    const config: Record<string, { label: string; classes: string }> = {
        new: {
            label: 'جديد',
            classes: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        },
        used: {
            label: 'مستعمل',
            classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        },
        // 'na' = أخرى — no badge shown intentionally
    };

    const item = config[condition];
    if (!item) return null;

    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.classes} ${className}`}>
            {item.label}
        </span>
    );
}
