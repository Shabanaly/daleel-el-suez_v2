'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { messaging, requestForToken, onMessageListener } from '@/lib/firebase';
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

      // 1. Request Permission and get Token
      const token = await requestForToken();
      if (token) {
        setFcmToken(token);
        
        // 2. Save/Update token in Supabase
        const { error } = await supabase
          .from('user_fcm_tokens')
          .upsert({ 
            user_id: user.id, 
            token: token,
            device_type: 'web',
            updated_at: new Date().toISOString()
          }, { onConflict: 'token' });

        if (error) {
          console.error('Error saving FCM token to Supabase:', error);
        }
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
