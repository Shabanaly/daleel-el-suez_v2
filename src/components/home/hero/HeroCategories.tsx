'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

interface HeroCategory {
    name: string;
    icon: string;
    href: string;
}

interface HeroCategoriesProps {
    categories: HeroCategory[];
}

export default function HeroCategories({ categories }: HeroCategoriesProps) {
    if (!categories.length) return null;

    return (
        <div className="w-full space-y-4">
            {/* Header with View All */}
            <div className="flex items-center justify-between px-1">
                <h3 className="text-[11px] font-black text-text-muted/40 uppercase tracking-widest">الأقسام الأكثر استخداماً</h3>
                <Link
                    href="/categories"
                    className="flex items-center gap-1 py-1 px-3 rounded-full bg-primary/5 border border-primary/10 text-[11px] font-bold text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                >
                    عرض الكل
                    <ChevronLeft className="w-3.5 h-3.5" />
                </Link>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="w-full overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0"
            >
                <div className="flex items-center justify-start md:justify-center gap-3 md:gap-4 pb-2">
                    {categories.map((cat, idx) => (
                        <Link
                            key={idx}
                            href={cat.href}
                            className="flex flex-col items-center justify-center gap-1.5 md:gap-3 px-4 py-3 md:px-8 md:py-5 rounded-xl md:rounded-2xl bg-surface/40 backdrop-blur-md border border-border-subtle hover:border-primary/50 hover:bg-surface/80 hover:scale-105 active:scale-95 transition-all duration-300 min-w-[90px] md:min-w-[120px] group shadow-sm hover:shadow-xl hover:shadow-primary/5"
                        >
                            <span className="text-xl md:text-3xl grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500 transform-gpu">{cat.icon}</span>
                            <span className="text-[10px] md:text-sm font-bold text-text-muted group-hover:text-primary transition-colors">{cat.name}</span>
                        </Link>
                    ))}

                    {/* View All Card keeps for mobile convenience at the end of scroll */}
                    <Link
                        href="/categories"
                        className="flex flex-col items-center justify-center gap-1.5 md:gap-3 px-4 py-3 md:px-8 md:py-5 rounded-xl md:rounded-2xl bg-primary/10 backdrop-blur-md border border-primary/20 hover:border-primary/50 hover:bg-primary/20 hover:scale-105 active:scale-95 transition-all duration-300 min-w-[90px] md:min-w-[120px] group shadow-sm hover:shadow-xl hover:shadow-primary/5"
                    >
                        <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <span className="text-[10px] md:text-sm font-black text-primary">المزيد</span>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
