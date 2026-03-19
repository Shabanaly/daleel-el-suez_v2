import React from 'react';
import { AdCondition } from '@/lib/types/market';

interface ConditionBadgeProps {
    condition: AdCondition;
    className?: string;
}

export default function ConditionBadge({ condition, className = '' }: ConditionBadgeProps) {
    if (condition === 'na') return null;

    const config = {
        new: {
            label: 'جديد',
            classes: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        },
        used: {
            label: 'مستعمل',
            classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        },
    };

    const { label, classes } = config[condition] || { label: '', classes: '' };

    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${classes} ${className}`}>
            {label}
        </span>
    );
}
