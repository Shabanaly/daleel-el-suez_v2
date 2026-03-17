'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import type { Category } from '@/lib/types/category';

interface CategoryGridProps {
    categories: Category[];
}

const DynamicIcon = ({ iconName, className }: { iconName: string, className?: string }) => {
    const Icon = (LucideIcons as any)[iconName];
    if (!Icon) {
        if (iconName && iconName.length <= 4) return <span className="text-xl md:text-3xl">{iconName}</span>;
        return <LucideIcons.HelpCircle className={className} />;
    }
    return <Icon className={className} />;
};

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.04 }
    }
};

const itemAnim = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1 }
};

export function CategoryGrid({ categories }: CategoryGridProps) {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6 lg:gap-8 pb-32"
        >
            {categories.map((category) => (
                <motion.div key={category.id} variants={itemAnim}>
                    <Link
                        href={`/categories/${category.slug}`}
                        className="group relative flex flex-col items-center justify-between text-center p-6 md:p-8 rounded-2xl md:rounded-3xl bg-surface/30 backdrop-blur-xl border border-border-subtle hover:border-primary/40 hover:bg-surface/80 hover:translate-y-[-8px] active:scale-95 transition-all duration-500 w-full min-h-[160px] md:min-h-[200px] shadow-sm hover:shadow-2xl hover:shadow-primary/10 overflow-hidden"
                    >
                        {/* Decorative Background Orb */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner group-hover:rotate-6 relative z-10">
                            <DynamicIcon
                                iconName={category.icon}
                                className="w-6 h-6 md:w-8 md:h-8 opacity-90 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"
                            />
                        </div>

                        <div className="space-y-1 md:space-y-2 relative z-10 mt-auto">
                            <h3 className="text-xs md:text-base font-black text-text-primary group-hover:text-primary transition-colors leading-tight line-clamp-2">
                                {category.name}
                            </h3>
                            <p className="text-[10px] md:text-xs font-bold text-text-muted/60 group-hover:text-primary/70 transition-colors uppercase tracking-wider">
                                {category.count || '0+ مكان'}
                            </p>
                        </div>

                        {/* Premium Shine Effect */}
                        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

                        {/* Status dot if highly active (optional logic) */}
                        <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary animate-pulse" />
                    </Link>
                </motion.div>
            ))}
        </motion.div>
    );
}
