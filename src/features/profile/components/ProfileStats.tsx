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
            <div className="grid grid-cols-3 md:grid-cols-1 gap-4">
                {statItems.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + (index * 0.1) }}
                        className={`group relative flex flex-col md:flex-row items-center md:items-start md:gap-4 p-4 md:p-5 rounded-2xl bg-surface border border-border-subtle hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden text-right`}
                    >
                        {/* Background subtle glow on hover */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-bl from-transparent via-transparent to-primary/5`} />

                        <div className={`relative z-10 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 ${item.bg} ${item.color} group-hover:scale-105 transition-transform duration-300`}>
                            {item.icon}
                        </div>

                        <div className="relative z-10 text-center md:text-right mt-3 md:mt-0 flex-1">
                            <h3 className="text-xl md:text-2xl font-black text-text-primary leading-tight">
                                {item.value}
                            </h3>
                            <p className="text-[10px] md:text-xs font-black text-text-muted uppercase tracking-wider mt-0.5">
                                {item.label}
                            </p>
                        </div>

                        {/* Visual accent line purely for aesthetic */}
                        <div className={`absolute bottom-0 right-0 left-0 h-1 ${item.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
