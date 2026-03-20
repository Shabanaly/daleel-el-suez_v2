'use client';

import { motion } from 'framer-motion';
import { Star, MapPin, MessageSquare, FileText, ChevronLeft, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export interface ActivityItem {
    id: string;
    type: 'review' | 'place' | 'post' | 'comment';
    title: string;
    description: string;
    date: string;
    link: string;
    image?: string;
    rating?: number;
    category?: string;
}

interface ActivityListTileProps {
    activity: ActivityItem;
    index?: number;
}

export function ActivityListTile({ activity, index = 0 }: ActivityListTileProps) {
    const getIconForType = (type: string) => {
        switch (type) {
            case 'review': return <Star className="w-5 h-5 text-amber-500" />;
            case 'place': return <MapPin className="w-5 h-5 text-blue-500" />;
            case 'post': return <FileText className="w-5 h-5 text-green-500" />;
            case 'comment': return <MessageSquare className="w-5 h-5 text-purple-500" />;
            default: return <Clock className="w-5 h-5 text-slate-500" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link 
                href={activity.link}
                className="flex items-center gap-4 p-4 bg-surface hover:bg-elevated border border-border-subtle rounded-2xl transition-all group"
            >
                {/* Image or Icon */}
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-background border border-border-subtle group-hover:border-primary/20 transition-colors">
                    {activity.image ? (
                        <Image 
                            src={activity.image} 
                            alt={activity.title} 
                            width={56} 
                            height={56} 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        getIconForType(activity.type)
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm md:text-base font-bold text-text-primary truncate">
                            {activity.title}
                        </h4>
                        {activity.rating && (
                            <div className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
                                <Star className="w-3 h-3 fill-current" />
                                {activity.rating}
                            </div>
                        )}
                    </div>
                    <p className="text-xs md:text-sm text-text-muted truncate">
                        {activity.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] md:text-xs text-text-muted font-medium">
                            {new Date(activity.date).toLocaleDateString('ar-EG', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                            })}
                        </span>
                    </div>
                </div>

                {/* Chevron */}
                <ChevronLeft className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors group-hover:translate-x-[-4px]" />
            </Link>
        </motion.div>
    );
}
