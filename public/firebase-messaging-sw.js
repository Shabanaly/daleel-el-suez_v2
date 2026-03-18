importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCjitS2xwd1fLXeruWyODJRGRUACWXhja8",
  authDomain: "service-app-web-42018.firebaseapp.com",
  projectId: "service-app-web-42018",
  storageBucket: "service-app-web-42018.firebasestorage.app",
  messagingSenderId: "587162170525",
  appId: "1:587162170525:web:8458e9692ed91c2f61d074",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Received background message:', payload);
  
  // Extract data with fallbacks
  const notificationTitle = payload.notification?.title || payload.data?.title || 'تنبيه جديد';
  const notificationBody = payload.notification?.body || payload.data?.body || '';
  
  // Prioritize link from multiple possible sources (FCM v1 standard)
  const clickAction = payload.fcmOptions?.link || 
                      payload.data?.url || 
                      payload.data?.click_action || 
                      '/';

  const notificationOptions = {
    body: notificationBody,
    icon: '/favicon-circular.ico',
    badge: '/favicon-circular.ico',
    tag: payload.data?.tag || 'default-tag', // Prevents notification flooding
    renotify: true,
    data: {
      url: clickAction
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click to open the link
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window open with this URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Skip waiting to activate the new SW immediately
self.addEventListener('install', () => {
    self.skipWaiting();
});
