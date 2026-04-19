'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
 
 

import React, { useState, useEffect } from 'react';
import { Notification } from '@/lib/notifications/types';
import { NotificationList } from './NotificationList';
import { getArchivedNotificationsAction, markNotificationAsReadAction } from '../actions/notifications.server';
import { Bell, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationArchiveList({ initialNotifications, initialTotal }: { initialNotifications: Notification[], initialTotal: number }) {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [total, setTotal] = useState(initialTotal);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialNotifications.length < initialTotal);

    const loadMore = async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            const nextPage = page + 1;
            const result = await getArchivedNotificationsAction(nextPage);
            if (result.notifications.length > 0) {
                setNotifications(prev => [...prev, ...result.notifications]);
                setPage(nextPage);
                setHasMore([...notifications, ...result.notifications].length < result.total);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to load more notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        await markNotificationAsReadAction(id);
    };

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-surface rounded-3xl border border-border-subtle p-8 mt-4">
                <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mb-6">
                    <Bell className="w-10 h-10 text-orange-500" />
                </div>
                <h3 className="text-xl font-black text-text-primary mb-2">لا توجد تنبيهات سابقة</h3>
                <p className="text-text-muted max-w-xs mx-auto">
                    بمجرد تفاعلك مع المجتمع أو تلقي إشعارات، ستظهر هنا في الأرشيف لنتمكن من الرجوع إليها لاحقاً.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative"
            >
                <NotificationList 
                    notifications={notifications} 
                    onMarkAsRead={handleMarkAsRead}
                    onClose={() => {}} // No auto-close on archive page
                    className="" // Removing divide-y to trigger Card style
                />
            </motion.div>

            {hasMore && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 bg-elevated hover:bg-border-subtle text-text-primary font-bold rounded-2xl transition-all border border-border-subtle disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                جاري التحميل...
                            </>
                        ) : (
                            'تحميل المزيد'
                        )}
                    </button>
                </div>
            )}
            
            <div className="text-center text-xs text-text-muted mt-6 font-medium">
                إجمالي الإشعارات: {total}
            </div>
        </div>
    );
}
