'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Category } from '@/lib/types/category';

interface CategoryGridProps {
    categories: Category[];
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.03 }
    }
};

const itemAnim = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1 }
};

export function CategoryGrid({ categories }: CategoryGridProps) {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-3 sm:grid-cols-4 gap-2 md:gap-4 lg:gap-5 pb-20 justify-center"
        >
            {categories.map((category) => (
                <motion.div key={category.id} variants={itemAnim}>
                    <Link
                        href={`/places?category=${encodeURIComponent(category.name)}`}
                        className="group relative flex flex-col items-center justify-center text-center px-4 py-3 md:px-8 md:py-5 rounded-xl md:rounded-2xl bg-surface/40 backdrop-blur-md border border-border-subtle hover:border-primary/50 hover:bg-surface/80 hover:scale-105 active:scale-95 transition-all duration-300 w-full min-h-[80px] md:min-h-[110px] shadow-sm hover:shadow-xl hover:shadow-primary/5 overflow-hidden"
                    >
                        <span className="text-xl md:text-3xl mb-1.5 md:gap-3 group-hover:scale-110 transition-transform duration-500 transform-gpu">
                            {category.icon}
                        </span>
                        <div className="space-y-0.5">
                            <h3 className="text-[10px] md:text-sm font-bold text-text-muted group-hover:text-primary transition-colors line-clamp-1">
                                {category.name}
                            </h3>
                            {category.count !== undefined && (
                                <p className="sr-only">{category.count} مكان</p>
                            )}
                        </div>
                        {/* Reflection effect */}
                        <div className="absolute top-0 -left-full w-full h-full bg-linear-to-r from-transparent via-white/5 to-transparent skew-x-[-25deg] group-hover:left-[150%] transition-all duration-1000 ease-in-out pointer-events-none" />
                    </Link>
                </motion.div>
            ))}
        </motion.div>
    );
}
