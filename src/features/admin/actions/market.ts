'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidateTag } from 'next/cache';
import { tags } from '@/lib/cache';
import { mapMarketAd } from '@/lib/utils/mappers';

export async function getAdminMarketAds(page = 1, limit = 50, search?: string) {
    const supabase = createAdminClient();
    const offset = (page - 1) * limit;

    let query = supabase
        .from('listings')
        .select(`
            *,
            categories(name, slug),
            areas(name),
            profiles(full_name, avatar_url)
        `, { count: 'exact' });

    if (search) {
        query = query.ilike('title', `%${search}%`);
    }

    const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('getAdminMarketAds error:', error);
        return { ads: [], total: 0 };
    }

    return {
        ads: (data || []).map(mapMarketAd),
        total: count || 0
    };
}

export async function deleteMarketAdAdmin(id: string) {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('deleteMarketAdAdmin error:', error);
        return { success: false, error: error.message };
    }

    revalidateTag(tags.allAds(), 'max');
    revalidateTag(tags.marketCategories(), 'max');
    
    return { success: true };
}

export async function updateMarketAdStatusAdmin(id: string, status: string) {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('listings')
        .update({ status })
        .eq('id', id);

    if (error) {
        console.error('updateMarketAdStatusAdmin error:', error);
        return { success: false, error: error.message };
    }

    revalidateTag(tags.allAds(), 'max');
    revalidateTag(tags.ad(id), 'max');
    
    return { success: true };
}
