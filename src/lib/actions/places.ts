'use server';

import { createServiceClient } from '../supabase/client-service';
import { unstable_cache, revalidateTag } from 'next/cache';
import { mapPlace } from '../utils/mappers';
import { keys, tags, CACHE_KEYS } from '@/lib/cache';
import { SortOption } from '../types/places';

async function basePlacesQuery(orderBy: string, ascending = false, limit = 20, offset = 0) {
    const supabase = createServiceClient();

    const { data, error } = await supabase
        .from('places')
        .select(`
            *,
            categories(name, icon),
            areas(name, districts(name)),
            reviews_count:reviews(count)
        `)
        .eq('status', 'approved')
        .order(orderBy, { ascending })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Error fetching places:', error);
        return [];
    }

    return (data || []).map(mapPlace);
}

/* =========================================================
   General Places (Paginated - 20 per page)
   Support for Category, Area, and Pagination
========================================================= */

export async function getPlaces(page = 1, categoryId?: number, areaId?: number, sortBy: SortOption = 'trending') {
    const limit = 20;
    const offset = (page - 1) * limit;

    return unstable_cache(
        async (p: number, cid: number | undefined, aid: number | undefined, sort: SortOption) => {
            const supabase = createServiceClient();
            let query = supabase
                .from('places')
                .select(`*, categories(name, icon), areas(name, districts(name)), reviews_count:reviews(count)`)
                .eq('status', 'approved');

            // Apply Filters
            if (cid) query = query.eq('category_id', cid);
            if (aid) query = query.eq('area_id', aid);

            // Apply Sorting
            switch (sort) {
                case 'name':
                    query = query.order('name', { ascending: true });
                    break;
                case 'newest':
                    query = query.order('created_at', { ascending: false });
                    break;
                case 'trending':
                default:
                    query = query.order('views_count', { ascending: false });
            }

            const { data, error } = await query.range(offset, offset + limit - 1);
            if (error) return [];
            return (data || []).map(mapPlace);
        },
        keys.placesPaginated(page, { categoryId, areaId, sortBy }),
        {
            tags: [
                tags.allPlaces(),
                tags.placesPage(page),
                ...(categoryId ? [tags.placesByCategory(categoryId.toString())] : []),
                ...(areaId ? [tags.placesByArea(areaId)] : [])
            ],
            revalidate: 172800 // 48 hours
        }
    )(page, categoryId, areaId, sortBy);
}

/* =========================================================
   All Places for Sitemap (Unpaginated)
========================================================= */

export async function getAllPlacesForSitemap() {
    return unstable_cache(
        async () => {
            const supabase = createServiceClient();
            const { data, error } = await supabase
                .from('places')
                .select('slug, created_at')
                .eq('status', 'approved')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching all places for sitemap:', error);
                return [];
            }
            return data;
        },
        ['all-places-sitemap'],
        { tags: [tags.allPlaces()], revalidate: 60 * 60 * 24 } // Revalidate once a day
    )();
}

/* =========================================================
   Trending & Newest (Parameterized Limit)
========================================================= */

export async function getTrendingPlaces(limit = 8) {
    return unstable_cache(
        async (l: number) => basePlacesQuery('views_count', false, l),
        keys.trending(limit),
        { tags: [tags.trendingPlaces(), tags.allPlaces()], revalidate: 172800 }
    )(limit);
}

export async function getNewPlaces(limit = 8) {
    return unstable_cache(
        async (l: number) => basePlacesQuery('created_at', false, l),
        keys.latest(limit),
        { tags: [tags.newestPlaces(), tags.allPlaces()], revalidate: 172800 }
    )(limit);
}

/* =========================================================
   Single Place By Slug (Cached)
========================================================= */

export async function getPlaceBySlug(slug: string) {
    const decodedSlug = decodeURIComponent(slug);
    return unstable_cache(
        async (s: string) => {
            const supabase = createServiceClient();
            const { data, error } = await supabase
                .from('places')
                .select(`*, categories(name, icon), areas(name, districts(name)), reviews_count:reviews(count)`)
                .eq('slug', s)
                .eq('status', 'approved')
                .single();

            if (error || !data) return null;
            return mapPlace(data);
        },
        keys.placeDetail(decodedSlug),
        { tags: [tags.place(decodedSlug), tags.allPlaces()], revalidate: false }
    )(decodedSlug);
}

/* =========================================================
   Related Places (Same Category, excluding current)
========================================================= */

export async function getRelatedPlaces(category: string, excludeId: string, limit = 6) {
    return unstable_cache(
        async (cat: string, eid: string, l: number) => {
            const supabase = createServiceClient();
            const { data, error } = await supabase
                .from('places')
                .select(`*, categories(name, icon), areas(name, districts(name)), reviews_count:reviews(count)`)
                .eq('category_id', (await supabase.from('categories').select('id').eq('name', cat).single()).data?.id)
                .neq('id', eid)
                .eq('status', 'approved')
                .order('avg_rating', { ascending: false })
                .limit(l);

            if (error) return [];
            return (data || []).map(mapPlace);
        },
        [`related-places-to-${excludeId}`],
        { tags: [tags.allPlaces()], revalidate: false }
    )(category, excludeId, limit);
}

/* =========================================================
   Home Page Data (8 Trending, 8 New - De-duplicated)
========================================================= */

export const getHomePageData = unstable_cache(
    async () => {
        // Fetch 20 trending and 20 recent to have enough for de-duplication
        const [trendingPotential, recentPotential] = await Promise.all([
            basePlacesQuery('views_count', false, 20),
            basePlacesQuery('created_at', false, 20)
        ]);

        // 1. Take top 8 trending
        const trending = trendingPotential.slice(0, 8);
        const trendingIds = new Set(trending.map(p => p.id));

        // 2. Take top 8 newest that are NOT in trending
        const newPlaces = recentPotential
            .filter(p => !trendingIds.has(p.id))
            .slice(0, 8);

        return { trending, newPlaces };
    },
    keys.homePage(),
    { tags: [tags.trendingPlaces(), tags.newestPlaces(), tags.allPlaces()], revalidate: 172800 }
);

export async function incrementPlaceViews(placeId: string) {
    const supabase = createServiceClient();
    const { error } = await supabase.rpc('increment_place_views', {
        target_place_id: placeId
    });

    if (!error) {
        // Target only the views cache part
        revalidateTag(tags.placeViews(placeId), 'max');
    }
    return { success: !error };
}