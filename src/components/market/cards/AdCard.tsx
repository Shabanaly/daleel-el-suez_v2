'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { MarketAd } from '@/lib/types/market';
import PriceTag from '../ui/PriceTag';
import ConditionBadge from '../ui/ConditionBadge';
import SellerInfo from '../ui/SellerInfo';
import FavoriteButton from '../ui/FavoriteButton';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

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
            whileHover={{ y: -4 }}
            className="group relative bg-surface border border-border-subtle rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300 flex flex-col h-full"
            dir="rtl"
        >
            {/* Image Section */}
            <div className="relative aspect-4/3 overflow-hidden">
                <img
                    src={ad.images[0] || '/images/placeholder-ad.jpg'}
                    alt={ad.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Badges Overlay */}
                <div className="absolute top-3 right-3 left-3 flex justify-between items-start pointer-events-none">
                    <div className="pointer-events-auto">
                        <ConditionBadge condition={ad.condition} />
                    </div>
                    <div className="pointer-events-auto">
                        <FavoriteButton adId={ad.id} />
                    </div>
                </div>
                
                {/* View Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="bg-white/90 dark:bg-black/80 backdrop-blur-md text-text-primary px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                        مشاهدة التفاصيل
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-1 gap-3">
                <div className="flex flex-col gap-1">
                    <PriceTag price={ad.price} size="md" />
                    <h3 className="text-sm font-bold text-text-primary leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {ad.title}
                    </h3>
                </div>

                <div className="mt-auto space-y-3">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-text-muted">
                            <MapPin className="w-3 h-3" />
                            <span className="text-[11px] font-medium">{ad.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-text-muted">
                            <Clock className="w-3 h-3" />
                            <span className="text-[11px] font-medium">{formattedTime}</span>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-border-subtle/50 flex items-center justify-between">
                        <SellerInfo name={ad.seller_name} photo={ad.seller_photo} />
                        {priority && (
                            <span className="text-[10px] bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 px-2 py-0.5 rounded-md font-bold">
                                إعلان مميز
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Click Area */}
            <Link href={`/market/${ad.id}`} className="absolute inset-0 z-10">
                <span className="sr-only">مشاهدة {ad.title}</span>
            </Link>
        </motion.div>
    );
}
