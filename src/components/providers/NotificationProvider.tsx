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
    if (isRegistering.current || authLoading) return;

    const setupNotifications = async () => {
      isRegistering.current = true;

      try {
        // 1. Get current FCM token
        const newToken = await requestForToken();
        if (!newToken) {
            console.debug('[Notifications] No token received');
            return;
        }

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
          console.log(`[Notifications] Syncing token (${user?.id ? 'User: ' + user.id : 'Guest'}) - Reason: ${tokenChanged? 'Token' : userChanged? 'User' : 'Time'}`);
          
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
            console.log('[Notifications] Token synced successfully');
          } else {
            console.error('[Notifications] Sync failed:', error.message);
          }
        } else {
          console.debug('[Notifications] Token sync skipped (already up to date)');
          
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
  }, [user?.id, authLoading]);

  // Listen for foreground messages
  useEffect(() => {
    console.log('[Notifications] Initializing foreground message listener');
    const unsubscribe = onMessageListener((payload: any) => {
      console.log('[Notifications] Foreground message event triggered:', payload);
      
      // Only show toast if this specific tab is focused to avoid duplicates across tabs
      if (document.hasFocus()) {
        setNotification(payload);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 6000);
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
      
      {/* Real-time Visual Toast for Debugging */}
      {showToast && notification && (
        <div 
           className="fixed bottom-6 lg:bottom-auto lg:top-24 left-1/2 -translate-x-1/2 lg:left-auto lg:right-4 lg:translate-x-0 w-[94%] max-w-[340px] lg:max-w-sm bg-surface border-2 border-primary/30 lg:border-primary shadow-2xl p-3 lg:p-4 rounded-2xl animate-in fade-in slide-in-from-bottom-6 lg:slide-in-from-top-4 duration-300" 
           dir="rtl"
           style={{ zIndex: 99999 }}
        >
          <div className="flex items-start gap-2.5 lg:gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <span className="text-primary text-lg lg:text-xl">🔔</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5 lg:mb-1">
                 <h4 className="font-bold text-text-primary text-[13px] lg:text-sm truncate">{notification.notification?.title || notification.data?.title || 'تنبيه جديد'}</h4>
                 <span className="text-[9px] lg:text-[10px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap">REAL-TIME</span>
              </div>
              <p className="text-text-muted text-[11px] lg:text-xs leading-relaxed line-clamp-2">{notification.notification?.body || notification.data?.body || 'لا يوجد محتوى'}</p>
            </div>
            <button onClick={() => setShowToast(false)} className="text-text-muted hover:text-text-primary p-1 shrink-0">✕</button>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
