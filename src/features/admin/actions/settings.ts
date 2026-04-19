'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidateTag } from 'next/cache';

export async function getSystemSettings() {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .single();

    if (error) {
        console.error('getSystemSettings error:', error);
        // Default values if table doesn't exist
        return {
            maintenance_mode: false,
            site_title: 'دليل السويس',
            site_description: 'المرجع الأول لمدينة السويس',
            allowed_registrations: true
        };
    }

    return data;
}

export async function updateSystemSettings(settings: Record<string, unknown>) {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('system_settings')
        .upsert({ 
            id: 1, // Single row configuration
            ...settings, 
            updated_at: new Date().toISOString() 
        });

    if (error) {
        console.error('updateSystemSettings error:', error);
        return { success: false, error: error.message };
    }

    revalidateTag('system-settings', 'max');
    return { success: true };
}
