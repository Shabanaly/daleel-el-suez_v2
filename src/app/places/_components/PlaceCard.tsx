'use client';

import { Star, MapPin, Eye, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Place } from '@/lib/types/places';
import { FavoriteButton } from '@/components/common/FavoriteButton';

interface PlaceCardProps {
  place: Place;
  index: number;
}

export function PlaceCard({ place, index }: PlaceCardProps) {
  const isOpen = place.openHours !== 'مغلق';

  return (
    <div className="relative group h-full">
      <Link href={`/places/${encodeURIComponent(place.slug)}`}>
        <motion.div
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.03 }}
          whileHover={{ y: -4 }}
          className="bg-surface rounded-2xl overflow-hidden flex flex-col border border-border-subtle shadow-sm hover:shadow-xl transition-all duration-300 h-full underline-none"
        >
          {/* Image Container */}
          <div className="relative aspect-4/3 overflow-hidden bg-muted">
            {place.imageUrl ? (
              <Image
                src={place.imageUrl}
                alt={place.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl opacity-30 bg-primary/5">
                📸
              </div>
            )}

            {/* Gradient Overlay for better legibility of bottom badges */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/50 to-transparent opacity-60 pointer-events-none" />

            {/* Top Right: Views Count */}
            {place.viewsCount !== 0 && (
              <div className="absolute top-3 right-3 z-10">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface/80 backdrop-blur-md border border-white/20 text-text-muted text-[10px] font-black shadow-sm">
                  <Eye className="w-3 h-3" />
                  <span>{place.viewsCount}</span>
                </div>
              </div>
            )}

            {/* Bottom Right: Status badge */}
            <div className={`absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-full backdrop-blur-md border flex items-center gap-1.5 shadow-sm
                ${isOpen
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className="text-[10px] font-black uppercase tracking-wider">
                {isOpen ? 'مفتوح الآن' : 'مغلق'}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 md:p-5 flex flex-col flex-1 text-right" dir="rtl">
            <div className="flex items-center justify-between mb-3 text-[10px] md:text-xs">
              <span className="flex items-center gap-1 text-text-muted font-bold">
                <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary/70" />
                {place.area}
              </span>

              {place.rating !== 0 && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/5 text-primary border border-primary/10">
                  <Star className="w-3 h-3 md:w-3.5 md:h-3.5 fill-current" />
                  <span className="font-black">{place.rating}</span>
                  <span className="text-[9px] md:text-[10px] opacity-60 font-medium">({place.reviews || 0})</span>
                </div>
              )}
            </div>

            <h3 className="text-base md:text-lg font-black text-text-primary line-clamp-1 mb-2 group-hover:text-primary transition-colors duration-300">
              {place.name}
            </h3>

            <p className="text-xs md:text-sm text-text-muted line-clamp-2 leading-relaxed opacity-80 min-h-[32px] md:min-h-[40px]">
              {place.description || `أفضل الخدمات المتاحة في ${place.area}. اكتشف المزيد من التفاصيل والتقييمات.`}
            </p>
          </div>
        </motion.div>
      </Link>

      {/* Top Left: Favorite Button - Floating */}
      <div className="absolute top-3 left-3 z-20">
        <FavoriteButton
          itemId={place.id}
          itemType="place"
          size="sm"
          className="shadow-xl bg-surface/80 backdrop-blur-md border border-white/20 hover:scale-110 active:scale-95 transition-all"
        />
      </div>
    </div>
  );
}
