'use server';

import { unstable_cache, revalidateTag } from "next/cache";

import { tags } from "@/lib/cache";
import { createServiceClient } from "@/lib/supabase/client-service";
import { mapMarketAd, mapMarketCategory } from "@/lib/utils/mappers";
import { MarketAd } from "@/features/market/types";
import { createClient } from "@/lib/supabase/server";

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
    { tags: [tags.marketCategories(), 'categories'], revalidate: 7200 }
);

export async function getMarketCategoryBySlug(slug: string) {
    const supabase = createServiceClient();
    const { data, error } = await supabase
        .from('categories')
        .select(`id, name, slug, icon, listings(count)`)
        .eq('type', 'market')
        .eq('slug', slug)
        .maybeSingle();

    if (error || !data) return null;
    return mapMarketCategory(data);
}



// ── Ads (Listings) ──────────────────────────────────────────────────

export async function getMarketAds(
    page = 1,
    categoryId?: string,
    search?: string,
    limit = 20,
    excludeIds: string[] = [],
    areaId?: number,
    sortOption: 'newest' | 'cheapest' | 'expensive' | 'trending' = 'newest'
) {
    const offset = (page - 1) * limit;

    return unstable_cache(
        async (p: number, cid: string | undefined, q: string | undefined, exIds: string[], aId: number | undefined, sort: string) => {
            const supabase = createServiceClient();

            let selectStr = `
                *,
                categories(name, slug),
                areas(name),
                profiles(full_name, avatar_url),
                listing_daily_views(count, view_date)
            `;

            if (cid && cid !== 'all') {
                // Use !inner join to filter parents by category slug
                selectStr = `
                    *,
                    categories!inner(name, slug),
                    areas(name),
                    profiles(full_name, avatar_url),
                    listing_daily_views(count, view_date)
                `;
            }

            let query = supabase
                .from('listings')
                .select(selectStr, { count: 'exact' })
                .eq('status', 'active');

            if (cid && cid !== 'all') {
                query = query.eq('categories.slug', cid);
            }

            if (q && q.trim()) {
                query = query.ilike('title', `%${q.trim()}%`);
            }

            if (exIds && exIds.length > 0) {
                query = query.not('id', 'in', `(${exIds.join(',')})`);
            }

            if (aId) {
                query = query.eq('area_id', aId);
            }

            if (sort === 'cheapest') {
                query = query.order('price', { ascending: true });
            } else if (sort === 'expensive') {
                query = query.order('price', { ascending: false });
            } else if (sort === 'trending') {
                query = query.order('views_count', { ascending: false });
            } else {
                // Default to newest
                query = query.order('created_at', { ascending: false });
            }

            const { data, count, error } = await query
                .order('view_date', { foreignTable: 'listing_daily_views', ascending: false })
                .limit(1, { foreignTable: 'listing_daily_views' })
                .range(offset, offset + limit - 1);

            if (error) {
                console.error('getMarketAds DB error:', error);
                return { ads: [], total: 0 };
            }

            return {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ads: (data as any[] || []).map(mapMarketAd),
                total: count || 0
            };
        },
        [`market-ads-p${page}-cat${categoryId}-q${search}-ex${excludeIds.join(',')}-area${areaId}-sort${sortOption}`],
        {
            tags: [
                tags.allAds(),
                ...(categoryId && categoryId !== 'all' ? [tags.adsByCategory(categoryId)] : [])
            ],
            revalidate: 7200
        }
    )(page, categoryId, search, excludeIds, areaId, sortOption);
}

// ── Featured & Recent (Home Page) ───────────────────────────────────

async function baseMarketAdsQuery(orderBy: string, ascending = false, limit = 15) {
    const supabase = createServiceClient();

    const { data, error } = await supabase
        .from('listings')
        .select(`
            *,
            categories(name, slug),
            areas(name),
            profiles(full_name, avatar_url),
            listing_daily_views(count, view_date)
        `)
        .eq('status', 'active')
        .order(orderBy, { ascending })
        .order('view_date', { foreignTable: 'listing_daily_views', ascending: false })
        .limit(1, { foreignTable: 'listing_daily_views' })
        .limit(limit);

    if (error) {
        console.error(`Error fetching ads (${orderBy}):`, error);
        return [];
    }

    return (data || []).map(mapMarketAd);
}

