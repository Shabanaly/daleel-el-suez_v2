'use server';

import { createServiceClient } from '../supabase/client-service';
import { unstable_cache } from 'next/cache';

/* =========================================================
   Shared Mapper (Single Source of Truth)
========================================================= */

import { mapPlace } from '../utils/mappers';

async function basePlacesQuery(orderBy: string, ascending = false, limit = 20) {
    const supabase = createServiceClient();

    const { data, error } = await supabase
        .from('places')
        .select(`
            *,
            categories(name, icon),
            areas(name, districts(name)),
            reviews_count:reviews(count)
        `)
        .order(orderBy, { ascending })
        .limit(limit);

    if (error) {
        console.error('Error fetching places:', error);
        return [];
    }

    return (data || []).map(mapPlace);
}

/* =========================================================
   General Places (Default = Top Rated)
========================================================= */

export const getPlaces = unstable_cache(
    async () => basePlacesQuery('avg_rating', false, 100),
    ['places-list'],
    { tags: ['places'], revalidate: 3600 }
);

/* =========================================================
   New Places (Latest)
========================================================= */

export const getNewPlaces = unstable_cache(
    async () => basePlacesQuery('created_at', false, 20),
    ['new-places'],
    { tags: ['places'], revalidate: 3600 }
);

/* =========================================================
   Trending Places (By Views)
   Requires views_count column - Falling back to rating if missing
========================================================= */

export const getTrendingPlaces = unstable_cache(
    async () => {
        const supabase = createServiceClient();
        const { data, error } = await supabase
            .from('places')
            .select(`*, categories(name, icon), areas(name, districts(name)), reviews_count:reviews(count)`)
            .order('views_count', { ascending: false })
            .order('avg_rating', { ascending: false })
            .limit(6);

        if (error) {
            // Fallback if views_count doesn't exist
            return basePlacesQuery('avg_rating', false, 6);
        }
        return (data || []).map(mapPlace);
    },
    ['trending-places'],
    { tags: ['places'], revalidate: 3600 }
);

/* =========================================================
   Single Place By Slug (Cached)
========================================================= */

export async function getPlaceBySlug(slug: string) {
    const decodedSlug = decodeURIComponent(slug);
    const cached = unstable_cache(
        async (s: string) => {
            const supabase = createServiceClient();
            const { data, error } = await supabase
                .from('places')
                .select(`*, categories(name, icon), areas(name, districts(name)), reviews_count:reviews(count)`)
                .eq('slug', s)
                .single();

            if (error || !data) return null;
            return mapPlace(data);
        },
        [`place-${decodedSlug}`],
        { tags: [`place-${decodedSlug}`, 'places'], revalidate: 3600 }
    );
    return cached(decodedSlug);
}

/* =========================================================
   Related Places (Cached)
========================================================= */

export const getRelatedPlaces = unstable_cache(
    async (categoryName: string, excludeId: string) => {
        const supabase = createServiceClient();
        const { data, error } = await supabase
            .from('places')
            .select(`*, categories!inner(name, icon), areas(name, districts(name))`)
            .eq('categories.name', categoryName)
            .neq('id', excludeId)
            .order('avg_rating', { ascending: false })
            .limit(3);

        if (error || !data) return [];
        return data.map(mapPlace);
    },
    ['related-places'],
    { tags: ['places'], revalidate: 3600 }
);

/* =========================================================
   Increment Place Views (RPC)
========================================================= */

/* =========================================================
   Home Page Data (Combined & De-duplicated)
========================================================= */

export const getHomePageData = unstable_cache(
    async () => {
        // Fetch both in parallel
        // We fetch more (50) for allRecent to ensure we have enough even after de-duplication
        const [trendingPlaces, allRecent] = await Promise.all([
            getTrendingPlaces(),
            basePlacesQuery('created_at', false, 50)
        ]);

        // De-duplicate: New places should not contain trending ones
        const trendingIds = new Set(trendingPlaces.map(p => p.id));
        const newPlaces = allRecent
            .filter(p => !trendingIds.has(p.id))
            .slice(0, 6);

        return {
            trending: trendingPlaces.slice(0, 2), // Desktop requirement: show top 2
            newPlaces
        };
    },
    ['home-page-data'],
    { tags: ['places', 'areas', 'categories'], revalidate: 3600 }
);

export async function incrementPlaceViews(placeId: string) {
    const supabase = createServiceClient();
    const { error } = await supabase.rpc('increment_place_views', {
        target_place_id: placeId
    });

    if (error) {
        console.error('Error incrementing views:', error);
        return { success: false, error };
    }

    return { success: true };
}