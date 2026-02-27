'use client';

import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = [
    { id: 'restaurants', name: 'مطاعم', icon: '🍽️', count: '٢٤١+ مكان', color: 'from-orange-500/20 to-red-500/5' },
    { id: 'cafes', name: 'كافيهات', icon: '☕', count: '٨٩+ مكان', color: 'from-amber-500/20 to-yellow-500/5' },
    { id: 'supermarkets', name: 'سوبر ماركت', icon: '🛒', count: '١٢٤+ مكان', color: 'from-emerald-500/20 to-teal-500/5' },
    { id: 'pharmacies', name: 'صيدليات', icon: '💊', count: '٥٦+ مكان', color: 'from-cyan-500/20 to-teal-500/5' },
    { id: 'banks', name: 'بنوك', icon: '🏦', count: '٢١+ مكان', color: 'from-primary-600/20 to-primary-700/5' },
    { id: 'hospitals', name: 'مستشفيات', icon: '🏥', count: '١٤+ مكان', color: 'from-rose-500/20 to-pink-500/5' },
    { id: 'entertainment', name: 'ترفيه', icon: '🎡', count: '٣٥+ مكان', color: 'from-purple-500/20 to-fuchsia-500/5' },
    { id: 'services', name: 'خدمات', icon: '🔧', count: '١٢٨+ مكان', color: 'from-slate-400/20 to-slate-500/5' },
];

export default function BentoCategories() {
    return (
        <section className="w-full max-w-5xl mx-auto px-4 py-16">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary-600/10 flex items-center justify-center border border-primary-600/20 shadow-[0_0_15px_rgba(8,145,178,0.1)]">
                    <LayoutGrid className="w-5 h-5 text-primary-500" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-text-primary">تصفح الأقسام</h2>
            </div>

            {/* Grid container */}
            <div className="grid grid-cols-2 md:grid-cols-6 auto-rows-[120px] md:auto-rows-[160px] gap-3 md:gap-4">

                <CategoryCard
                    item={CATEGORIES[0]}
                    className="col-span-2 md:col-span-1 md:row-span-1 sm:col-span-3 sm:row-span-2 lg:col-span-2 lg:row-span-2 relative overflow-hidden group"
                    isLarge={true}
                />

                <CategoryCard item={CATEGORIES[1]} className="col-span-1 md:col-span-2 row-span-1" />
                <CategoryCard item={CATEGORIES[2]} className="col-span-1 md:col-span-2 row-span-1" />

                <CategoryCard item={CATEGORIES[3]} className="col-span-1 md:col-span-2 row-span-1" />
                <CategoryCard item={CATEGORIES[4]} className="col-span-1 md:col-span-2 row-span-1" />
            </div>
        </section>
    );
}

function CategoryCard({ item, className, isLarge = false }: { item: any, className: string, isLarge?: boolean }) {
    return (
        <motion.div
            whileHover={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={className}
        >
            <Link
                href={`/places?category=${item.id}`}
                className="block w-full h-full rounded-2xl md:rounded-3xl glass-card overflow-hidden relative group"
            >
                {/* Subtle Background Gradient */}
                <div className={`absolute inset-0 bg-linear-to-br ${item.color} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className={`relative h-full flex flex-col justify-between p-4 md:p-6 z-10 ${isLarge ? 'md:justify-end' : ''}`}>

                    <div className={`${isLarge ? 'md:absolute md:top-6 md:right-6' : ''}`}>
                        <span className={`drop-shadow-lg ${isLarge ? 'text-4xl md:text-6xl' : 'text-3xl md:text-4xl'}`}>
                            {item.icon}
                        </span>
                    </div>

                    <div className="mt-auto">
                        <h3 className={`font-bold text-text-primary mb-1 group-hover:text-primary-400 transition-colors ${isLarge ? 'text-lg md:text-3xl mb-2' : 'text-base md:text-xl'}`}>
                            {item.name}
                        </h3>
                        <p className={`text-accent font-medium ${isLarge ? 'text-sm md:text-base' : 'text-xs md:text-sm'}`}>
                            {item.count}
                        </p>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
