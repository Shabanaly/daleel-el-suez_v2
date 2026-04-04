import { createServiceClient } from '@/lib/supabase/client-service';
import { NotificationEvent, EventData, NotificationPayload } from './types';
import { NotificationTemplates } from './templates';

export class NotificationService {
  /**
   * Unified entry point to trigger notifications across the app.
   * Only events defined in NotificationTemplates (code-managed) can be triggered.
   */
  static async trigger<T extends keyof typeof NotificationTemplates>(
    event: T,
    data: EventData[T]
  ): Promise<{ success: boolean; error?: unknown }> {
    try {
      const templateFn = NotificationTemplates[event];
      if (!templateFn) {
        throw new Error(`Notification template for event ${event} not found`);
      }

      const payload = templateFn(data) as NotificationPayload;
      return await this.saveToDatabase(payload);
    } catch (err) {
      console.error(`[NotificationService] Error triggering ${event}:`, err);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Saves the notification to the database.
   * The Supabase trigger 'on_notification_created' handles the async push delivery.
   */
  private static async saveToDatabase(payload: NotificationPayload) {
    const supabase = createServiceClient();

    console.log(`[NotificationService] Saving notification for user: ${payload.userId}`);

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: payload.userId === 'all' ? null : payload.userId,
        actor_id: payload.actorId || null,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        link: payload.link,
        is_read: false,
        metadata: payload.metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error('[NotificationService] Database Insert Error:', error.message);
      return { success: false, error };
    }

    return { success: true, notification: data };
  }
}
