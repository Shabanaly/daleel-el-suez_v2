'use client';

import SectionHeader from '@/components/ui/SectionHeader';
import { Flame } from 'lucide-react';
import { Place } from '@/lib/types/places';
import { PulsePlaceCard } from './PulsePlaceCard';

interface CommunityPulseProps {
    places: Place[];
}

export default function CommunityPulse({ places }: CommunityPulseProps) {
    if (!places || places.length === 0) return null;

    return (
        <section className="w-full max-w-7xl mx-auto px-4 pt-8 pb-8 md:pt-16 md:pb-16 relative overflow-hidden">
            {/* Ambient Background Decor */}
            <div className="absolute inset-0 bg-primary/2 dark:bg-primary/5 -skew-y-3 pointer-events-none transform origin-left rounded-[48px]" />
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />

            <SectionHeader
                title="نبض المجتمع"
                subtitle="الأماكن التي يعلو النقاش حولها وتتصدر مراجعات السوايسة خلال الأسبوع."
                icon={Flame}
                href="/places"
                viewAllText="استكشف المزيد"
            />

            <div className="flex overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 gap-6 md:gap-8 pb-10 relative z-10">
                {places.map((place, idx) => (
                    <PulsePlaceCard 
                        key={place.id} 
                        place={place} 
                        index={idx} 
                        className="min-w-[280px] md:min-w-0 flex-1"
                    />
                ))}
            </div>
        </section>
    );
}