export const getMarketHomePageData = unstable_cache(
    async () => {
        const [trendingPotential, latestPotential] = await Promise.all([
            baseMarketAdsQuery('views_count', false, 8),
            baseMarketAdsQuery('created_at', false, 8)
        ]);

        // 1. Take top 4 trending (most viewed)
        const trendingAds = trendingPotential.slice(0, 4);
        const trendingIds = new Set(trendingAds.map(ad => ad.id));

        // 2. Take top 4 latest — strictly no duplicates with trending
        const latestAds = latestPotential
            .filter(ad => !trendingIds.has(ad.id))
            .slice(0, 4);

        return { trendingAds, latestAds };
    },
    ['market-home-highlights'],
    { tags: [tags.allAds()], revalidate: 3600 }
);

// ── Single Ad ───────────────────────────────────────────────────────

export async function getMarketAdBySlug(slug: string): Promise<MarketAd | null> {
    return unstable_cache(
        async (adSlug: string): Promise<MarketAd | null> => {
            const decodedSlug = decodeURIComponent(adSlug);
            const supabase = createServiceClient();
            const { data, error } = await supabase
                .from('listings')
                .select(`
                    *,
                    categories(name, slug),
                    areas(name),
                    profiles(full_name, avatar_url),
                    listing_daily_views(count, view_date)
                `)
                .eq('slug', decodedSlug)
                .order('view_date', { foreignTable: 'listing_daily_views', ascending: false })
                .limit(1, { foreignTable: 'listing_daily_views' })
                .maybeSingle();

            if (error || !data) {
                // Fallback: Check if it's an ID
                const { data: byId } = await supabase.from('listings').select('slug').eq('id', decodedSlug).maybeSingle();
                if (byId) return getMarketAdBySlug(byId.slug);
                return null;
            }
            return mapMarketAd(data);
        },
        [`market-ad-v5-${slug}`],
        { tags: [tags.allAds(), `ad-v5-${slug}`], revalidate: 3600 }
    )(slug);
}

