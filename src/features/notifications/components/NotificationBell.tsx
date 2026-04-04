'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Bell, CheckSquare } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Notification } from '@/lib/notifications/types';
import { NotificationList } from './NotificationList';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

import { getRecentNotificationsAction, markNotificationAsReadAction, markAllNotificationsAsReadAction } from '@/features/notifications/actions/notifications.server';
import { useToast } from '@/features/notifications/hooks/useToast';

export const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<string | null>(null);
  // Stable supabase ref — prevent re-creation on every render
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const { showToast } = useToast();

  // Fetch initial notifications with Smart Caching
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    const cacheKey = `daleel_notifications_${user.id}`;
    const cachedDataStr = localStorage.getItem(cacheKey);

    if (cachedDataStr) {
      try {
        const { data: cachedNodes, timestamp } = JSON.parse(cachedDataStr);
        // If cache is less than 15 minutes old, use it and skip DB hit
        if (Date.now() - timestamp < 15 * 60 * 1000) {
          setNotifications(cachedNodes);
          setUnreadCount(cachedNodes.filter((n: Notification) => !n.is_read).length);
          return;
        }
      } catch (e) {
        console.error('Error parsing cached notifications', e);
      }
    }

    // Call Server Action instead of direct DB query
    const { data } = await getRecentNotificationsAction();

    if (data) {
      setNotifications(data as Notification[]);
      setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
      localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
    }
  }, [user]);

  const updateCache = useCallback((newNotifications: Notification[]) => {
      if (!user) return;
      const cacheKey = `daleel_notifications_${user.id}`;
      localStorage.setItem(cacheKey, JSON.stringify({ data: newNotifications, timestamp: Date.now() }));
  }, [user]);

  useEffect(() => {
    if (user) {
      if (subscriptionRef.current === user.id) return;
      subscriptionRef.current = user.id;

      setTimeout(() => fetchNotifications(), 0);
      
      const channel = supabase
        .channel(`notifs-${user.id}-${Math.floor(Math.random() * 10000)}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications' }, 
          (payload: RealtimePostgresChangesPayload<Notification>) => {
            if ((payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') && payload.new && 'user_id' in payload.new && payload.new.user_id === user.id) {
                if (payload.eventType === 'INSERT') {
                    const newNotif = payload.new as Notification;
                    
                    // Trigger visual toast
                    showToast({
                        title: newNotif.title,
                        message: newNotif.message,
                        type: newNotif.type as any,
                        link: newNotif.link,
                        actor: newNotif.actor
                    });

                    setNotifications(prev => {
                        const updated = [newNotif, ...prev.slice(0, 19)];
                        updateCache(updated);
                        return updated;
                    });
                    setUnreadCount(prev => prev + 1);
                } else if (payload.eventType === 'UPDATE') {
                    const updatedNotif = payload.new as Notification;
                    setNotifications(prev => {
                        const updated = prev.map(n => n.id === updatedNotif.id ? updatedNotif : n);
                        updateCache(updated);
                        const newUnreadCount = updated.filter(n => !n.is_read).length;
                        setUnreadCount(newUnreadCount);
                        return updated;
                    });
                }
            }
          }
        )
        .subscribe((status: string, err: Error | undefined) => {
          if (err) {
            console.error('[NotificationBell] Realtime error:', err);
          }
        });

      return () => {
        subscriptionRef.current = null;
        supabase.removeChannel(channel);
      };
    }
  }, [user, supabase, fetchNotifications, updateCache]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications(prev => {
        const updated = prev.map(n => n.id === id ? { ...n, is_read: true } : n);
        updateCache(updated); // Sync with localStorage
        return updated;
    });
    setUnreadCount(prev => Math.max(0, prev - 1));

    const { success } = await markNotificationAsReadAction(id);
    if (!success) {
      // Revert on failure
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    // Optimistic UI update
    setNotifications(prev => {
        const updated = prev.map(n => ({ ...n, is_read: true }));
        updateCache(updated); // Sync with localStorage
        return updated;
    });
    setUnreadCount(0);

    const { success } = await markAllNotificationsAsReadAction();
    if (!success) {
      // Revert on failure
      fetchNotifications();
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-elevated transition-colors relative group"
        aria-label="الإشعارات"
      >
        <Bell className={`w-5 h-5 transition-colors ${unreadCount > 0 ? 'text-primary' : 'text-text-muted'}`} />
        
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-[10px] items-center justify-center text-white font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-[-60px] sm:left-[-40px] md:left-0 mt-2 w-[320px] sm:w-[340px] bg-background border border-border-subtle rounded-xl shadow-2xl z-100 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-elevated/30">
              <h3 className="font-bold text-text-primary">الإشعارات</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-primary font-medium hover:underline flex items-center gap-1.5"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  تمييز الكل كمقروء
                </button>
              )}
            </div>

            {/* List */}
            <NotificationList 
              notifications={notifications} 
              onMarkAsRead={markAsRead} 
              onClose={() => setIsOpen(false)}
              className="max-h-[420px] overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-border-subtle divide-y"
            />

            {/* Footer */}
            <div className="p-3 border-t border-border-subtle text-center bg-elevated/10 hover:bg-elevated/20 transition-colors">
              <Link 
                href="/profile/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs text-text-muted hover:text-text-primary transition-colors font-bold block w-full"
              >
                عرض أرشيف الإشعارات
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
