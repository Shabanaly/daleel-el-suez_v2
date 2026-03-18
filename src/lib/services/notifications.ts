import { createServiceClient } from '@/lib/supabase/client-service';

export type NotificationType = 'SYSTEM' | 'COMMUNITY' | 'MARKET' | 'DIRECTORY';

export interface CreateNotificationParams {
  userId: string;
  actorId?: string; // Track who triggered the notification
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
}

/**
 * Creates a notification in the database.
 * The Supabase trigger 'on_notification_created' will handle the push notification.
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceKey || !supabaseUrl) {
        console.error('[NotificationService] CRITICAL: Missing Supabase Service Role Key or URL in .env.local');
        return { success: false, error: 'Missing environment configuration' };
    }

    const supabase = createServiceClient();
    
    console.log(`[NotificationService] Attempting to save notification to DB for user: ${params.userId}`);

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        actor_id: params.actorId || null,
        title: params.title,
        message: params.message,
        type: params.type,
        link: params.link,
        is_read: false
      })
      .select()
      .single();

    if (error) {
      console.error('[NotificationService] Supabase Insert Error:', error.message);
      console.error('[NotificationService] Details:', error.details, error.hint);
      // If the error is related to the trigger, it often shows up in 'hint' or 'details'
      return { success: false, error };
    }

    console.log('[NotificationService] Notification saved successfully:', data.id);
    return { success: true, notification: data };
  } catch (err) {
    console.error('[NotificationService] Unexpected exception:', err);
    return { success: false, error: err };
  }
}
