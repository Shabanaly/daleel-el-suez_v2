'use client';

import { ShieldCheck, ShieldAlert, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminUserRole } from '@/features/admin/actions/users';

interface RoleBadgeProps {
    role: AdminUserRole;
    className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
    const roles = {
        admin: {
            label: 'مدير نظام',
            icon: ShieldCheck,
            color: 'bg-error/10 text-error border-error/20',
            glow: 'shadow-[0_0_8px_rgba(239,68,68,0.2)]'
        },
        moderator: {
            label: 'مشرف',
            icon: ShieldAlert,
            color: 'bg-warning/10 text-warning border-warning/20',
            glow: 'shadow-[0_0_8px_rgba(245,158,11,0.2)]'
        },
        user: {
            label: 'مستخدم',
            icon: User,
            color: 'bg-primary/10 text-primary border-primary/20',
            glow: ''
        },
    };

    const config = roles[role] || roles.user;
    const Icon = config.icon;

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all duration-300",
            config.color,
            config.glow,
            className
        )}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
        </span>
    );
}
