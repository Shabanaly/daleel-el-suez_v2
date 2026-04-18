'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, PlusSquare, Download, Smartphone } from 'lucide-react';
import Image from 'next/image';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const DISMISS_KEY = 'pwa-prompt-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export default function PWAInstallPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone ||
        document.referrer.includes('android-app://')
      );
    };

    const detectIOS = () => {
      return (
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream
      );
    };

    if (checkStandalone()) {
      setTimeout(() => setIsStandalone(true), 0);
      return;
    }

    setTimeout(() => setIsIOS(detectIOS()), 0);

    // 3. Handle Chrome/Android "beforeinstallprompt"
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setPrompt(e);
      checkVisibility();
    };

    window.addEventListener('beforeinstallprompt', handler);

    // 4. Initial visibility check with delay, synchronized with Cookie Consent
    const checkVisibility = () => {
      const dismissedAt = localStorage.getItem(DISMISS_KEY);
      const now = Date.now();

      if (dismissedAt && now - parseInt(dismissedAt) < DISMISS_DURATION) {
        return;
      }

      const showWithDelay = () => {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 12000); // 12s delay after everything is clear
        return timer;
      };

      // If user hasn't made a cookie choice, wait for it
      const cookieChoice = localStorage.getItem('daleel-cookie-consent');
      if (!cookieChoice) {
        const handleCookieChoice = () => {
          showWithDelay();
          window.removeEventListener('daleel-cookie-choice-made', handleCookieChoice);
        };
        window.addEventListener('daleel-cookie-choice-made', handleCookieChoice);
        return () => window.removeEventListener('daleel-cookie-choice-made', handleCookieChoice);
      } else {
        const timer = showWithDelay();
        return () => clearTimeout(timer);
      }
    };

    const cleanupTimeout = checkVisibility();

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      if (typeof cleanupTimeout === 'function') cleanupTimeout();
    };
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  if (isStandalone || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 200, opacity: 0 }}
        className="fixed bottom-24 lg:bottom-6 left-2 right-2 sm:left-auto sm:right-6 sm:w-96 z-50 pointer-events-none"
      >
        <div className="pointer-events-auto bg-surface/90 backdrop-blur-xl border border-primary/10 shadow-2xl rounded-3xl p-3 sm:p-5 relative overflow-hidden">
          {/* Decorative background circle */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
              <Image 
                src="/favicon-circular.ico" 
                alt="Logo" 
                width={36} 
                height={36} 
                className="rounded-full w-7 h-7 sm:w-9 sm:h-9"
              />
            </div>
            
            <div className="flex-1 min-w-0" dir="rtl">
              <h3 className="text-text-primary font-black text-[11px] sm:text-sm mb-0.5 truncate">
                تطبيق دليل السويس 🚀
              </h3>
              <p className="text-text-muted text-[9px] sm:text-[11px] leading-tight line-clamp-1 sm:line-clamp-2">
                تجربة أسرع للوصول لأهم الخدمات.
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0" dir="rtl">
              {!isIOS && (
                <button
                  onClick={handleInstall}
                  className="bg-primary hover:bg-primary-hover text-white font-black px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 text-[10px] sm:text-xs"
                >
                  تثبيت
                </button>
              )}
              <button
                onClick={handleDismiss}
                className="p-1.5 text-text-muted hover:text-text-primary transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {isIOS && (
            <div className="mt-3 bg-primary/5 rounded-xl p-2 border border-primary/10" dir="rtl">
              <p className="text-[9px] text-primary font-bold flex items-center gap-1.5">
                <Smartphone className="w-3 h-3" />
                للتثبيت: اضغط <Share className="w-3 h-3 text-blue-500 inline" /> ثم &quot;إضافة للشاشة الرئيسية&quot; <PlusSquare className="w-3 h-3 text-blue-500 inline" />
              </p>
            </div>
          )}
          
          <div className="hidden sm:block mt-4">
            <button 
              onClick={handleDismiss}
              className="w-full text-text-muted hover:text-text-primary text-[10px] font-bold py-1 transition-colors text-center"
            >
              ليس الآن، ربما لاحقاً
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
