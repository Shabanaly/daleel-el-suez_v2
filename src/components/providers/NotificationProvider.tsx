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
  const { user, isLoading: authLoading } = useAuth();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const isRegistering = useRef(false);
  const supabase = createClient();

  useEffect(() => {
    // We still want to avoid double-registration
    if (isRegistering.current) return;

    const setupNotifications = async () => {
      // 1. Wait until Auth is definitely finished loading (either we have a user or confirmed guest)
      if (authLoading) return;

      // 2. Small delay for guest/new users before asking for permission to avoid prompt fatigue
      if (!user) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Reduced to 2s for better testing experience
      }

      isRegistering.current = true;

      try {
        const newToken = await requestForToken();
        if (!newToken) {
            console.warn('[Notifications] No token received from requestForToken');
            return;
        }

        console.log('[Notifications] Token retrieved:', newToken.substring(0, 10) + '...');
        setFcmToken(newToken);

        const cachedToken = localStorage.getItem(FCM_TOKEN_KEY);
        const lastSync = localStorage.getItem('fcm_last_sync');
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        // DEBUG: Force sync every time for now to ensure DB is up to date during testing
        console.log(`[Notifications] Syncing token with Supabase (${user?.id ? 'User: ' + user.id : 'Guest'})`);
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

        console.log('[Notifications] Setup complete');

      } catch (err) {
        console.error('[Notifications] Setup error:', err);
      } finally {
        isRegistering.current = false;
      }
    };

    setupNotifications();
  }, [user?.id, authLoading]);

  // Listen for foreground messages
  useEffect(() => {
    console.log('[Notifications] Initializing foreground message listener');
    const unsubscribe = onMessageListener((payload: any) => {
      console.log('[Notifications] Foreground message event triggered:', payload);
      setNotification(payload);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 6000);

      // Show native notification even when app is in foreground
      if (Notification.permission === 'granted' && payload.notification) {
        const n = new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: '/favicon-circular.ico',
          badge: '/favicon-circular.ico', // Better for mobile/PWA
          data: {
            url: payload.data?.url || payload.fcmOptions?.link || '/'
          }
        });

        // Handle click in foreground
        n.onclick = (e) => {
          e.preventDefault();
          window.focus();
          const targetUrl = (e.target as any).data?.url || '/';
          if (window.location.pathname !== targetUrl) {
            window.location.href = targetUrl;
          }
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
      
      {/* Real-time Visual Toast for Debugging */}
      {showToast && notification && (
        <div 
           className="fixed top-24 right-4 bg-surface border-2 border-primary shadow-2xl p-4 rounded-2xl max-w-sm animate-in fade-in slide-in-from-top-4 duration-300" 
           dir="rtl"
           style={{ zIndex: 99999 }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <span className="text-primary text-xl">🔔</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                 <h4 className="font-bold text-text-primary text-sm">{notification.notification?.title || notification.data?.title || 'تنبيه جديد'}</h4>
                 <span className="text-[10px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded-full font-bold">REAL-TIME</span>
              </div>
              <p className="text-text-muted text-xs leading-relaxed">{notification.notification?.body || notification.data?.body || 'لا يوجد محتوى'}</p>
            </div>
            <button onClick={() => setShowToast(false)} className="text-text-muted hover:text-text-primary p-1">✕</button>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
