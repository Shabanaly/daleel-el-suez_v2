'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, PlusSquare, Download, Smartphone } from 'lucide-react';
import Image from 'next/image';

const DISMISS_KEY = 'pwa-prompt-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export default function PWAInstallPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [prompt, setPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Check if already installed
    const checkStandalone = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://')
      );
    };

    if (checkStandalone()) {
      setIsStandalone(true);
      return;
    }

    // 2. Detect iOS
    const detectIOS = () => {
      return (
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
      );
    };
    setIsIOS(detectIOS());

    // 3. Handle Chrome/Android "beforeinstallprompt"
    const handler = (e: any) => {
      e.preventDefault();
      setPrompt(e);
      checkVisibility();
    };

    window.addEventListener('beforeinstallprompt', handler);

    // 4. Initial visibility check with delay
    const checkVisibility = () => {
      const dismissedAt = localStorage.getItem(DISMISS_KEY);
      const now = Date.now();

      if (dismissedAt && now - parseInt(dismissedAt) < DISMISS_DURATION) {
        return;
      }

      // Show after 10 seconds delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10000);

      return () => clearTimeout(timer);
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
        className="fixed bottom-24 lg:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50"
      >
        <div className="bg-surface border border-border-subtle shadow-2xl rounded-2xl p-5 relative overflow-hidden">
          {/* Decorative background circle */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full pointer-events-none" />
          
          <button 
            onClick={handleDismiss}
            className="absolute top-3 left-3 p-1.5 hover:bg-elevated rounded-full transition-colors text-text-muted"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex gap-4">
            <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
              <Image 
                src="/favicon-circular.ico" 
                alt="Logo" 
                width={36} 
                height={36} 
                className="rounded-full"
              />
            </div>
            
            <div className="flex-1 pt-1" dir="rtl">
              <h3 className="text-text-primary font-black text-sm mb-1">
                ثبت تطبيق "دليل السويس" 🚀
              </h3>
              <p className="text-text-muted text-[11px] leading-relaxed">
                استمتع بتجربة أسرع، إشعارات لحظية، ووصول سهل من الشاشة الرئيسية.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3" dir="rtl">
            {isIOS ? (
              <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                <p className="text-[10px] text-primary font-bold flex items-center gap-2 mb-2">
                  <Smartphone className="w-3 h-3" />
                  خطوات التثبيت على iPhone:
                </p>
                <ul className="text-[10px] text-text-muted space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-4 h-4 flex items-center justify-center bg-white rounded-md shadow-sm">1</span>
                    اضغط على زر المشاركة <Share className="w-3 h-3 text-blue-500 inline mx-0.5" /> في الأسفل.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-4 h-4 flex items-center justify-center bg-white rounded-md shadow-sm">2</span>
                    اختر "إضافة إلى الشاشة الرئيسية" <PlusSquare className="w-3 h-3 text-blue-500 inline mx-0.5" />.
                  </li>
                </ul>
              </div>
            ) : (
              <button
                onClick={handleInstall}
                className="w-full bg-primary hover:bg-primary-hover text-white font-black py-2.5 rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 text-xs"
              >
                <Download className="w-4 h-4" />
                تثبيت التطبيق الآن
              </button>
            )}
            
            <button 
              onClick={handleDismiss}
              className="w-full text-text-muted hover:text-text-primary text-[10px] font-bold py-1 transition-colors"
            >
              ليس الآن، ربما لاحقاً
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
