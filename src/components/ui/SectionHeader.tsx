'use client';

import Link from 'next/link';
import { ChevronLeft, LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    href?: string;
    viewAllText?: string;
}

export default function SectionHeader({
    title,
    subtitle,
    icon: Icon,
    href,
    viewAllText = "عرض الكل"
}: SectionHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-4 md:mb-6 relative z-10 w-full">
            <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2 md:gap-3">
                    <Icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                    <h2 className="text-xl md:text-3xl lg:text-4xl font-black text-text-primary tracking-tight">{title}</h2>
                </div>
                <p className="text-text-muted font-medium text-[10px] md:text-sm mt-1 md:mt-1.5 opacity-80 ps-8 md:ps-11">{subtitle}</p>
            </div>

            {href && (
                <Link
                    href={href}
                    className="group flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-border-subtle hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
                >
                    <span className="text-[10px] md:text-sm font-black text-text-muted group-hover:text-primary transition-colors">{viewAllText}</span>
                    <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4 text-text-muted group-hover:text-primary transition-transform group-hover:-translate-x-1" />
                </Link>
            )}
        </div>
    );
}
