'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckSquare } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { Notification } from '@/lib/types/notifications';
import { NotificationList } from './NotificationList';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Fetch initial notifications
  const fetchNotifications = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Subscribe to real-time notifications
      const channel = supabase
        .channel(`user-notifications-${user.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload: { new: Notification }) => {
            const newNotif = payload.new as Notification;
            setNotifications(prev => [newNotif, ...prev.slice(0, 19)]);
            setUnreadCount(prev => prev + 1);
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload: { new: Notification }) => {
            const updatedNotif = payload.new as Notification;
            setNotifications(prev => prev.map(n => n.id === updatedNotif.id ? updatedNotif : n));
            // Recalculate unread count
            setUnreadCount(prev => {
                const oldNotif = notifications.find(n => n.id === updatedNotif.id);
                if (oldNotif && !oldNotif.is_read && updatedNotif.is_read) return Math.max(0, prev - 1);
                if (oldNotif && oldNotif.is_read && !updatedNotif.is_read) return prev + 1;
                return prev;
            });
          }
        )
        .subscribe();

      return () => {
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
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
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
            className="absolute left-[-60px] sm:left-[-40px] md:left-0 mt-2 w-[320px] sm:w-[340px] bg-background border border-border-subtle rounded-xl shadow-2xl z-[100] overflow-hidden"
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
