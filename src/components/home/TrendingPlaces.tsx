'use client';

import Link from 'next/link';
import { MapPin, Star, Flame, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { PlaceCard } from '@/app/places/_components/PlaceCard';
import { Place } from '@/lib/types/places';

interface TrendingPlacesProps {
    places: Place[];
}

export default function TrendingPlaces({ places }: TrendingPlacesProps) {
    return (
        <section className="w-full max-w-5xl mx-auto px-4 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-1/4 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/5 blur-[120px] pointer-events-none" />

            <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 glow-primary relative group overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <Flame className="w-6 h-6 text-primary relative z-10" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-4xl font-black text-text-primary tracking-tight">الاكثر رواجاَ</h2>
                        <p className="text-text-muted font-bold text-xs md:text-sm mt-1 opacity-70">الاعلي تقييماَ والاكثر رواجاَ</p>
                    </div>
                </div>
                <Link href="/places?sort=trending" className="group flex items-center gap-2 px-4 py-2 rounded-full border border-border-subtle hover:border-primary/30 hover:bg-primary/5 transition-all duration-300">
                    <span className="text-xs md:text-sm font-black text-text-muted group-hover:text-primary">عرض الكل</span>
                    <ChevronLeft className="w-4 h-4 text-text-muted group-hover:text-primary transition-transform group-hover:-translate-x-1" />
                </Link>
            </div>

            <div className="flex overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 gap-6 md:gap-8 pb-10">
                {places.slice(0, 5).map((place, idx) => (
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
        </section>
    );
}
