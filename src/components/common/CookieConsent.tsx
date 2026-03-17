'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X } from 'lucide-react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'daleel-cookie-consent';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show after a short delay to not overwhelm the UI immediately
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // We don't save 'accepted' here, so it will show again next session
    // unless the user clicks Accept. This is standard practice.
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-24 lg:bottom-6 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50"
      >
        <div className="bg-surface/95 backdrop-blur-md border border-border-subtle shadow-2xl rounded-2xl p-5 flex flex-col md:flex-row items-center gap-4 relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 pointer-events-none" />
          
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-primary" />
          </div>

          <div className="flex-1 text-right" dir="rtl">
            <h4 className="text-text-primary font-bold text-sm mb-1">خصوصيتك تهمنا 🛡️</h4>
            <p className="text-text-muted text-[11px] leading-relaxed">
              نحن نستخدم ملفات تعريف الارتباط (Cookies) لتحسين تجربة تصفحك وعرض إعلانات مخصصة لك. بضغطك على "موافق"، فإنك تقبل استخدامنا لها.
              {' '}
              <Link href="/privacy" className="text-primary hover:underline font-bold">
                اقرأ سياسة الخصوصية
              </Link>
            </p>
          </div>

          <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={handleAccept}
              className="flex-1 md:w-24 bg-primary hover:bg-primary-hover text-white text-[11px] font-black py-2 rounded-lg transition-all shadow-md active:scale-95"
            >
              موافق
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 md:w-24 bg-elevated/50 hover:bg-elevated text-text-muted text-[11px] font-bold py-2 rounded-lg transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
