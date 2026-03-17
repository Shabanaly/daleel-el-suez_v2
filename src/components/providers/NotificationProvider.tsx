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
    if (!user || isRegistering.current) return;

    const setupNotifications = async () => {
      isRegistering.current = true;

      try {
        const newToken = await requestForToken();
        if (!newToken) return;

        setFcmToken(newToken);

        const cachedToken = localStorage.getItem(FCM_TOKEN_KEY);
        const lastSync = localStorage.getItem('fcm_last_sync');
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        // Only skip if token is same AND we synced recently (within 24 hours)
        if (cachedToken === newToken && lastSync && (now - parseInt(lastSync) < oneDay)) {
          console.log('[Notifications] Token fresh, skipping sync');
          return;
        }

        console.log('[Notifications] Syncing token with Supabase...');
        const { error } = await supabase
          .from('user_fcm_tokens')
          .upsert(
            {
              user_id: user.id,
              token: newToken,
              device_type: 'web',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'token' }
          );

        if (!error) {
          localStorage.setItem(FCM_TOKEN_KEY, newToken);
          localStorage.setItem('fcm_last_sync', now.toString());
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
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: '/favicon-circular.ico',
        });
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
