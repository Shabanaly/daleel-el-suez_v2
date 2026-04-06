'use client';

import React, { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Notification } from '@/lib/notifications/types';
import { Bell, Heart, MessageCircle, Star, CheckCircle, XCircle, Trophy, BarChart3, Ghost, Sparkles } from 'lucide-react';
import CustomLink from '@/components/customLink/customLink';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
  className?: string;
}

const getNotificationIcon = (title: string, type: string) => {
  if (title.includes('إعجاب')) return <Heart className="w-5 h-5 text-red-500 fill-red-500" />;
  if (title.includes('تعليق')) return <MessageCircle className="w-5 h-5 text-blue-500" />;
  if (title.includes('للمفضلة')) return <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />;
  if (title.includes('قبول')) return <CheckCircle className="w-5 h-5 text-green-500" />;
  if (title.includes('رفض')) return <XCircle className="w-5 h-5 text-red-500" />;
  
  // Fallbacks based on type
  if (type === 'MARKET') return <Bell className="w-5 h-5 text-orange-600" />;
  if (type === 'COMMUNITY') return <Bell className="w-5 h-5 text-blue-600" />;
  if (type === 'MILESTONE') return <Trophy className="w-5 h-5 text-yellow-600" />;
  if (type === 'RECAP') return <BarChart3 className="w-5 h-5 text-purple-600" />;
  if (type === 'RETENTION') return <Ghost className="w-5 h-5 text-indigo-600" />;
  if (type === 'BLESSING') return <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />;

  return <Bell className="w-5 h-5 text-primary" />;
};

const getNotificationBg = (title: string, type: string) => {
  if (title.includes('إعجاب')) return 'bg-red-50';
  if (title.includes('تعليق')) return 'bg-blue-50';
  if (title.includes('للمفضلة')) return 'bg-yellow-50';
  if (title.includes('قبول')) return 'bg-green-50';
  if (title.includes('رفض')) return 'bg-red-50';
  
  if (type === 'MARKET') return 'bg-orange-100';
  if (type === 'COMMUNITY') return 'bg-blue-100';
  if (type === 'MILESTONE') return 'bg-yellow-50';
  if (type === 'RECAP') return 'bg-purple-50';
  if (type === 'RETENTION') return 'bg-indigo-50';
  if (type === 'BLESSING') return 'bg-amber-50';

  return 'bg-primary/10';
};

export const NotificationList = memo(function NotificationList({ notifications, onMarkAsRead, onClose, className }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-12 h-12 bg-elevated rounded-full flex items-center justify-center mb-3">
          <Bell className="w-6 h-6 text-text-muted" />
        </div>
        <p className="text-text-primary font-medium">لا توجد إشعارات حالياً</p>
        <p className="text-text-muted text-sm mt-1">سنخطرك عندما يكون هناك شيء جديد</p>
      </div>
    );
  }

  const isCompact = className?.includes('divide-y');

  return (
    <div className={`${isCompact ? 'divide-y divide-border-subtle' : 'space-y-4'} ${className || ''}`}>
      {notifications.map((notif) => {
        const Content = (
          <div className="flex gap-4 items-start">
            {/* Actor Avatar / Icon */}
            <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center overflow-hidden shadow-sm ${getNotificationBg(notif.title, notif.type)}`}>
              {notif.actor?.avatar_url ? (
                <img 
                  src={notif.actor.avatar_url} 
                  alt={notif.actor.full_name || 'User'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="p-2.5">
                  {getNotificationIcon(notif.title, notif.type)}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0 py-1">
              <div className="flex justify-between items-center mb-1.5">
                <h4 className={`text-sm font-black truncate tracking-tight ${!notif.is_read ? 'text-text-primary' : 'text-text-muted'}`}>
                  {notif.title}
                </h4>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-[11px] font-bold text-text-muted opacity-70 whitespace-nowrap">
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: ar })}
                  </span>
                  {!notif.is_read && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm shadow-primary/50" />
                  )}
                </div>
              </div>
              <p className={`text-sm leading-relaxed ${!notif.is_read ? 'text-text-secondary font-medium' : 'text-text-muted font-normal'}`}>
                {notif.message}
              </p>
            </div>
          </div>
        );

        const commonClasses = isCompact
          ? `p-5 hover:bg-elevated transition-all duration-300 cursor-pointer group relative block ${!notif.is_read ? 'bg-primary/[0.03]' : ''}`
          : `p-5 bg-surface rounded-3xl border border-border-subtle hover:border-primary/30 hover:shadow-md transition-all duration-300 cursor-pointer group relative block ${!notif.is_read ? 'border-primary/20 bg-primary/[0.02]' : ''}`;

        if (notif.link) {
          return (
            <CustomLink 
              key={notif.id}
              href={notif.link}
              className={commonClasses}
              onClick={() => {
                if (!notif.is_read) onMarkAsRead(notif.id);
                onClose();
              }}
            >
              {Content}
            </CustomLink>
          );
        }

        return (
          <div 
            key={notif.id}
            className={commonClasses}
            onClick={() => {
              if (!notif.is_read) onMarkAsRead(notif.id);
            }}
          >
            {Content}
          </div>
        );
      })}
    </div>
  );
});
