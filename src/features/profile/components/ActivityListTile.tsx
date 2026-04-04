'use client';

import { motion } from 'framer-motion';
import { Star, MapPin, MessageSquare, FileText, Clock, ChevronLeft } from 'lucide-react';
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

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'review': return 'تقييم';
            case 'place': return 'إضافة مكان';
            case 'post': return 'منشور';
            case 'comment': return 'تعليق';
            default: return 'نشاط';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative"
        >
            <Link 
                href={activity.link}
                className="flex items-center gap-3 md:gap-4 p-4 bg-surface hover:bg-elevated border border-border-subtle hover:border-primary/20 rounded-3xl transition-all duration-300"
            >
                {/* Image or Icon Section */}
                <div className="shrink-0 relative">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden flex items-center justify-center bg-background border border-border-subtle group-hover:scale-105 transition-transform duration-300">
                        {activity.image ? (
                            <Image 
                                src={activity.image} 
                                alt={activity.title} 
                                width={64} 
                                height={64} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="scale-110">
                                {getIconForType(activity.type)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-wider
                            ${activity.type === 'review' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 
                              activity.type === 'place' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                              activity.type === 'post' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                              'bg-purple-500/10 text-purple-600 border-purple-500/20'}
                        `}>
                            {getTypeLabel(activity.type)}
                        </span>
                        <span className="text-[10px] text-text-muted font-bold opacity-50">•</span>
                        <span className="text-[10px] text-text-muted font-bold">
                            {new Date(activity.date).toLocaleDateString('ar-EG', { 
                                month: 'short', 
                                day: 'numeric' 
                            })}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm md:text-base font-black text-text-primary truncate transition-colors group-hover:text-primary">
                            {activity.title}
                        </h4>
                        {activity.rating && (
                            <div className="flex items-center gap-0.5 bg-amber-500/10 px-1.5 py-0.5 rounded-lg text-amber-600 text-[10px] font-black border border-amber-500/20">
                                <Star className="w-3 h-3 fill-current" />
                                {activity.rating}
                            </div>
                        )}
                    </div>

                    <p className="text-xs md:text-sm text-text-muted font-medium line-clamp-1 leading-relaxed opacity-80">
                        {activity.description}
                    </p>
                </div>

                {/* Actions Section */}
                <div className="flex items-center justify-center w-10 h-10 rounded-xl text-text-muted group-hover:text-primary transition-all group-hover:translate-x-[-4px]">
                    <ChevronLeft className="w-5 h-5" />
                </div>
            </Link>
        </motion.div>
    );
}
