'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Star, MapPin, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ActivityItem {
    id: string;
    type: 'review' | 'place' | 'post';
    title: string;
    description: string;
    date: string;
    link: string;
    image?: string;
    rating?: number;
    category?: string;
}

interface ProfileTabsProps {
    activities: ActivityItem[];
    reviews?: ActivityItem[];
    places?: ActivityItem[];
}

export function ProfileTabs({ activities, reviews = [], places = [] }: ProfileTabsProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'reviews' | 'places'>('all');

    const getDisplayActivities = () => {
        if (activeTab === 'all') return activities;
        if (activeTab === 'reviews') return reviews;
        if (activeTab === 'places') return places;
        return [];
    };

    const filteredActivities = getDisplayActivities();

    const getIconForType = (type: string) => {
        switch (type) {
            case 'review': return <Star className="w-4 h-4 text-amber-500" />;
            case 'place': return <MapPin className="w-4 h-4 text-primary" />;
            default: return <Activity className="w-4 h-4 text-accent" />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-12 pb-24">
            {/* Tabs Navigation */}
            <div className="flex items-center gap-2 md:gap-4 mb-8 overflow-x-auto pb-4 hide-scrollbar snap-x">
                {[
                    { id: 'all', label: 'النشاطات', icon: <Activity className="w-4 h-4" /> },
                    { id: 'reviews', label: 'التقييمات', icon: <Star className="w-4 h-4" /> },
                    { id: 'places', label: 'الأماكن', icon: <MapPin className="w-4 h-4" /> },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'all' | 'reviews' | 'places')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap snap-center transition-all ${activeTab === tab.id
                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                            : 'bg-surface text-text-muted hover:text-text-primary hover:bg-elevated border border-border-subtle'
                            }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Activities List */}
            <div className="relative">
                {/* Timeline Line */}
                <div className="absolute top-0 bottom-0 right-8 md:right-10 w-px bg-border-subtle dark:bg-border-subtle/50" />

                <AnimatePresence mode="popLayout">
                    {filteredActivities.length > 0 ? (
                        filteredActivities.map((activity) => (
                            <motion.div
                                key={activity.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="relative flex items-start gap-4 md:gap-6 mb-8 group"
                            >
                                {/* Timeline Indicator */}
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl bg-surface border border-border-subtle shadow-sm flex flex-col items-center justify-center p-2 group-hover:border-primary/30 group-hover:shadow-md transition-all text-center">
                                        <div className="mb-1">{getIconForType(activity.type)}</div>
                                        <span className="text-[10px] md:text-xs font-black text-text-muted">
                                            {new Date(activity.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Card */}
                                <Link href={activity.link} className="flex-1 bg-surface border border-border-subtle hover:border-primary/20 rounded-3xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 sm:items-center cursor-pointer group/card mt-1">
                                    {activity.image && (
                                        <div className="w-full sm:w-24 h-32 sm:h-24 rounded-2xl overflow-hidden shrink-0 relative border border-border-subtle">
                                            <Image
                                                src={activity.image}
                                                alt={activity.title}
                                                fill
                                                className="object-cover group-hover/card:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-sm md:text-base font-black text-text-primary group-hover/card:text-primary transition-colors">
                                                {activity.title}
                                            </h4>

                                            {activity.rating && (
                                                <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2 py-1 rounded-lg text-xs font-black border border-amber-500/20">
                                                    <Star className="w-3 h-3 fill-current" />
                                                    {activity.rating}
                                                </div>
                                            )}
                                            {activity.category && (
                                                <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-lg text-xs font-black border border-primary/20">
                                                    {activity.category}
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-xs md:text-sm text-text-muted font-medium line-clamp-2 leading-relaxed">
                                            {activity.description}
                                        </p>

                                        <div className="flex items-center gap-1 mt-3 text-[10px] md:text-xs text-text-muted/60 font-medium">
                                            <Clock className="w-3 h-3" />
                                            <span>
                                                {new Date(activity.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 bg-surface/50 border border-border-subtle/50 rounded-3xl ml-0 md:ml-10"
                        >
                            <div className="w-16 h-16 bg-elevated rounded-full flex items-center justify-center mx-auto mb-4 border border-border-subtle">
                                <Activity className="w-8 h-8 text-text-muted/30" />
                            </div>
                            <h4 className="text-lg font-black text-text-primary mb-2">لا توجد نشاطات بعد</h4>
                            <p className="text-sm text-text-muted font-medium">يبدو أن {activeTab === 'all' ? 'النشاط' : (activeTab === 'reviews' ? 'التقييمات' : 'الأماكن')} فارغ حالياً.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
