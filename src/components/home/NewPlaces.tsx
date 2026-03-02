'use client';

import SectionHeader from '@/components/ui/SectionHeader';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { PlaceCard } from '@/app/places/_components/PlaceCard';
import { Place } from '@/lib/types/places';

interface NewPlacesProps {
    places: Place[];
}

export default function NewPlaces({ places }: NewPlacesProps) {
    return (
        <section className="w-full max-w-5xl mx-auto px-4 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-1/4 w-64 h-64 bg-primary/2 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/2 rounded-full blur-[120px] pointer-events-none" />

            <SectionHeader
                title="أماكن جديدة"
                subtitle="اكتشف أحدث الأماكن المضافة لدليل السويس"
                icon={Flame}
                href="/places?sort=newest"
            />

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
