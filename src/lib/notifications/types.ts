export enum NotificationEvent {
  COMMENT_ADDED = 'COMMENT_ADDED',
  COMMENT_REPLIED = 'COMMENT_REPLIED',
  POST_LIKED = 'POST_LIKED',
  PLACE_FAVORITED = 'PLACE_FAVORITED',
  PLACE_STATUS_UPDATED = 'PLACE_STATUS_UPDATED',
  COMMUNITY_INVITE = 'COMMUNITY_INVITE',
  ADD_PLACE_INVITE = 'ADD_PLACE_INVITE',
  APP_SHARE_REMINDER = 'APP_SHARE_REMINDER',
  GENERAL_RETENTION = 'GENERAL_RETENTION',
  SYSTEM_BROADCAST = 'SYSTEM_BROADCAST',
}

export type NotificationType = 'SYSTEM' | 'COMMUNITY' | 'MARKET' | 'DIRECTORY';

export interface NotificationPayload {
  userId: string | 'all';
  actorId?: string;
  actorName?: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  metadata?: Record<string, any>;
}

export interface EventData {
  [NotificationEvent.COMMENT_ADDED]: {
    postId: string;
    postTitle: string;
    actorName: string;
    recipientId: string;
    actorId: string;
  };
  [NotificationEvent.COMMENT_REPLIED]: {
    postId: string;
    postTitle: string;
    parentCommentId: string;
    actorName: string;
    recipientId: string; // صاحب التعليق الأصلي
    actorId: string;
  };
  [NotificationEvent.POST_LIKED]: {
    postId: string;
    postContent: string;
    actorName: string;
    recipientId: string;
    actorId: string;
  };
  [NotificationEvent.PLACE_FAVORITED]: {
    placeId: string;
    placeName: string;
    placeSlug: string;
    actorName: string;
    recipientId: string;
    actorId: string;
  };
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
}
