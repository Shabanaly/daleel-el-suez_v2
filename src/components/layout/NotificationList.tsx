'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Notification } from '@/lib/types/notifications';
import { Bell, Check, ExternalLink, Heart, MessageCircle, Star, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
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
  return 'bg-primary/10';
};

export const NotificationList = ({ notifications, onMarkAsRead, onClose }: NotificationListProps) => {
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

  return (
    <div className="divide-y divide-border-subtle max-h-[400px] overflow-y-auto">
      {notifications.map((notif) => {
        const Content = (
          <div className="flex gap-3">
            <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${getNotificationBg(notif.title, notif.type)}`}>
              {getNotificationIcon(notif.title, notif.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h4 className={`text-sm font-semibold truncate ${!notif.is_read ? 'text-text-primary' : 'text-text-muted'}`}>
                  {notif.title}
                </h4>
                <span className="text-[10px] text-text-muted whitespace-nowrap mr-2">
                  {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: ar })}
                </span>
              </div>
              <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                {notif.message}
              </p>
            </div>

            {!notif.is_read && (
              <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
            )}
          </div>
        );

        const commonClasses = `p-4 hover:bg-elevated transition-colors cursor-pointer group relative block ${!notif.is_read ? 'bg-primary/5' : ''}`;

        if (notif.link) {
          return (
            <Link 
              key={notif.id}
              href={notif.link}
              className={commonClasses}
              onClick={() => {
                if (!notif.is_read) onMarkAsRead(notif.id);
                onClose();
              }}
            >
              {Content}
            </Link>
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
};
