'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { requestForToken, onMessageListener } from '@/lib/firebase';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';

const FCM_TOKEN_KEY = 'fcm_token';

interface NotificationContextType {
  fcmToken: string | null;
  notification: any | null;
}

const NotificationContext = createContext<NotificationContextType>({
  fcmToken: null,
  notification: null,
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<any>(null);
  const isRegistering = useRef(false);
  const supabase = createClient();

  useEffect(() => {
    // We still want to avoid double-registration
    if (isRegistering.current) return;

    const setupNotifications = async () => {
      // Small delay for guest/new users before asking for permission to avoid prompt fatigue
      // If user is logged in, we can be more proactive
      if (!user) {
        await new Promise(resolve => setTimeout(resolve, 15000)); // 15s delay for guests
      }

      isRegistering.current = true;

      try {
        const newToken = await requestForToken();
        if (!newToken) return;

        setFcmToken(newToken);

        const cachedToken = localStorage.getItem(FCM_TOKEN_KEY);
        const lastSync = localStorage.getItem('fcm_last_sync');
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        // Skip if same and synced recently
        if (cachedToken === newToken && lastSync && (now - parseInt(lastSync) < oneDay)) {
          // Extra check: if user just logged in, we might need to update the user_id on the server
          const lastUserId = localStorage.getItem('fcm_user_id');
          if (lastUserId === (user?.id || 'guest')) {
             console.log('[Notifications] Token and User fresh, skipping sync');
             return;
          }
        }

        console.log('[Notifications] Syncing token with Supabase (User:', user?.id || 'Guest', ')');
        const { error } = await supabase
          .from('user_fcm_tokens')
          .upsert(
            {
              user_id: user?.id || null, // Can be null for guests
              token: newToken,
              device_type: 'web',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'token' }
          );

        if (!error) {
          localStorage.setItem(FCM_TOKEN_KEY, newToken);
          localStorage.setItem('fcm_last_sync', now.toString());
          localStorage.setItem('fcm_user_id', user?.id || 'guest');
          console.log('[Notifications] Token synced successfully');
        } else {
          console.error('[Notifications] Sync failed:', error.message);
        }

      } catch (err) {
        console.error('[Notifications] Setup error:', err);
      } finally {
        isRegistering.current = false;
      }
    };

    setupNotifications();
  }, [user?.id]);

  // Listen for foreground messages
  useEffect(() => {
    const unsubscribe = onMessageListener((payload: any) => {
      setNotification(payload);

      // Show native notification even when app is in foreground
      if (Notification.permission === 'granted' && payload.notification) {
        const n = new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: '/favicon-circular.ico',
          data: {
            url: payload.data?.url || '/'
          }
        });

        // Handle click in foreground
        n.onclick = (e) => {
          e.preventDefault();
          window.focus();
          window.location.href = (e.target as any).data?.url || '/';
          n.close();
        };
      }
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
