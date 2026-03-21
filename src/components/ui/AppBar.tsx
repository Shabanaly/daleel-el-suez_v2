'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { useScrollPosition } from '@/hooks/useScrollPosition';

interface AppBarProps {
    title: string | React.ReactNode;
    titleBehavior?: 'static' | 'scroll-reveal';
    backHref?: string;
    onBack?: () => void;
    transparent?: boolean;
    actions?: React.ReactNode;
    className?: string;
}

export function AppBar({
    title,
    titleBehavior = 'static',
    backHref,
    onBack,
    transparent = false,
    actions,
    className = ''
}: AppBarProps) {
    const router = useRouter();
    const scrollY = useScrollPosition();

    // Determine when background becomes solid and blurry
    const isSolid = !transparent || scrollY > 20;

    // Determine when title becomes visible (if scroll-reveal)
    const showTitle = titleBehavior === 'static' || scrollY > 60;

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (backHref) {
            router.push(backHref);
        } else {
            router.back();
        }
    };

    return (
        <header 
            dir="rtl"
            className={`
                fixed top-0 w-full z-50 px-3 h-14 md:hidden
                flex items-center justify-between transition-all duration-300
                ${isSolid ? 'bg-background/80 backdrop-blur-xl border-b border-border-subtle/50' : 'bg-transparent border-transparent'}
                ${className}
            `}
        >
            {/* Left/Back Button (In RTL, 'back' is on the right side of the screen visually, but DOM order dictates we put it first since flex-row and dir="rtl" will place it visually on the right.) */}
            <div className="z-10 shrink-0">
                <button
                    onClick={handleBack}
                    className="w-10 h-10 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-text-primary hover:bg-elevated active:scale-95 transition-all shadow-sm"
                    aria-label="رجوع"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Title (Absolute Centered) */}
            <div
                className={`
                    absolute inset-0 flex items-center justify-center pointer-events-none
                    transition-opacity duration-300
                    ${showTitle ? 'opacity-100' : 'opacity-0'}
                `}
            >
                <div className="text-lg font-bold text-text-primary truncate max-w-[65%] text-center">
                    {title}
                </div>
            </div>

            {/* Right/Actions */}
            <div className="z-10 shrink-0 flex gap-2">
                {actions || <div className="w-10 h-10 pointer-events-none" />}
            </div>
        </header>
    );
}
