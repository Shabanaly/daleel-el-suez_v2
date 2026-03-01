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
        <div className="max-w-7xl mx-auto px-4 md:px-12 mb-10 text-center">
            <div className="grid grid-cols-3 gap-3 md:gap-6">
                {statItems.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + (index * 0.1) }}
                        className={`flex flex-col items-center justify-center p-4 md:p-6 rounded-3xl bg-surface border ${item.border} shadow-sm group hover:shadow-md transition-all`}
                    >
                        <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-3 md:mb-4 ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                            {item.icon}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-text-primary mb-1">
                            {item.value}
                        </h3>
                        <p className="text-xs md:text-sm font-bold text-text-muted capitalize">
                            {item.label}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
