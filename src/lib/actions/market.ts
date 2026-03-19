'use server';

import { unstable_cache, revalidateTag } from "next/cache";
import { createServiceClient } from "../supabase/client-service";
import { createClient } from "../supabase/server";
import { mapMarketAd, mapMarketCategory } from "../utils/mappers";
import { MarketAd } from "../types/market";

// ── Categories ──────────────────────────────────────────────────────

async function getMarketCategoriesInternal() {
    const supabase = createServiceClient();
    const { data, error } = await supabase
        .from('categories')
        .select(`
            id,
            name,
            slug,
            icon,
            listings(count)
        `)
        .eq('type', 'market');

    if (error) {
        console.error('Error fetching market categories:', error);
        return [];
    }

    return (data || []).map(mapMarketCategory);
}

export const getMarketCategories = unstable_cache(
    getMarketCategoriesInternal,
    ['market-categories'],
    { tags: ['market-categories', 'categories'], revalidate: 3600 }
);

// ── Ads (Listings) ──────────────────────────────────────────────────

export async function getMarketAds(
    page = 1, 
    categoryId?: string, 
    search?: string, 
    limit = 20
) {
    const offset = (page - 1) * limit;

    return unstable_cache(
        async (p: number, cid: string | undefined, q: string | undefined) => {
            const supabase = createServiceClient();
            
            let query = supabase
                .from('listings')
                .select(`
                    *,
                    categories(name, slug),
                    areas(name)
                `, { count: 'exact' })
                .eq('status', 'active');

            if (cid && cid !== 'all') {
                query = query.eq('category_id', cid);
            }

            if (q && q.trim()) {
                query = query.ilike('title', `%${q.trim()}%`);
            }

            const { data, count, error } = await query
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                console.error('getMarketAds error:', error);
                return { ads: [], total: 0 };
            }

            return { 
                ads: (data || []).map(mapMarketAd), 
                total: count || 0 
            };
        },
        [`market-ads-p${page}-cat${categoryId}-q${search}`],
        { 
            tags: ['market-ads', ...(categoryId ? [`market-cat-${categoryId}`] : [])], 
            revalidate: 60 
        }
    )(page, categoryId, search);
}

// ── Single Ad ───────────────────────────────────────────────────────

export async function getMarketAdById(id: string) {
    return unstable_cache(
        async (adId: string) => {
            const supabase = createServiceClient();
            const { data, error } = await supabase
                .from('listings')
                .select(`
                    *,
                    categories(name, slug),
                    areas(name)
                `)
                .eq('id', adId)
                .single();

            if (error || !data) return null;
            return mapMarketAd(data);
        },
        [`market-ad-${id}`],
        { tags: [`market-ad-${id}`, 'market-ads'], revalidate: 3600 }
    )(id);
}

export async function getUserMarketAds() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const serviceSupabase = createServiceClient();
    const { data, error } = await serviceSupabase
        .from('listings')
        .select(`
            *,
            categories(name, slug),
            areas(name)
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('getUserMarketAds error:', error);
        return [];
    }

    return (data || []).map(mapMarketAd);
}

// ── Mutations ───────────────────────────────────────────────────────

export async function createMarketAd(adData: Partial<MarketAd>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    const serviceSupabase = createServiceClient();
    
    const { data, error } = await serviceSupabase
        .from('listings')
        .insert({
            title: adData.title,
            description: adData.description,
            price: Number(adData.price),
            condition: adData.condition,
            images: adData.images,
            category_id: adData.category_id,
            area_id: adData.area_id,
            seller_id: user.id,
            seller_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
            seller_phone: adData.seller_phone,
            status: 'active',
            public_ids: adData.images 
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating ad:', error);
        return { success: false, error: error.message };
    }

    revalidateTag('market-ads', 'page');
    if (adData.category_id) {
        revalidateTag(`market-cat-${adData.category_id}`, 'page');
    }

    return { success: true, data: data };
}

export async function deleteMarketAd(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    const serviceSupabase = createServiceClient();
    
    // Check ownership first
    const { data: ad } = await serviceSupabase
        .from('listings')
        .select('seller_id, images')
        .eq('id', id)
        .single();

    if (!ad || ad.seller_id !== user.id) {
        return { success: false, error: 'Permission denied' };
    }

    const { error } = await serviceSupabase
        .from('listings')
        .delete()
        .eq('id', id);

    if (error) return { success: false, error: error.message };

    revalidateTag('market-ads', 'page');
    revalidateTag(`market-ad-${id}`, 'page');

    return { success: true };
}


// Redundant favorite functions removed in favor of unified favorites logic in favorites.ts
