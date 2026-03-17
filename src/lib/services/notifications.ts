import { createServiceClient } from '@/lib/supabase/client-service';

export type NotificationType = 'SYSTEM' | 'COMMUNITY' | 'MARKET' | 'DIRECTORY';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
}

/**
 * Creates a notification in the database.
 * The Supabase webhook will automatically trigger the push notification API.
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const supabase = createServiceClient();
    
    // Explicitly using the service client to bypass RLS for inserting notifications
    // as the actor (current user) is usually different from the recipient (userId)
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        link: params.link,
        is_read: false
      })
      .select()
      .single();

    if (error) {
      console.error('[NotificationService] Failed to create notification:', error);
      return { success: false, error };
    }

    return { success: true, notification: data };
  } catch (err) {
    console.error('[NotificationService] Unexpected error:', err);
    return { success: false, error: err };
  }
}
