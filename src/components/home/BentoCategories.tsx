'use client';

import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BentoCategories({ categories }: { categories: any[] }) {
    if (!categories || categories.length === 0) return null;

    // We want a more diverse grid. We'll pick 6 items to show in the bento.
    const displayCategories = categories.slice(0, 6);

    return (
        <section className="w-full max-w-5xl mx-auto px-4 py-20 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/2 opacity-20 blur-[120px] pointer-events-none" />

            <div className="flex items-center justify-between mb-12 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 glow-primary relative group overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <LayoutGrid className="w-6 h-6 text-primary relative z-10" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-4xl font-black text-text-primary tracking-tight">استكشف الأقسام</h2>
                        <p className="text-text-muted font-bold text-xs md:text-sm mt-1 opacity-70">كل ما تبحث عنه في السويس مقسم حسب اهتمامك</p>
                    </div>
                </div>
            </div>

            {/* Grid container - Hybrid Bento Layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 auto-rows-[140px] md:auto-rows-[180px] gap-4 md:gap-5 relative z-10">

                {/* 1. Large Feature Card */}
                {displayCategories[0] && (
                    <CategoryCard
                        item={displayCategories[0]}
                        className="col-span-2 row-span-2"
                        isLarge={true}
                    />
                )}

                {/* 2. Horizontal Wide Card */}
                {displayCategories[1] && (
                    <CategoryCard
                        item={displayCategories[1]}
                        className="col-span-2 row-span-1 md:col-span-2 lg:col-span-4"
                    />
                )}

                {/* 3. Standard Cards */}
                {displayCategories.slice(2, 6).map((cat, idx) => (
                    <CategoryCard
                        key={cat.id}
                        item={cat}
                        className={`col-span-1 row-span-1 ${idx === 3 ? 'hidden lg:block' : ''}`}
                    />
                ))}
            </div>
        </section>
    );
}

function CategoryCard({ item, className, isLarge = false }: { item: any, className: string, isLarge?: boolean }) {
    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={className}
        >
            <Link
                href={`/places?category=${encodeURIComponent(item.name)}`}
                className="block w-full h-full rounded-3xl glass-card border border-border-subtle/40 overflow-hidden relative group shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
            >
                {/* Dynamic Background Gradient */}
                <div className={`absolute inset-0 bg-linear-to-br ${item.color || 'from-primary/10 to-primary/5'} opacity-30 group-hover:opacity-60 transition-opacity duration-700`} />

                {/* Animated Inner Glow */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className={`relative h-full flex flex-col justify-between p-5 md:p-8 z-10 ${isLarge ? 'md:justify-end md:gap-4' : ''}`}>

                    <div className={`${isLarge ? 'absolute top-6 right-6 md:top-8 md:right-8 scale-150 md:scale-[2.5] origin-top-right' : 'scale-110 md:scale-125 origin-top-right'} transition-transform duration-500 group-hover:scale-110`}>
                        <span className="drop-shadow-2xl inline-block group-hover:rotate-12 transition-transform duration-500">
                            {item.icon}
                        </span>
                    </div>

                    <div className="mt-auto">
                        <h3 className={`font-black text-text-primary mb-1 group-hover:text-primary transition-colors leading-tight ${isLarge ? 'text-xl md:text-4xl mb-2' : 'text-sm md:text-xl'}`}>
                            {item.name}
                        </h3>
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-primary/40" />
                            <p className={`text-accent font-black tracking-tighter ${isLarge ? 'text-sm md:text-lg' : 'text-[10px] md:text-xs'}`}>
                                {item.count} مكان مرشح
                            </p>
                        </div>
                    </div>
                </div>

                {/* Glassy reflection effect */}
                <div className="absolute top-0 -left-full w-1/2 h-full bg-linear-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] group-hover:left-[150%] transition-all duration-1000 ease-in-out pointer-events-none" />
            </Link>
        </motion.div>
    );
}
