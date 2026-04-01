'use client';

import { Place } from '@/lib/types/places';
import * as LucideIcons from 'lucide-react';
import { LucideIcon, HelpCircle } from 'lucide-react';
import { PlaceCard } from '@/app/places/_components/PlaceCard';
import SectionHeader from '@/components/ui/SectionHeader';

interface CategoryHighlightProps {
    data: {
        category: {
            id: number;
            name: string;
            icon: string;
            slug: string;
        };
        places: Place[];
    } | null;
}

export default function CategoryHighlight({ data }: CategoryHighlightProps) {
    if (!data || data.places.length === 0) return null;

    const { category, places } = data;

    // Dynamically get the Icon component from Lucide
    const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[category.icon] || HelpCircle;

    return (
        <section className="w-full bg-surface relative pt-0 pb-8 md:pt-0 md:pb-16">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-linear-to-b from-background/50 to-surface pointer-events-none" />

            <div className="w-full max-w-7xl mx-auto px-4 relative">
                <SectionHeader 
                    title={`اكتشف ${category.name}`}
                    subtitle={`أفضل وأشهر الأماكن في تصنيف ${category.name} داخل السويس. ترشيح ذكي يتماشى مع الوقت الحالي خصيصاً لك.`}
                    icon={IconComponent}
                    href={`/places?category=${encodeURIComponent(category.name)}`}
                    viewAllText={`عرض كل ${category.name}`}
                />

                <div className="flex overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 gap-6 md:gap-8 pb-10">
                    {places.slice(0, 8).map((place, idx) => (
                        <PlaceCard 
                            key={place.id} 
                            place={place} 
                            index={idx} 
                            className="min-w-[280px] md:min-w-0 flex-1"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
