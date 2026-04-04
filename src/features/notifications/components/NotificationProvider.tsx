'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { requestForToken, onMessageListener } from '@/lib/firebase';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/features/notifications/hooks/useToast';

const FCM_TOKEN_KEY = 'fcm_token';

interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
    image?: string;
  };
  data?: {
    [key: string]: string;
  };
}

interface NotificationContextType {
  fcmToken: string | null;
  notification: NotificationPayload | null;
}

const NotificationContext = createContext<NotificationContextType>({
  fcmToken: null,
  notification: null,
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationPayload | null>(null);
  const isRegistering = useRef(false);
  const supabase = createClient();
  const { showToast } = useToast();

  useEffect(() => {
    if (isRegistering.current || authLoading) return;

    const setupNotifications = async () => {
      isRegistering.current = true;

      try {
        // 1. Get current FCM token
        const newToken = await requestForToken();
        if (!newToken) return;

        setFcmToken(newToken);

        // 2. Intelligent Sync Check
        const cachedToken = localStorage.getItem(FCM_TOKEN_KEY);
        const lastUserId = localStorage.getItem('fcm_user_id');
        const lastSyncStr = localStorage.getItem('fcm_last_sync');
        const lastSync = lastSyncStr ? parseInt(lastSyncStr, 10) : 0;
        
        const now = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        
        const tokenChanged = newToken !== cachedToken;
        const userChanged = (user?.id || 'guest') !== lastUserId;
        const needsScheduledSync = (now - lastSync) > sevenDays;

        if (tokenChanged || userChanged || needsScheduledSync) {
          
          const { error } = await supabase
            .from('user_fcm_tokens')
            .upsert(
              {
                user_id: user?.id || null,
                token: newToken,
                device_type: 'web',
                last_seen_at: new Date().toISOString(),
                metadata: {
                  userAgent: window.navigator.userAgent,
                  language: window.navigator.language,
                }
              },
              { onConflict: 'token' }
            );

          if (!error) {
            localStorage.setItem(FCM_TOKEN_KEY, newToken);
            localStorage.setItem('fcm_last_sync', now.toString());
            localStorage.setItem('fcm_user_id', user?.id || 'guest');
          } else {
            console.error('[Notifications] Sync failed:', error.message);
          }
        } else {
          // Optionally update last_seen_at silently if it's been a while (e.g. > 1 day)
          const lastSeenSync = (now - lastSync) > (24 * 60 * 60 * 1000);
          if (lastSeenSync) {
             await supabase
              .from('user_fcm_tokens')
              .update({ last_seen_at: new Date().toISOString() })
              .eq('token', newToken);
          }
        }

      } catch (err) {
        console.error('[Notifications] Setup error:', err);
      } finally {
        isRegistering.current = false;
      }
    };

    setupNotifications();
  }, [user?.id, authLoading, supabase]);

  // Listen for foreground messages
  useEffect(() => {
    const unsubscribe = onMessageListener((payload) => {
      console.log('[Notifications] Foreground message event triggered:', payload);
      
      // Only show toast if this specific tab is focused to avoid duplicates across tabs
      if (document.hasFocus()) {
        setNotification(payload);
        
        showToast({
          title: payload.notification?.title || payload.data?.title || 'تنبيه جديد',
          message: payload.notification?.body || payload.data?.body || '',
          type: 'DEFAULT',
          id: payload.data?.notification_id
        });
      }

      // REMOVED: Native Notification here was causing double notifications in foreground
      // Background notifications are handled separately by the Service Worker
    });

    return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ fcmToken, notification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
