'use server';

import { createServiceClient } from '@/lib/supabase/client-service';

export interface AdminNotificationPayload {
    title: string;
    message: string;
    type: string;
    link?: string;
    actor_id?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Sends a notification to all users with the 'admin' role.
 */
export async function notifyAdmins(payload: AdminNotificationPayload) {
    const supabase = createServiceClient();

    // 1. Fetch all admin user IDs
    const { data: admins, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

    if (fetchError) {
        console.error('Error fetching admins for notification:', fetchError);
        return { success: false, error: fetchError.message };
    }

    if (!admins || admins.length === 0) {
        console.warn('No admin users found to notify.');
        return { success: true, count: 0 };
    }

    // 2. Prepare notifications for all admins
    const notifications = admins.map(admin => ({
        user_id: admin.id,
        actor_id: payload.actor_id,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        link: payload.link,
        metadata: payload.metadata || {},
        is_read: false
    }));

    // 3. Insert notifications
    const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

    if (insertError) {
        console.error('Error inserting admin notifications:', insertError);
        return { success: false, error: insertError.message };
    }

    return { success: true, count: admins.length };
}
