'use client';

import { Place } from '@/lib/types/places';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PlaceCard } from '@/app/places/_components/PlaceCard';
import { motion } from 'framer-motion';

interface CategoryHighlightProps {
    data: {
        category: {
            id: number;
            name: string;
            icon: string;
        };
        places: Place[];
    } | null;
}

export default function CategoryHighlight({ data }: CategoryHighlightProps) {
    if (!data || data.places.length === 0) return null;

    const { category, places } = data;

    return (
        <section className="w-full bg-surface relative py-16">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-linear-to-b from-background/50 to-surface pointer-events-none" />

            <div className="w-full max-w-7xl mx-auto px-4 relative">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl" aria-hidden="true">{category.icon}</span>
                            <h2 className="text-3xl md:text-4xl font-black text-text-primary">
                                اكتشف {category.name}
                            </h2>
                        </div>
                        <p className="text-text-muted text-lg max-w-2xl">
                            أفضل وأشهر الأماكن في تصنيف {category.name} داخل السويس. تم اختيار هذا التصنيف خصيصاً لك اليوم.
                        </p>
                    </div>

                    <Link
                        href={`/places?category=${encodeURIComponent(category.name)}`}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary/10 text-primary font-bold hover:bg-primary hover:text-white transition-all group shrink-0"
                    >
                        عرض كل {category.name}
                        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    </Link>
                </div>

                <div className="flex overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 gap-6 md:gap-8 pb-10">
                    {places.map((place, idx) => (
                        <motion.div
                            key={place.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="min-w-[280px] md:min-w-0 flex-1"
                        >
                            <PlaceCard place={place} index={idx} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
