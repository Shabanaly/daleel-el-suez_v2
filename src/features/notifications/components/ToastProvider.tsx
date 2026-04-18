'use client';

import React, { createContext, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Heart, Star, Bell, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import CustomLink from '@/components/customLink/customLink';

export type ToastType = 'COMMENT' | 'LIKE' | 'FAVORITE' | 'DEFAULT' | 'INFO' | 'SUCCESS' | 'ERROR';

export interface ToastOptions {
  id?: string;
  title: string;
  message: string;
  type?: ToastType;
  duration?: number;
  link?: string;
  actor?: {
    avatar_url?: string;
    full_name?: string;
  };
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  dismissToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    const id = options.id || Math.random().toString(36).substring(2, 9);
    const toast = { ...options, id, type: options.type || 'DEFAULT', duration: options.duration || 4000 };
    
    setToasts((prev) => [toast, ...prev].slice(0, 3)); // Keep last 3

    if (toast.duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, toast.duration);
    }
  }, [dismissToast]);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      
      {/* 📍 Professional Top-Center Placement */}
      <div className="fixed top-6 lg:top-10 left-1/2 -translate-x-1/2 pointer-events-none z-99999 flex flex-col items-center w-full px-4 gap-2.5 max-w-[420px]">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastNotification key={toast.id} toast={toast} onDismiss={dismissToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastNotification = ({ toast, onDismiss }: { toast: ToastOptions; onDismiss: (id: string) => void }) => {
  const { id, title, message, type, link, actor, duration = 4000 } = toast;
  
  // Map types to CSS variables for dynamic theme matching
  const getStatusColor = () => {
    switch (type) {
      case 'SUCCESS': return 'var(--color-success)';
      case 'ERROR': return 'var(--color-error)';
      case 'INFO': return 'var(--color-info)';
      case 'LIKE': return '#f43f5e'; // Rose color for likes
      case 'FAVORITE': return 'var(--color-warning)'; // Using warning/yellow for favorites/stars
      case 'COMMENT': return 'var(--primary)';
      default: return 'var(--text-muted)';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 className="w-5 h-5 md:w-5.5 md:h-5.5" />;
      case 'ERROR': return <AlertCircle className="w-5 h-5 md:w-5.5 md:h-5.5" />;
      case 'INFO': return <Info className="w-5 h-5 md:w-5.5 md:h-5.5" />;
      case 'COMMENT': return <MessageSquare className="w-5 h-5 md:w-5.5 md:h-5.5" />;
      case 'LIKE': return <Heart className="w-5 h-5 md:w-5.5 md:h-5.5 fill-current" />;
      case 'FAVORITE': return <Star className="w-5 h-5 md:w-5.5 md:h-5.5 fill-current" />;
      default: return <Bell className="w-5 h-5 md:w-5.5 md:h-5.5" />;
    }
  };

  const Wrapper = link ? CustomLink : 'div';
  const wrapperProps = link ? { href: link, onClick: () => onDismiss(id!) } : {};

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.96, transition: { duration: 0.2 } }}
      className="pointer-events-auto w-full group relative"
    >
      <div 
        className="relative rounded-xl border border-border-subtle shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] transition-all hover:scale-[1.01] overflow-hidden"
        style={{ 
          backgroundColor: 'color-mix(in srgb, var(--surface) 95%, transparent)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Accent Bar */}
        <div 
          className="absolute top-0 right-0 w-1.5 h-full opacity-80"
          style={{ backgroundColor: getStatusColor() }}
        />

        <div className="p-3 md:p-4 pr-5 md:pr-6 flex items-center gap-3.5">
          {/* Avatar or Icon */}
          <div className="shrink-0">
            {actor?.avatar_url ? (
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden ring-2 ring-border-subtle shadow-sm">
                <img src={actor.avatar_url} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div 
                className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center shadow-sm"
                style={{ backgroundColor: 'color-mix(in srgb, var(--base) 50%, transparent)', color: getStatusColor() }}
              >
                {getIcon()}
              </div>
            )}
          </div>

          <Wrapper {...(wrapperProps as any)} className="flex-1 min-w-0">
            <h4 className="font-black text-[13px] md:text-sm tracking-tight mb-0.5" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h4>
            <p className="text-[11px] md:text-xs font-bold leading-relaxed line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
              {message}
            </p>
          </Wrapper>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(id!);
            }}
            className="shrink-0 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all text-text-muted hover:text-text-primary"
          >
            <X className="w-4 h-4 opacity-50" />
          </button>
        </div>

        {/* Progress Bar */}
        <motion.div 
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className="absolute bottom-0 right-0 h-[2.5px] opacity-40"
          style={{ backgroundColor: getStatusColor() }}
        />
      </div>
    </motion.div>
  );
};
