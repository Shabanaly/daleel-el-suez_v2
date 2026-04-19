/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidateTag } from 'next/cache';
import { tags } from '@/lib/cache';

export async function getAdminReports(page = 1, limit = 50, search?: string) {
    const supabase = createAdminClient();
    const offset = (page - 1) * limit;

    let query = supabase
        .from('reports')
        .select(`
            *,
            reporter:profiles!reporter_id(full_name, username)
        `, { count: 'exact' });

    if (search) {
        query = query.ilike('reason', `%${search}%`);
    }

    const { data: reports, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('getAdminReports error:', error);
        return { reports: [], total: 0 };
    }

    // Enhance reports with target data if needed (optional for UI)
    return {
        reports: reports || [],
        total: count || 0
    };
}

export async function updateReportStatusAdmin(id: string, status: string) {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('reports')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        console.error('updateReportStatusAdmin error:', error);
        return { success: false, error: error.message };
    }

    revalidateTag('admin-reports', 'max');
    return { success: true };
}

export async function deleteReportAdmin(id: string) {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('deleteReportAdmin error:', error);
        return { success: false, error: error.message };
    }

    revalidateTag('admin-reports', 'max');
    return { success: true };
}
