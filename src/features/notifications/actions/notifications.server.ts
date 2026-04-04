'use server';

import { createClient } from '@/lib/supabase/server';
import { Notification } from '@/lib/notifications/types';

/**
 * Fetch the latest 20 notifications for the current authenticated user.
 */
export async function getRecentNotificationsAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: 'Unauthorized' };
  }

  // 1. Fetch raw notifications
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching notifications:', error);
    return { data: null, error: error.message };
  }

  // 2. Manual Join: Fetch actors for these notifications
  const actorIds = Array.from(new Set(notifications.filter(n => n.actor_id).map(n => n.actor_id)));
  
  if (actorIds.length > 0) {
    const { data: actors } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', actorIds);

    if (actors) {
      const actorMap = Object.fromEntries(actors.map(a => [a.id, a]));
      const enriched = notifications.map(n => ({
        ...n,
        actor: n.actor_id ? actorMap[n.actor_id] : null
      }));
      return { data: enriched as unknown as Notification[], error: null };
    }
  }

  return { data: notifications as unknown as Notification[], error: null };
}

/**
 * Mark a specific notification as read.
 */
export async function markNotificationAsReadAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    // Make sure users can only mark their own notifications as read
    .eq('user_id', user.id);

  if (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Mark all notifications for the current user as read.
 */
export async function markAllNotificationsAsReadAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Fetch archived notifications with offset-based pagination.
 */
export async function getArchivedNotificationsAction(page = 1, limit = 20) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { notifications: [], total: 0 };

  const offset = (page - 1) * limit;

  // 1. Fetch raw notifications with count
  const { data: notifications, count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('getArchivedNotifications error:', error);
    return { notifications: [], total: 0 };
  }

  // 2. Manual Join: Fetch actors
  const actorIds = Array.from(new Set(notifications.filter(n => n.actor_id).map(n => n.actor_id)));
  
  if (actorIds.length > 0) {
    const { data: actors } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', actorIds);

    if (actors) {
      const actorMap = Object.fromEntries(actors.map(a => [a.id, a]));
      const enriched = notifications.map(n => ({
        ...n,
        actor: n.actor_id ? actorMap[n.actor_id] : null
      }));
      return { 
        notifications: enriched as unknown as Notification[], 
        total: count || 0 
      };
    }
  }

  return { 
    notifications: (notifications || []) as unknown as Notification[], 
    total: count || 0 
  };
}
