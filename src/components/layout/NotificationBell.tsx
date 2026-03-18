'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckSquare } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { Notification } from '@/lib/types/notifications';
import { NotificationList } from './NotificationList';
import { motion, AnimatePresence } from 'framer-motion';

import { getRecentNotificationsAction, markNotificationAsReadAction, markAllNotificationsAsReadAction } from '@/lib/actions/notifications';

export const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<string | null>(null);
  const supabase = createClient();

  // Fetch initial notifications with Smart Caching
  const fetchNotifications = async () => {
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
  };

  const updateCache = (newNotifications: Notification[]) => {
      if (!user) return;
      const cacheKey = `daleel_notifications_${user.id}`;
      localStorage.setItem(cacheKey, JSON.stringify({ data: newNotifications, timestamp: Date.now() }));
  };

  useEffect(() => {
    if (user) {
      if (subscriptionRef.current === user.id) return; // Prevent duplicate subs for same user
      subscriptionRef.current = user.id;

      console.log(`[NotificationBell] Initializing Realtime for user: ${user.id}`);
      fetchNotifications();
      
      // Subscribe to real-time notifications (Runs only on Client)
      const channel = supabase
        .channel(`user-notifications-${user.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications' }, // Remove filter for robustness
          (payload: { new: Notification }) => {
            // Filter manually in JS to avoid CHANNEL_ERROR from complex server-side filter parsing
            if (payload.new && payload.new.user_id === user.id) {
                console.log('[NotificationBell] NEW real-time notification received:', payload.new);
                const newNotif = payload.new as Notification;
                setNotifications(prev => {
                    const updated = [newNotif, ...prev.slice(0, 19)];
                    updateCache(updated);
                    return updated;
                });
                setUnreadCount(prev => prev + 1);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'notifications' }, // Remove filter
          (payload: { new: Notification }) => {
             // Filter manually in JS
            if (payload.new && payload.new.user_id === user.id) {
                console.log('[NotificationBell] UPDATE real-time notification received:', payload.new);
                const updatedNotif = payload.new as Notification;
                
                setNotifications(prev => {
                    const updated = prev.map(n => n.id === updatedNotif.id ? updatedNotif : n);
                    updateCache(updated);
                    
                    // Recalculate unread count based on the FRESH state
                    const newUnreadCount = updated.filter(n => !n.is_read).length;
                    setUnreadCount(newUnreadCount);
                    
                    return updated;
                });
            }
          }
        )
        .subscribe((status: any, err: any) => {
          console.log(`[NotificationBell] Realtime status: ${status}`);
          if (err) {
            console.error('[NotificationBell] Realtime subscription error:', err);
          }
          // Update status for the UI debug indicator
          if (status === 'SUBSCRIBED') {
             (window as any)._rt_status = 'connected';
          }
        });

      return () => {
        console.log('[NotificationBell] Cleaning up Realtime channel');
        subscriptionRef.current = null;
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

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
            />

            {/* Footer */}
            <div className="p-3 border-t border-border-subtle text-center bg-elevated/10">
              <button className="text-xs text-text-muted hover:text-text-primary transition-colors font-medium">
                عرض أرشيف الإشعارات
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
