'use client';

import { memo } from 'react';
import CustomLink from '@/components/customLink/customLink';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { LucideIcon, HelpCircle } from 'lucide-react';

import type { Category } from '@/lib/types/category';
import SectionHeader from '@/components/ui/SectionHeader';
import { ROUTES, ROUTE_HELPERS } from '@/constants';

interface HeroCategoriesProps {
    categories: Category[];
}

// Dynamic Icon Renderer
const IconRenderer = ({ iconName, className }: { iconName: string, className?: string }) => {
    const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[iconName];
    if (!Icon) {
        if (iconName && iconName.length <= 4) return <span className="text-xl">{iconName}</span>;
        return <HelpCircle className={className} />;
    }
    return <Icon className={className} />;
};

export default memo(function HeroCategories({ categories }: HeroCategoriesProps) {
    if (!categories.length) return null;

    // Limit to top 6 for the Hero section
    const displayCategories = categories.slice(0, 6);

    return (
        <div className="w-full space-y-4 md:space-y-8">
            {/* Header Area */}
            <SectionHeader
                title="الأقسام"
                subtitle="التصنيفات الاكثر شيوعاً"
                icon={LucideIcons.Grid}
                href={ROUTES.CATEGORIES}
                viewAllText="عرض الكل"
            />

            {/* Mobile: Horizontal Chips Layout */}
            <div className="md:hidden w-full overflow-x-auto hide-scrollbar -mx-4 px-4">
                <div className="flex items-center gap-2 pb-4 mb-2">
                    {displayCategories.map((cat, idx) => (
                        <CustomLink
                            key={idx}
                            href={ROUTE_HELPERS.PLACES_CATEGORY(cat.name)}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface/70 backdrop-blur-xl border border-border-subtle hover:border-primary/40 active:scale-95 transition-all duration-300 whitespace-nowrap group shadow-sm"
                        >
                            <IconRenderer iconName={cat.icon} className="w-4 h-4 text-primary/80 group-hover:text-primary transition-colors" />
                            <span className="text-xs font-bold text-text-muted group-hover:text-primary transition-colors">{cat.name}</span>
                        </CustomLink>
                    ))}
                    <CustomLink
                        href={ROUTES.CATEGORIES}
                        className="flex items-center gap-2 px-5 py-3 rounded-full bg-primary/10 border border-primary/20 text-primary active:scale-95 transition-all duration-300 whitespace-nowrap font-bold text-xs"
                    >
                        المزيد
                    </CustomLink>
                </div>
            </div>

            {/* Desktop: Grid Layout */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-4"
            >
                {displayCategories.map((cat, idx) => (
                    <CustomLink
                        key={idx}
                        href={ROUTE_HELPERS.PLACES_CATEGORY(cat.name)}
                        className="flex flex-col items-center justify-between p-5 md:p-6 rounded-2xl bg-surface/30 backdrop-blur-md border border-border-subtle hover:border-primary/30 hover:bg-surface/60 hover:translate-y-[-4px] transition-all duration-500 group relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 min-h-[140px] md:min-h-[160px]"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner relative z-10">
                            <IconRenderer iconName={cat.icon} className="w-6 h-6 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                        </div>

                        <div className="text-center space-y-1 mt-auto relative z-10">
                            <h4 className="text-xs md:text-sm font-black text-text-primary group-hover:text-primary transition-colors line-clamp-1">{cat.name}</h4>
                            <p className="text-[9px] md:text-[10px] font-bold text-text-muted/60 group-hover:text-primary/70 transition-colors uppercase tracking-wider">{cat.count}</p>
                        </div>

                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                    </CustomLink>
                ))}
            </motion.div>
        </div>
    );
});
