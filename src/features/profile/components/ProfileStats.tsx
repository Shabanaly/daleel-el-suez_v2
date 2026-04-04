'use client';

import { motion } from 'framer-motion';
import { Star, MapPin, MessageSquare } from 'lucide-react';

interface ProfileStatsProps {
    stats: {
        reviewsCount: number;
        placesCount: number;
        postsCount: number;
    };
}

export function ProfileStats({ stats }: ProfileStatsProps) {
    const statItems = [
        {
            id: 'reviews',
            label: 'تقييمات',
            value: stats.reviewsCount,
            icon: <Star className="w-5 h-5 md:w-6 md:h-6" />,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20'
        },
        {
            id: 'places',
            label: 'أماكن مضافة',
            value: stats.placesCount,
            icon: <MapPin className="w-5 h-5 md:w-6 md:h-6" />,
            color: 'text-primary',
            bg: 'bg-primary/10',
            border: 'border-primary/20'
        },
        {
            id: 'posts',
            label: 'مشاركات',
            value: stats.postsCount,
            icon: <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />,
            color: 'text-accent',
            bg: 'bg-accent/10',
            border: 'border-accent/20'
        }
    ];

    return (
        <div className="w-full">
            {/* Compact Grid Design (Desktop & Mobile) */}
            <div className="grid grid-cols-3 gap-3 md:gap-6">
                {statItems.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative flex flex-col items-center md:items-start md:flex-row md:gap-4 p-3 md:p-5 bg-surface border border-border-subtle rounded-3xl hover:bg-elevated hover:border-primary/20 hover:shadow-lg transition-all duration-300 overflow-hidden"
                    >
                        {/* Status Icon with background */}
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shrink-0 ${item.bg} ${item.color} group-hover:scale-105 transition-transform duration-300 shadow-xs`}>
                            {item.icon}
                        </div>

                        <div className="text-center md:text-right mt-2 md:mt-0 flex-1">
                            <h3 className="text-lg md:text-2xl font-black text-text-primary leading-tight">
                                {item.value}
                            </h3>
                            <p className="text-[9px] md:text-xs font-bold text-text-muted uppercase tracking-wide truncate">
                                {item.label}
                            </p>
                        </div>

                        {/* Subtle background glow on hover */}
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
