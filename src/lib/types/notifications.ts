export type NotificationType = 'MARKET' | 'COMMUNITY' | 'SYSTEM' | 'DIRECTORY';

export interface Notification {
  id: string;
  user_id: string; // The user receiving the notification
  actor_id?: string | null; // The user who performed the action (optional)
  title: string;
  message: string;
  type: NotificationType;
  link?: string | null; // The URL to navigate to when clicked
  is_read: boolean;
  created_at: string;
}

export interface UserFCMToken {
  id: string;
  user_id: string;
  token: string;
  device_type?: string | null;
  created_at: string;
  updated_at: string;
}
