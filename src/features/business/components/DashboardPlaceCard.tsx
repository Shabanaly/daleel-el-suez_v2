'use client';
import { memo } from 'react';

import { MapPin, Star, Eye } from 'lucide-react';
import { Place } from '@/features/places/types';
import { motion } from 'framer-motion';
import { SafeImage } from '@/components/common/SafeImage';
import CustomLink from '@/components/customLink/customLink';

interface DashboardPlaceCardProps {
    place: Place;
}

export const DashboardPlaceCard = memo(function DashboardPlaceCard({ place }: DashboardPlaceCardProps) {
    const isOpen = place.openHours !== 'مغلق' && place.openHours !== 'مغلق حالياً' && place.openHours !== 'قريباً';

    return (
        <CustomLink href={`/manage/${place.id}`} className="block h-full">
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface rounded-3xl overflow-hidden flex flex-col border border-border-subtle shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 h-full group relative cursor-pointer"
            >
                <div className="flex flex-col h-full">
                    {/* Image Container */}
                    <div className="relative aspect-4/3 overflow-hidden bg-muted">
                        <SafeImage
                            src={place.imageUrl || ''}
                            alt={place.name}
                            fill
                            className="transition-transform duration-700 group-hover:scale-110 object-cover"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/60 to-transparent opacity-80 pointer-events-none" />

                        {/* Top Right: Views Count */}
                        {place.viewsCount !== 0 && (
                            <div className="absolute top-4 right-4 z-10">
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface/80 backdrop-blur-md border border-white/20 text-text-muted text-[10px] font-black shadow-sm">
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>{place.viewsCount || 0}</span>
                                </div>
                            </div>
                        )}

                        {/* Bottom Right: Status badge */}
                        <div className={`absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-xl backdrop-blur-md border flex items-center gap-2 shadow-sm
                            ${isOpen
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}
                        >
                            <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.1)] ${isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span className="text-[10px] font-black tracking-wider">
                                {isOpen ? 'مفتوح الآن' : 'مغلق'}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 md:p-6 flex flex-col flex-1 text-right" dir="rtl">
                        <div className="flex items-center justify-between mb-4">
                            <span className="flex items-center gap-1.5 text-text-muted font-bold text-xs">
                                <MapPin className="w-4 h-4 text-primary/70" />
                                {place.area || 'السويس'}
                            </span>

                            {place.rating !== 0 && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-primary/5 text-primary border border-primary/10">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <span className="font-extrabold text-sm">{place.rating || 0}</span>
                                </div>
                            )}
                        </div>

                        <h3 className="text-lg md:text-xl font-black text-text-primary line-clamp-1 mb-2 group-hover:text-primary transition-colors duration-300">
                            {place.name}
                        </h3>

                        <p className="text-xs md:text-sm text-text-muted line-clamp-2 leading-relaxed opacity-70 font-medium">
                            {place.description || `انقر لإدارة وتعديل جميع بيانات ${place.name}`}
                        </p>
                    </div>
                </div>
            </motion.div>
        </CustomLink>
    );
});
