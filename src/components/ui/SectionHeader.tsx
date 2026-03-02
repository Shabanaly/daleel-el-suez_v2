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
        <div className="flex items-center justify-between mb-8 md:mb-12 relative z-10 w-full">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 glow-primary relative group overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary relative z-10" />
                </div>
                <div>
                    <h2 className="text-xl md:text-3xl lg:text-4xl font-black text-text-primary tracking-tight">{title}</h2>
                    <p className="text-text-muted font-bold text-[10px] md:text-sm mt-0.5 md:mt-1 opacity-70">{subtitle}</p>
                </div>
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
