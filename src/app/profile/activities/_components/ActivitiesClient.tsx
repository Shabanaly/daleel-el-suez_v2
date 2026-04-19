'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Star, MapPin, FileText, MessageSquare, Search, Filter } from 'lucide-react';
import { ActivityListTile, ActivityItem } from '@/features/profile/components/ActivityListTile';
import CustomLink from '@/components/customLink/customLink';
import { AppBar } from '@/components/ui/AppBar';
import { ContextMenu, ContextMenuItem } from '@/components/ui/ContextMenu';
import { ROUTES } from '@/constants';

interface ActivitiesClientProps {
    activities: ActivityItem[];
}

type TabType = 'all' | 'review' | 'place' | 'post' | 'comment';

// ── Sub-components moved outside render ──────────────────
const FilterTrigger = ({ isMobile = false, label }: { isMobile?: boolean; label: string }) => (
    <button
        className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${isMobile ? 'border-border-subtle bg-surface' : 'bg-surface border-border-subtle hover:border-primary/50'
            }`}
    >
        <Filter className="w-4 h-4 text-primary" />
        <span className="text-sm font-black">{label}</span>
    </button>
);

export function ActivitiesClient({ activities }: ActivitiesClientProps) {
    const [activeTab, setActiveTab] = useState<TabType>('all');

    const tabs = [
        { id: 'all', label: 'الكل', icon: <Activity className="w-4 h-4" /> },
        { id: 'review', label: 'تقييمات', icon: <Star className="w-4 h-4" /> },
        { id: 'place', label: 'أماكن', icon: <MapPin className="w-4 h-4" /> },
        { id: 'post', label: 'منشورات', icon: <FileText className="w-4 h-4" /> },
        { id: 'comment', label: 'تعليقات', icon: <MessageSquare className="w-4 h-4" /> },
    ];

    const filteredActivities = activeTab === 'all'
        ? activities
        : activities.filter(a => a.type === activeTab);

    const filterItems: ContextMenuItem[] = tabs.map(tab => ({
        label: tab.label,
        icon: tab.icon,
        variant: activeTab === tab.id ? 'active' : 'default',
        onClick: () => setActiveTab(tab.id as TabType)
    }));

    return (
        <div className="min-h-screen" dir="rtl">
            <AppBar 
                title="سجل النشاطات" 
                backHref={ROUTES.PROFILE} 
                actions={
                    <ContextMenu 
                        trigger={<FilterTrigger isMobile label={tabs.find(t => t.id === activeTab)?.label || 'الكل'} />} 
                        items={filterItems} 
                        align="left"
                    />
                }
            />

            <div className="max-w-4xl mx-auto px-4 md:px-12 pt-14 md:pt-24 space-y-8">
                {/* Header section (Visible on all screens) */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-2">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-text-primary tracking-tight">آخر نشاطاتك</h2>
                        <p className="text-sm md:text-base text-text-muted font-bold opacity-70 mt-1">التقييمات، الأماكن، والتعليقات</p>
                    </div>
                    {/* Desktop filter stays here */}
                    <div className="hidden md:block">
                        <ContextMenu
                            trigger={<FilterTrigger label={tabs.find(t => t.id === activeTab)?.label || 'الكل'} />}
                            items={filterItems}
                            align="left"
                        />
                    </div>
                </div>

            {/* Activities List */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="popLayout">
                    {filteredActivities.length > 0 ? (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            {filteredActivities.map((activity, index) => (
                                <ActivityListTile
                                    key={activity.id}
                                    activity={activity}
                                    index={index}
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-24 bg-surface/50 border border-dashed border-border-subtle rounded-[40px] flex flex-col items-center justify-center p-8"
                        >
                            <div className="w-24 h-24 bg-elevated rounded-[32px] flex items-center justify-center mb-6 shadow-sm border border-border-subtle/50">
                                <Search className="w-10 h-10 text-text-muted/20" />
                            </div>
                            <h3 className="text-xl font-black text-text-primary mb-2">لا توجد نتائج</h3>
                            <p className="text-text-muted font-medium mb-8 max-w-xs mx-auto">
                                يبدو أنك لم تقم بأي نشاط في هذا القسم بعد. ابدأ الآن واصنع بصمتك في السويس!
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <CustomLink
                                    href={ROUTES.PLACES}
                                    className="px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                                >
                                    استكشف الأماكن
                                </CustomLink>
                                <CustomLink
                                    href={ROUTES.COMMUNITY}
                                    className="px-6 py-3 bg-surface border border-border-subtle text-text-primary rounded-2xl font-bold text-sm hover:bg-elevated transition-colors"
                                >
                                    شارك في المجتمع
                                </CustomLink>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    </div>
);
}
