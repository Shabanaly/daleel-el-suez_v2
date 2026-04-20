'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X } from 'lucide-react';
import CustomLink from '@/components/customLink/customLink';
import { ROUTES } from '@/constants';

const COOKIE_CONSENT_KEY = 'daleel-cookie-consent';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show after a short delay to not overwhelm the UI immediately
      const timer = setTimeout(() => {
        // Defense mechanism: Do not show in AdSense preview or iframes
        try {
            if (window.self !== window.top) return;
        } catch {
            return; // Cross-origin security error means we are in an iframe
        }
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setIsVisible(false);
    window.dispatchEvent(new Event('daleel-cookie-choice-made'));
  };

  const handleDismiss = () => {
    setIsVisible(false);
    window.dispatchEvent(new Event('daleel-cookie-choice-made'));
    // We don't save 'accepted' here, so it will show again next session
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-24 lg:bottom-6 left-4 right-4 md:left-6 md:right-auto md:max-w-sm z-50 pointer-events-none"
      >
        <div className="pointer-events-auto bg-surface/90 backdrop-blur-xl border border-primary/10 shadow-2xl rounded-[28px] p-2 sm:p-4 flex items-center gap-3 relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full -mr-8 -mt-8 pointer-events-none blur-xl" />
          
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0 border border-primary/20">
            <Shield className="w-5 h-5 text-primary" />
          </div>

          <div className="flex-1 text-right min-w-0" dir="rtl">
            <h4 className="text-text-primary font-black text-[10px] sm:text-xs mb-0.5">خصوصيتك تهمنا 🛡️</h4>
            <p className="text-text-muted text-[9px] sm:text-[11px] leading-tight truncate sm:whitespace-normal">
              نستخدم ملفات تعريف الارتباط لتحسين تجربتك.
              <CustomLink href={ROUTES.PRIVACY} className="text-primary hover:underline font-black mr-1">
                التفاصيل
              </CustomLink>
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-[10px] sm:text-[11px] font-black rounded-full transition-all shadow-md active:scale-95"
            >
              موافق
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 text-text-muted hover:text-text-primary transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
