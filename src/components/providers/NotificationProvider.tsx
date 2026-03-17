'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { requestForToken, onMessageListener } from '@/lib/firebase';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';

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
  const supabase = createClient();

  useEffect(() => {
    const setupNotifications = async () => {
      if (!user) return;

      console.log('[NotificationProvider] Starting setup for user:', user.id);

      // 1. Request Permission and get Token
      const token = await requestForToken();
      
      if (!token) {
        console.error('[NotificationProvider] Failed to get FCM token');
        return;
      }

      console.log('[NotificationProvider] Got token, saving to Supabase...');
      setFcmToken(token);
      
      // 2. Save/Update token in Supabase
      const { data, error } = await supabase
        .from('user_fcm_tokens')
        .upsert({ 
          user_id: user.id, 
          token: token,
          device_type: 'web',
          updated_at: new Date().toISOString()
        }, { onConflict: 'token' })
        .select();

      if (error) {
        console.error('[NotificationProvider] Supabase upsert error:', JSON.stringify(error));
      } else {
        console.log('[NotificationProvider] Token saved successfully:', data);
      }
    };

    setupNotifications();
  }, [user]);

  useEffect(() => {
    // Listen for foreground messages
    const unsubscribe = onMessageListener().then((payload: any) => {
      setNotification(payload);
      // You could use a toast library here to show the notification
      console.log('Received foreground message:', payload);
    });

    return () => {
      // Logic to unsubscribe if necessary
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ fcmToken, notification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
