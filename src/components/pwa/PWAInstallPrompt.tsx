"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const STORAGE_KEY = 'pwa-prompt-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export default function PWAInstallPrompt() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Avoid cascading renders
    const timer = setTimeout(() => {
        setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkStandalone = () => {
      const win = window as unknown as { navigator: { standalone?: boolean } };
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        win.navigator.standalone ||
        document.referrer.includes('android-app://')
      );
    };

    const isIOSDevice = () => {
      const win = window as unknown as { MSStream?: unknown };
      return (
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !win.MSStream
      );
    };

    // Defer state updates to satisfy react-hooks/set-state-in-effect
    Promise.resolve().then(() => {
        setIsStandalone(checkStandalone());
        setIsIOS(isIOSDevice());
    });

    const checkVisibility = () => {
      const dismissedAt = localStorage.getItem(STORAGE_KEY);
      const cookieChoice = localStorage.getItem('daleel-cookie-consent');
      
      if (dismissedAt) {
        const now = Date.now();
        if (now - parseInt(dismissedAt) < DISMISS_DURATION) {
          return false;
        }
      }
      
      return !!cookieChoice;
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      
      if (checkVisibility()) {
        setTimeout(() => setIsVisible(true), 12000);
      }
    };

    if (isIOSDevice() && !checkStandalone() && checkVisibility()) {
      setTimeout(() => setIsVisible(true), 15000);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [mounted]);

  const handleInstall = async () => {
    if (!prompt) return;

    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  if (!mounted || isStandalone || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-24 left-4 right-4 z-50 lg:hidden"
      >
        <div className="bg-background/95 backdrop-blur-xl border border-primary/20 rounded-3xl p-4 shadow-2xl shadow-primary/10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-text-primary">ثبت تطبيق دليل السويس</h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                {isIOS 
                  ? 'اضغط على أيقونة المشاركة ثم "إضافة إلى الشاشة الرئيسية" لتجربة أفضل.'
                  : 'احصل على وصول أسرع وتجربة مستخدم أفضل بتثبيت التطبيق على جهازك.'}
              </p>
            </div>

            <button 
              onClick={handleDismiss}
              className="p-1 hover:bg-surface rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            {!isIOS && prompt && (
              <button
                onClick={handleInstall}
                className="flex-1 bg-primary text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Download className="w-4 h-4" />
                تثبيت الآن
              </button>
            )}
            {isIOS && (
              <div className="flex-1 bg-primary/5 text-primary text-[10px] font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 border border-primary/10">
                <Share className="w-3.5 h-3.5" />
                استخدم خيار &quot;إضافة للشاشة الرئيسية&quot;
              </div>
            )}
            <button
              onClick={handleDismiss}
              className="px-4 py-2.5 text-xs font-bold text-text-muted hover:text-text-primary transition-colors"
            >
              ليس الآن
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
