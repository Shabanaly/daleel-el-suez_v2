'use client';

import { Eye, Heart, Star, MessageSquare } from 'lucide-react';
import { Place } from '@/features/places/types';
import { motion } from 'framer-motion';

interface BusinessStatsProps {
    place: Place;
}

export function BusinessStats({ place }: BusinessStatsProps) {
    const stats = [
        {
            id: 'views',
            label: 'إجمالي المشاهدات',
            value: place.viewsCount || 0,
            icon: <Eye className="w-6 h-6 text-blue-500" />,
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20'
        },
        {
            id: 'favorites',
            label: 'الإضافات للمفضلة',
            value: place.favoritesCount || 0,
            icon: <Heart className="w-6 h-6 text-rose-500" />,
            bg: 'bg-rose-500/10',
            border: 'border-rose-500/20'
        },
        {
            id: 'rating',
            label: 'متوسط التقييم',
            value: place.rating || 0,
            icon: <Star className="w-6 h-6 text-amber-500" />,
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20'
        },
        {
            id: 'reviews',
            label: 'عدد المراجعات',
            value: place.reviews || 0,
            icon: <MessageSquare className="w-6 h-6 text-emerald-500" />,
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20'
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-surface p-5 rounded-3xl border border-border-subtle flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}
                >
                    <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full ${stat.bg} blur-2xl group-hover:scale-150 transition-transform duration-500 opacity-50`} />
                    
                    <div className={`w-12 h-12 rounded-2xl ${stat.bg} border ${stat.border} flex items-center justify-center relative z-10`}>
                        {stat.icon}
                    </div>
                    
                    <div className="text-center relative z-10">
                        <div className="text-2xl font-black text-text-primary mb-1">
                            {stat.value}
                        </div>
                        <div className="text-xs font-bold text-text-muted">
                            {stat.label}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
