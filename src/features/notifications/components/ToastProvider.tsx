'use client';

import React, { createContext, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Heart, Star, Bell, Info } from 'lucide-react';
import Link from 'next/link';

export type ToastType = 'COMMENT' | 'LIKE' | 'FAVORITE' | 'DEFAULT' | 'INFO';

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
    const toast = { ...options, id, type: options.type || 'DEFAULT', duration: options.duration || 5000 };
    
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
      
      {/* Toast Container */}
      <div className="fixed inset-0 pointer-events-none z-99999 flex flex-col items-center lg:items-end justify-end lg:justify-start p-4 lg:p-6 lg:pt-24 gap-3">
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
  const { id, title, message, type, link, actor, duration = 5000 } = toast;
  
  const getColors = () => {
    switch (type) {
      case 'COMMENT': return 'bg-blue-500/10 border-blue-500/20 text-blue-600';
      case 'LIKE': return 'bg-red-500/10 border-red-500/20 text-red-600';
      case 'FAVORITE': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600';
      case 'INFO': return 'bg-sky-500/10 border-sky-500/20 text-sky-600';
      default: return 'bg-primary/10 border-primary/20 text-primary';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'COMMENT': return <MessageSquare className="w-5 h-5" />;
      case 'LIKE': return <Heart className="w-5 h-5 fill-current" />;
      case 'FAVORITE': return <Star className="w-5 h-5 fill-current" />;
      case 'INFO': return <Info className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const Wrapper = link ? Link : 'div';
  const wrapperProps = link ? { href: link, onClick: () => onDismiss(id!) } : {};

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="pointer-events-auto w-full max-w-[380px] group relative"
    >
      <div className={`relative overflow-hidden backdrop-blur-md rounded-3xl border shadow-2xl transition-all hover:shadow-primary/10 ${getColors()}`}>
        <div className="p-4 flex items-start gap-4">
          {/* Avatar or Icon */}
          <div className="shrink-0 pt-1">
            {actor?.avatar_url ? (
              <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/50 shadow-sm">
                <img src={actor.avatar_url} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/40 shadow-sm`}>
                {getIcon()}
              </div>
            )}
          </div>

          <Wrapper {...(wrapperProps as any)} className="flex-1 min-w-0 pr-2">
            <h4 className="font-black text-sm tracking-tight mb-1 truncate">
              {title}
            </h4>
            <p className="text-xs font-bold opacity-80 leading-relaxed line-clamp-2">
              {message}
            </p>
          </Wrapper>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(id!);
            }}
            className="shrink-0 p-1 rounded-full hover:bg-black/5 transition-colors opacity-0 group-hover:opacity-100"
          >
            <X className="w-4 h-4 text-black/40" />
          </button>
        </div>

        {/* Progress Bar */}
        <motion.div 
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className="absolute bottom-0 left-0 h-1 bg-current opacity-20"
        />
      </div>
    </motion.div>
  );
};