export async function getMarketAdById(id: string) {
    return unstable_cache(
        async (adId: string) => {
            const supabase = createServiceClient();
            const { data, error } = await supabase
                .from('listings')
                .select(`
                    *,
                    categories(name, slug),
                    areas(name),
                    profiles(full_name, avatar_url),
                    listing_daily_views(count, view_date)
                `)
                .eq('id', adId)
                .order('view_date', { foreignTable: 'listing_daily_views', ascending: false })
                .limit(1, { foreignTable: 'listing_daily_views' })
                .single();

            if (error || !data) return null;
            return mapMarketAd(data);
        },
        [`market-ad-${id}`],
        { tags: [tags.ad(id), tags.allAds()], revalidate: 7200 }
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
            areas(name),
            profiles(full_name, avatar_url),
            listing_daily_views(count, view_date)
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
        .order('view_date', { foreignTable: 'listing_daily_views', ascending: false })
        .limit(1, { foreignTable: 'listing_daily_views' });

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

    // Generate slug (matched to DB logic: title-with-dashes + last 5 chars of a random UUID)
    const baseSlug = (adData.title || 'ad')
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const slug = `${baseSlug}-${randomSuffix}`;

    const { data, error } = await serviceSupabase
        .from('listings')
        .insert({
            title: adData.title,
            slug: slug,
            description: adData.description,
            price: Number(adData.price),
            is_negotiable: adData.is_negotiable,
            condition: adData.condition,
            images: adData.images,
            category_id: adData.category_id,
            area_id: adData.area_id,
            seller_id: user.id,
            contact_phone: adData.seller_phone,
            status: 'active',
            public_ids: adData.public_ids
        })
        .select(`*, categories(slug)`)
        .single();

    if (error) {
        console.error('Error creating ad:', error);
        return { success: false, error: error.message };
    }

    // Revalidate relevant tags
    revalidateTag(tags.allAds(), 'max');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categories: any = (data as any).categories;
    const catSlug = Array.isArray(categories) ? categories[0]?.slug : categories?.slug;
    if (catSlug) {
        revalidateTag(tags.adsByCategory(catSlug), 'max');
        revalidateTag(tags.marketCategory(catSlug), 'max');
    }
    // Refresh the categories list so adCount is updated immediately
    revalidateTag(tags.marketCategories(), 'max');

    return { success: true, data: data };
}

export async function updateMarketAd(id: string, adData: Partial<MarketAd>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    const serviceSupabase = createServiceClient();

    // Verify ownership
    const { data: existingAd } = await serviceSupabase
        .from('listings')
        .select('seller_id')
        .eq('id', id)
        .single();

    if (!existingAd || existingAd.seller_id !== user.id) {
        return { success: false, error: 'Permission denied' };
    }

    const { data, error } = await serviceSupabase
        .from('listings')
        .update({
            title: adData.title,
            description: adData.description,
            price: Number(adData.price),
            is_negotiable: adData.is_negotiable,
            condition: adData.condition,
            images: adData.images, // Note: Expecting full array of URLs
            category_id: adData.category_id,
            area_id: adData.area_id,
            contact_phone: adData.seller_phone,
            public_ids: adData.public_ids
        })
        .eq('id', id)
        .select(`*, categories(slug)`)
        .single();

    if (error) {
        console.error('Error updating ad:', error);
        return { success: false, error: error.message };
    }
    // Revalidate relevant tags
    revalidateTag(tags.allAds(), 'max');
    revalidateTag(tags.ad(id), 'max');
    if (data?.slug) {
        revalidateTag(`ad-v5-${data.slug}`, 'max');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categories: any = (data as any).categories;
    const catSlug = Array.isArray(categories) ? categories[0]?.slug : categories?.slug;
    if (catSlug) {
        revalidateTag(tags.adsByCategory(catSlug), 'max');
        revalidateTag(tags.marketCategory(catSlug), 'max');
    }
    // Refresh the categories list so adCount is updated immediately
    revalidateTag(tags.marketCategories(), 'max');

    return { success: true, data: data };
}

export async function updateMarketAdStatus(id: string, newStatus: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    const serviceSupabase = createServiceClient();

    // Verify ownership
    const { data: existingAd } = await serviceSupabase
        .from('listings')
        .select('seller_id, categories(slug)')
        .eq('id', id)
        .single();

    if (!existingAd || existingAd.seller_id !== user.id) {
        return { success: false, error: 'Permission denied' };
    }

    const { data, error } = await serviceSupabase
        .from('listings')
        .update({
            status: newStatus
        })
        .eq('id', id)
        .select(`*, categories(slug)`)
        .single();

    if (error) {
        console.error('Error updating ad status:', error);
        return { success: false, error: error.message };
    }

    // Revalidate relevant tags
    revalidateTag(tags.allAds(), 'max');
    revalidateTag(tags.ad(id), 'max');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categories: any = (data as any).categories;
    const catSlug = Array.isArray(categories) ? categories[0]?.slug : categories?.slug;
    if (catSlug) {
        revalidateTag(tags.adsByCategory(catSlug), 'max');
    }

    return { success: true, data: data };
}

export async function incrementMarketAdView(id: string) {
    const supabase = createServiceClient();

    const { error } = await supabase.rpc('increment_listing_view', {
        l_id: id
    });

    if (error) {
        console.error('Error incrementing view:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function deleteMarketAd(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    const serviceSupabase = createServiceClient();

    // Check ownership first
    const { data: ad } = await serviceSupabase
        .from('listings')
        .select('seller_id, images, categories(slug)')
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

    // Revalidate relevant tags
    revalidateTag(tags.allAds(), 'max');
    revalidateTag(tags.ad(id), 'max');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categories: any = (ad as any).categories;
    const catSlug = Array.isArray(categories) ? categories[0]?.slug : categories?.slug;
    if (catSlug) {
        revalidateTag(tags.adsByCategory(catSlug), 'max');
        revalidateTag(tags.marketCategory(catSlug), 'max');
    }
    // Refresh the categories list so adCount is updated immediately
    revalidateTag(tags.marketCategories(), 'max');

    return { success: true };
}


// ── Sitemap ─────────────────────────────────────────────────────────

export async function getMarketAdsForSitemap() {
    const supabase = createServiceClient();
    const { data, error } = await supabase
        .from('listings')
        .select('slug, created_at, images')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('getMarketAdsForSitemap error:', error);
        return [];
    }

    return data || [];
}


// Redundant favorite functions removed in favor of unified favorites logic in favorites.ts
