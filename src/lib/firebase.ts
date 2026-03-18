import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (safe for SSR)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Get messaging instance safely (only on client)
const getMessagingInstance = (): Messaging | null => {
  if (typeof window === "undefined") return null;
  try {
    return getMessaging(app);
  } catch {
    return null;
  }
};

export const requestForToken = async (): Promise<string | null> => {
  try {
    // 1. Check browser support
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.log("Browser does not support notifications");
      return null;
    }

    // 2. Request permission explicitly
    console.log("[FCM] Current permission:", Notification.permission);
    const permission = await Notification.requestPermission();
    console.log("[FCM] Permission status after request:", permission);
    
    if (permission !== "granted") {
      console.warn("[FCM] Notification permission denied by user or browser");
      return null;
    }

    // 3. Register service worker explicitly
    let swRegistration: ServiceWorkerRegistration | undefined;
    if ("serviceWorker" in navigator) {
      swRegistration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
      await navigator.serviceWorker.ready;
    }

    // 4. Get messaging instance
    const messaging = getMessagingInstance();
    if (!messaging) return null;

    // 5. Get token
    console.log("[FCM] Fetching token with VAPID Key:", process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ? "Present" : "MISSING");
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });

    if (currentToken) {
      console.log("[FCM] Token obtained successfully");
      return currentToken;
    } else {
      console.warn("[FCM] No registration token available. Check Firebase console for VAPID configuration.");
      return null;
    }
  } catch (err) {
    console.error("Error retrieving FCM token:", err);
    return null;
  }
};

export const onMessageListener = (callback: (payload: any) => void) => {
  const messaging = getMessagingInstance();
  if (!messaging) return;
  
  return onMessage(messaging, (payload) => {
    console.log("Foreground message received:", payload);
    callback(payload);
  });
};

export default app;
