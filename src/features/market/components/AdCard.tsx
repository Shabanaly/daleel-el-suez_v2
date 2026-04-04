'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { MarketAd } from '@/features/market/types';

import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import Image from 'next/image';
import { SafeImage } from '@/components/common/SafeImage';
import ConditionBadge from './ConditionBadge';
import PriceTag from './PriceTag';
import SellerInfo from './SellerInfo';

interface AdCardProps {
    ad: MarketAd;
    priority?: boolean;
}

export default function AdCard({ ad, priority = false }: AdCardProps) {
    const formattedTime = formatDistanceToNow(new Date(ad.created_at), { 
        addSuffix: true, 
        locale: ar 
    });

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="group relative bg-surface border border-border-subtle rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full underline-none"
            dir="rtl"
        >
            {/* Image Section */}
            <div className="relative aspect-4/3 overflow-hidden bg-muted flex items-center justify-center">
                {ad.images && ad.images.length > 0 ? (
                    <SafeImage
                        src={ad.images[0]}
                        alt={ad.title}
                        fill
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-primary/5 flex items-center justify-center p-8 opacity-20 grayscale saturate-0 mix-blend-multiply">
                        <Image src="/favicon-circular.ico" alt="دليل السويس" width={64} height={64} className="w-16 h-16 object-contain" />
                    </div>
                )}
                
                {/* Gradient Overlay for better legibility (similar to PlaceCard) */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/50 to-transparent opacity-40 pointer-events-none" />

                {/* Badges Overlay */}
                <div className="absolute top-3 right-3 z-10">
                    <ConditionBadge condition={ad.condition} />
                </div>
                
                {priority && (
                    <div className="absolute bottom-3 right-3 z-10">
                        <div className="px-2.5 py-1 rounded-full bg-yellow-500/10 backdrop-blur-md border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-[10px] font-black shadow-sm">
                            مميز
                        </div>
                    </div>
                )}
            </div>

            {/* Favorite Button (Absolute Top Left) */}
            <div className="absolute top-3 left-3 z-20">
                <FavoriteButton
                    itemId={ad.id}
                    itemType="listing"
                    size="sm"
                    className="shadow-xl bg-surface/80 backdrop-blur-md border border-white/20 hover:scale-110 active:scale-95 transition-all"
                />
            </div>

            {/* Content Section */}
            <div className="p-4 md:p-5 flex flex-col flex-1 gap-2 text-right">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <PriceTag price={ad.price} size="md" />
                        {ad.is_negotiable && (
                            <span className="px-2 py-0.5 rounded-lg bg-green-500/10 text-green-600 text-[10px] font-black border border-green-500/20">
                                تفاوض
                            </span>
                        )}
                    </div>
                    <h3 className="text-base md:text-lg font-black text-text-primary leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-300">
                        {ad.title}
                    </h3>
                </div>

                <div className="mt-auto space-y-3">
                    <div className="flex flex-col gap-1.5 opacity-80">
                        <div className="flex items-center gap-1.5 text-text-muted">
                            <MapPin className="w-3.5 h-3.5 text-primary/70" />
                            <span className="text-xs font-bold">{ad.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-text-muted">
                            <Clock className="w-3.5 h-3.5 text-primary/70" />
                            <span className="text-xs font-bold">{formattedTime}</span>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-border-subtle/50 flex items-center justify-between">
                        <SellerInfo name={ad.seller_name} photo={ad.seller_photo} />
                        <span className="text-[10px] text-text-muted/40 font-bold">{ad.category_name}</span>
                    </div>
                </div>
            </div>

            {/* Click Area */}
            <Link href={`/market/${ad.slug}`} className="absolute inset-0 z-10">
                <span className="sr-only">مشاهدة {ad.title}</span>
            </Link>
        </motion.div>
    );
}
