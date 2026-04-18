export enum NotificationEvent {
  // --- DATABASE MANAGED EVENTS (Do not trigger manually) ---
  PLACE_STATUS_UPDATED = 'PLACE_STATUS_UPDATED',
  NEW_COMMENT = 'NEW_COMMENT',
  NEW_REVIEW = 'NEW_REVIEW',

  // --- APPLICATION MANAGED EVENTS ---
  ADMIN_BROADCAST = 'ADMIN_BROADCAST',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  COMMUNITY_INVITE = 'COMMUNITY_INVITE',
  ADD_PLACE_INVITE = 'ADD_PLACE_INVITE',
  APP_SHARE_REMINDER = 'APP_SHARE_REMINDER',
  GENERAL_RETENTION = 'GENERAL_RETENTION',
  SYSTEM_BROADCAST = 'SYSTEM_BROADCAST',
  MILESTONE_REACHED = 'MILESTONE_REACHED',
  DAILY_RECAP = 'DAILY_RECAP',
  CONTENT_RETENTION = 'CONTENT_RETENTION',
  FRIDAY_BLESSING = 'FRIDAY_BLESSING',
}

export type NotificationType = 'SYSTEM' | 'COMMUNITY' | 'MARKET' | 'DIRECTORY' | 'MILESTONE' | 'RECAP' | 'RETENTION' | 'BLESSING';
export type NotificationStatus = 'READ' | 'UNREAD';

export interface Notification {
  id: string;
  user_id: string;
  actor_id?: string;
  actor?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationPayload {
  userId: string | 'all';
  actorId?: string;
  actorName?: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  metadata?: Record<string, unknown>;
}

export interface EventData {
  [NotificationEvent.PLACE_STATUS_UPDATED]: {
    placeId: string;
    placeName: string;
    status: 'approved' | 'rejected';
    actorName: string;
    recipientId: string;
    actorId: string;
    slug?: string;
  };
  [NotificationEvent.COMMUNITY_INVITE]: {
    recipientId: string;
  };
  [NotificationEvent.ADD_PLACE_INVITE]: {
    recipientId: string;
  };
  [NotificationEvent.APP_SHARE_REMINDER]: {
    recipientId: string;
  };
  [NotificationEvent.GENERAL_RETENTION]: {
    recipientId: string;
  };
  [NotificationEvent.SYSTEM_BROADCAST]: {
    title: string;
    message: string;
    link?: string;
  };
  [NotificationEvent.MILESTONE_REACHED]: {
    recipientId: string;
    contentName: string;
    milestone: number;
    link: string;
  };
  [NotificationEvent.DAILY_RECAP]: {
    recipientId: string;
    newViews: number;
    newLikes: number;
  };
  [NotificationEvent.CONTENT_RETENTION]: {
    recipientId: string;
    trendingTitle: string;
    trendingLink: string;
  };
  [NotificationEvent.FRIDAY_BLESSING]: {
    recipientId: string | 'all';
  };
}
