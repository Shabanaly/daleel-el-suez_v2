'use client';

import { Star, MapPin, CheckCircle2, Clock, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Place } from '@/lib/types/places';

interface PlaceCardProps {
    place: Place;
    index: number;
}

export function PlaceCard({ place, index }: PlaceCardProps) {
    // 🧠 Mock "Open Now" logic for demonstration
    const isOpen = place.openHours !== '24 ساعة' ? true : true; // In a real app, this would check current time

    return (
        <Link href={`/places/${place.id}`}>
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-surface rounded-[44px] overflow-hidden flex flex-col group shadow-xl shadow-black/5 border border-border-subtle/50 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500"
            >
                {/* Image Area */}
                <div className="relative h-56 overflow-hidden bg-muted">
                    {place.imageUrl ? (
                        <Image
                            src={place.imageUrl}
                            alt={place.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary-500/10 to-accent/10">
                            <span className="text-4xl opacity-20">📸</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Category badge */}
                    <div className="absolute top-5 right-5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
                        {place.category}
                    </div>

                    {/* Verified Badge */}
                    {place.isVerified && (
                        <div className="absolute top-5 left-5 w-10 h-10 rounded-full bg-secondary-500 flex items-center justify-center text-white shadow-lg shadow-secondary-500/30 border border-white/20">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute bottom-5 right-5 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold">
                        <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                        <span>{isOpen ? 'مفتوح الآن' : 'مغلق'}</span>
                    </div>
                </div>

                {/* Info Area */}
                <div className="p-7 flex flex-col flex-1 relative">
                    {/* Location & Rating Header */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 text-primary-500 font-bold text-xs">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{place.area}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-500/5 text-primary-500 text-xs font-black">
                            <Star className="w-3.5 h-3.5 fill-primary-500" />
                            <span>{place.rating}</span>
                        </div>
                    </div>

                    <h3 className="text-2xl font-black text-text-primary mb-3 group-hover:text-primary-500 transition-colors line-clamp-1 tracking-tight">
                        {place.name}
                    </h3>

                    <p className="text-text-muted text-sm line-clamp-2 mb-6 leading-relaxed opacity-80">
                        {place.description || 'اكتشف أفضل الخدمات والمنتجات المتاحة في مدينة السويس بأسعار تنافسية وجودة عالية.'}
                    </p>

                    {/* Footer Info */}
                    <div className="mt-auto pt-6 border-t border-border-subtle/30 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-text-muted text-[11px] font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{place.openHours}</span>
                        </div>
                        <button className="w-10 h-10 rounded-full bg-linear-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
                            <Phone className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
