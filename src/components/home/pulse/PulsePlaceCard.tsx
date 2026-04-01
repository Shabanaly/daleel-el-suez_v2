import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, MessageSquareHeart } from 'lucide-react';
import { Place } from '@/lib/types/places';
import { motion } from 'framer-motion';

interface PulsePlaceCardProps {
    place: Place;
    index: number;
    className?: string;
}

export function PulsePlaceCard({ place, index, className = '' }: PulsePlaceCardProps) {
    const pulseData = place.pulseContext;
    const isHot = pulseData && pulseData.newReviews >= 3 && pulseData.avgRating >= 4.0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className={`group relative bg-surface rounded-3xl overflow-hidden border border-border-subtle shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block ${className}`}
        >
            <Link href={`/places/${place.slug}`} className="block h-full">
                {/* ── Visual Context (Image & Badges) ── */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden">
                    {/* Hot Trending Badge */}
                    {isHot && (
                        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-[10px] font-black rounded-full shadow-[0_4px_12px_rgba(239,68,68,0.4)] backdrop-blur-md animate-pulse">
                            🔥 تريند الأسبوع
                        </div>
                    )}

                    <Image
                        src={place.imageUrl || '/images/placeholder-place.jpg'}
                        alt={place.name}
                        fill
                        className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent opacity-80" />
                    
                    {/* Category Label */}
                    <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-surface/80 backdrop-blur-md text-text-primary text-[10px] font-bold rounded-full border border-border-subtle">
                        {place.category}
                    </div>

                    {/* Meta Footer overlay */}
                    <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-end">
                        <div className="flex items-center gap-1.5 text-white/90">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs font-medium truncate max-w-[140px] drop-shadow-md">{place.district}</span>
                        </div>
                        
                        <div className="px-2 py-1 bg-accent text-white text-xs font-black rounded-lg shadow-lg flex items-center gap-1">
                            {place.rating.toFixed(1)} <Star className="w-3.5 h-3.5 fill-current" />
                        </div>
                    </div>
                </div>

                {/* ── Pulse Details ── */}
                <div className="p-5 flex flex-col gap-3 relative">
                    <h3 className="text-lg font-black text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                        {place.name}
                    </h3>
                    
                    {pulseData && (
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/10">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary">
                                <MessageSquareHeart className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-text-secondary">
                                    تفاعلات هذا الأسبوع
                                </span>
                                <span className="text-sm font-black text-primary">
                                    {pulseData.newReviews} تقييم جديد
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}
