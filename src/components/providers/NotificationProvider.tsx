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
    if (!user || isRegistering.current || fcmToken) return;

    const setupNotifications = async () => {
      isRegistering.current = true;

      try {
        // 1. Get FCM token from Firebase
        const newToken = await requestForToken();
        if (!newToken) {
          console.warn('[Notifications] Permission denied or token unavailable');
          return;
        }

        setFcmToken(newToken);

        // 2. Compare with cached token in localStorage
        const cachedToken = localStorage.getItem(FCM_TOKEN_KEY);

        if (cachedToken === newToken) {
          // Token unchanged → no need to hit Supabase
          console.log('[Notifications] Token unchanged, skipping DB update');
          return;
        }

        // 3. Token is new or changed → save to Supabase
        console.log('[Notifications] Token changed, updating Supabase...');
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

        if (error) {
          console.error('[Notifications] Failed to save token:', error.message);
          return;
        }

        // 4. Only update localStorage after successful DB save
        localStorage.setItem(FCM_TOKEN_KEY, newToken);
        console.log('[Notifications] Token saved to DB and localStorage');

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
    onMessageListener().then((payload: any) => {
      setNotification(payload);

      // Show native notification even when app is in foreground
      if (Notification.permission === 'granted' && payload.notification) {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: '/favicon-circular.ico',
        });
      }
    });
  }, []);

  return (
    <NotificationContext.Provider value={{ fcmToken, notification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
