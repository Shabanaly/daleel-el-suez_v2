'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MarketCategory } from '@/lib/types/market';
import DynamicIcon from '@/components/common/DynamicIcon';
import { ShoppingBag, ChevronLeft } from 'lucide-react';

interface CategoriesGridProps {
    categories: MarketCategory[];
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function CategoriesGrid({ categories }: CategoriesGridProps) {
    const activeCategories = categories.filter(cat => cat.adCount > 0);

    return (
        <div className="min-h-screen bg-background pb-28 pt-24" dir="rtl">
            <div className="max-w-7xl mx-auto px-4">
                {/* ─── Header ─── */}
                <div className="mb-12 text-center md:text-start">
                    <h1 className="text-4xl md:text-5xl font-black text-text-primary mb-4 tracking-tight">
                        تصفح <span className="text-primary text-glow">جميع الأقسام</span>
                    </h1>
                    <p className="text-text-muted text-lg font-bold max-w-2xl">
                        اكتشف آلاف العروض والمنتجات المتاحة في سوق السويس المحلي، مقسمة حسب الفئات لتسهيل عملية الوصول لما تبحث عنه.
                    </p>
                </div>

                {/* ─── Grid ─── */}
                <motion.div 
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
                >
                    {activeCategories.map((cat) => (

                        <motion.div key={cat.id} variants={item}>
                            <Link 
                                href={`/market/category/${cat.slug}`}
                                className="group relative flex flex-col p-6 rounded-[32px] bg-surface border border-border-subtle hover:border-primary/50 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/10 overflow-hidden"
                            >
                                {/* Decorative Background Gradient */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                                
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                        <DynamicIcon 
                                            name={cat.icon || 'ShoppingBag'} 
                                            className="w-8 h-8 text-primary" 
                                            fallback={<ShoppingBag className="w-8 h-8 text-primary" />} 
                                        />
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-elevated border border-border-subtle flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                                        <ChevronLeft className="w-5 h-5 text-primary" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-text-primary group-hover:text-primary transition-colors">
                                        {cat.name}
                                    </h3>
                                    <p className="text-text-muted text-sm font-bold flex items-center gap-2">
                                        <span className="text-primary">{cat.adCount}</span>
                                        {cat.adCount === 1 ? 'إعلان متاح' : 'إعلانات متاحة'}
                                    </p>
                                </div>

                                {/* Hover Glow Effect */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-l from-primary/0 via-primary/50 to-primary/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />

                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {activeCategories.length === 0 && (

                    <div className="py-20 text-center bg-surface rounded-[40px] border border-dashed border-border-subtle">
                        <ShoppingBag className="w-16 h-16 text-text-muted/20 mx-auto mb-4" />
                        <p className="text-text-muted font-bold text-lg">لا توجد أقسام حالياً.</p>
                    </div>
                )}
            </div>
            
            <style jsx global>{`
                .text-glow {
                    text-shadow: 0 0 20px rgba(var(--primary-rgb), 0.3);
                }
            `}</style>
        </div>
    );
}
