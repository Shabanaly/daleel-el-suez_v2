'use client';

import { PlaceStatus } from '@/features/admin/actions/places';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface PlaceStatusBadgeProps {
    status: PlaceStatus;
}

export function PlaceStatusBadge({ status }: PlaceStatusBadgeProps) {
    switch (status) {
        case 'approved':
            return (
                <span className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
                    "bg-success/10 text-success border border-success/20"
                )}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    مقبول
                </span>
            );
        case 'pending':
            return (
                <span className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
                    "bg-warning/10 text-warning border border-warning/20"
                )}>
                    <Clock className="w-3.5 h-3.5" />
                    معلق
                </span>
            );
        case 'rejected':
            return (
                <span className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
                    "bg-error/10 text-error border border-error/20"
                )}>
                    <XCircle className="w-3.5 h-3.5" />
                    مرفوض
                </span>
            );
        default:
            return null;
    }
}
