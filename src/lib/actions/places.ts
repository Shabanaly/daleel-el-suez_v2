'use server';

import { createServiceClient } from '../supabase/client-service';
import { unstable_cache, revalidateTag } from 'next/cache';
import { mapPlace } from '../utils/mappers';
import { keys, tags, CACHE_KEYS } from '@/lib/cache';
import { SortOption } from '../types/places';

async function basePlacesQuery(orderBy: string, ascending = false, limit = 20, offset = 0) {
    const supabase = createServiceClient();

    // Fetch slightly more to account for potential filtering if some are missing images
    // although the query below should handle most cases
    const { data, error } = await supabase
        .from('places')
        .select(`
            *,
            categories(name, icon),
            areas(name, districts(name)),
            reviews_count:reviews(count)
        `)
        .eq('status', 'approved')
        .not('images', 'is', null)
        .order(orderBy, { ascending })
        .range(offset, offset + 49); // Fetch 50 items to ensure we have enough after filtering

    if (error) {
        console.error('Error fetching places:', error);
        return [];
    }

    // Filter out places with no images or empty images array
    const filtered = (data || [])
        .map(mapPlace)
        .filter(p => p.imageUrl && p.imageUrl.trim() !== '')
        .slice(0, limit);

    return filtered;
}

/* =========================================================
   General Places (Paginated - 20 per page)
   Support for Category, Area, and Pagination
========================================================= */

export async function getPlaces(page = 1, categoryId?: number, areaId?: number, sortBy: SortOption = 'trending', search?: string) {
    const limit = 20;
    const offset = (page - 1) * limit;

    return unstable_cache(
        async (p: number, cid: number | undefined, aid: number | undefined, sort: SortOption, q: string | undefined) => {
            const supabase = createServiceClient();
            
            // Standard selection with relations
            const selectStr = `
                *,
                categories(name, icon),
                areas(name, districts(name)),
                reviews_count:reviews(count)
            `;

            let query = supabase
                .from('places')
                .select(selectStr, { count: 'exact' })
                .eq('status', 'approved');

            // Apply Search if provided (Truly Genius Logic)
            if (q && q.trim()) {
                const term = q.trim();
                const terms = term.split(/\s+/).filter(t => t.length >= 1);
                
                // Helper to generate Arabic variations
                const getVariants = (t: string) => {
                    const variants = new Set([t]);
                    if (t.includes('ة')) variants.add(t.replace(/ة/g, 'ه'));
                    if (t.includes('ه')) variants.add(t.replace(/ه/g, 'ة'));
                    const normalizedAlef = t.replace(/[أإآ]/g, 'ا');
                    if (normalizedAlef !== t) variants.add(normalizedAlef);
                    return Array.from(variants);
                };

                const allVariants = terms.flatMap(getVariants);
                
                // 🧠 Step 1: Find matching entities in parallel to build a "Search Context"
                const [catResults, areaResults] = await Promise.all([
                    supabase.from('categories').select('id, name').or(allVariants.map(v => `name.ilike.%${v}%`).join(',')),
                    supabase.from('areas').select('id, name').or(allVariants.map(v => `name.ilike.%${v}%`).join(','))
                ]);

                // Map terms to the IDs they matched (for strict AND logic across entities)
                const termToMatchedIds = new Map<string, { catIds: number[], areaIds: number[] }>();
                terms.forEach(t => {
                    const variants = getVariants(t.toLowerCase());
                    const matchedCats = (catResults.data || []).filter(c => variants.some(v => c.name.toLowerCase().includes(v))).map(c => c.id);
                    const matchedAreas = (areaResults.data || []).filter(a => variants.some(v => a.name.toLowerCase().includes(v))).map(a => a.id);
                    termToMatchedIds.set(t, { catIds: matchedCats, areaIds: matchedAreas });
                });

                const allMatchedCatIds = (catResults.data || []).map(c => c.id);
                const allMatchedAreaIds = (areaResults.data || []).map(a => a.id);

                // 🧠 Step 2: Broad initial fetch (OR logic for breadth)
                const orConditions: string[] = [];
                allVariants.forEach(v => {
                    const pattern = `%${v}%`;
                    orConditions.push(`name.ilike.${pattern}`);
                    orConditions.push(`description.ilike.${pattern}`);
                    orConditions.push(`address.ilike.${pattern}`);
                });

                if (allMatchedCatIds.length > 0) orConditions.push(`category_id.in.(${allMatchedCatIds.join(',')})`);
                if (allMatchedAreaIds.length > 0) orConditions.push(`area_id.in.(${allMatchedAreaIds.join(',')})`);

                query = query.or(orConditions.join(','));

                // 🧠 Step 3: Fetch candidate pool for high-quality ranking
                const { data: rawData, count, error } = await query.range(0, 199);
                if (error || !rawData) return { places: [], total: 0 };

                const noiseWords = ['السويس', 'حي', 'منطقة', 'شارع', 'ش', 'مدينة', 'مساكن', 'محل', 'مركز', 'شركة'];

                // 🧠 Step 4: Weighted Relevance Ranking with Entity Intersection
                const ranked = rawData.map((place: any) => {
                    let totalScore = 0;
                    const matchedTermsCount = new Set<string>();
                    
                    const name = (place.name || '').toLowerCase();
                    const desc = (place.description || '').toLowerCase();
                    const addr = (place.address || '').toLowerCase();
                    const catId = place.category_id;
                    const areaId = place.area_id;
                    
                    terms.forEach(t => {
                        const lowT = t.toLowerCase();
                        const variants = getVariants(lowT);
                        const matchedIds = termToMatchedIds.get(t);
                        let bestTermScore = 0;
                        
                        variants.forEach(v => {
                            const isNoise = noiseWords.includes(v);
                            
                            // 1. Name Match (Super High Priority)
                            if (name === v) bestTermScore = Math.max(bestTermScore, isNoise ? 100 : 20000);
                            else if (name.includes(v)) bestTermScore = Math.max(bestTermScore, isNoise ? 50 : 10000);

                            // 2. Category Match (High Priority)
                            if (matchedIds?.catIds.includes(catId)) {
                                bestTermScore = Math.max(bestTermScore, 15000);
                            }

                            // 3. Area Match (Location Context)
                            if (matchedIds?.areaIds.includes(areaId)) {
                                bestTermScore = Math.max(bestTermScore, 5000);
                            }

                            // 4. Description/Address Match (Content match)
                            if (desc.includes(v)) bestTermScore = Math.max(bestTermScore, isNoise ? 1 : 200);
                            if (addr.includes(v)) bestTermScore = Math.max(bestTermScore, isNoise ? 1 : 100);
                        });

                        if (bestTermScore > 0) {
                            totalScore += bestTermScore;
                            matchedTermsCount.add(t);
                        }
                    });

                    // 🧠 Logic: Give MASSIVE boost only if ALL search terms are satisfied somehow
                    if (terms.length > 1) {
                        const matchRatio = matchedTermsCount.size / terms.length;
                        if (matchedTermsCount.size === terms.length) {
                            totalScore *= 50; // Total Subject + Location intersection
                        } else {
                            totalScore *= matchRatio; // Penalize results missing parts of the query
                        }
                    }

                    // Metadata bonus
                    if (place.images?.length > 0) totalScore += 20;
                    if (place.views_count > 0) totalScore += Math.log10(place.views_count + 1);

                    return { ...place, searchScore: totalScore };
                });

                ranked.sort((a, b) => b.searchScore - a.searchScore);

                const start = (p - 1) * limit;
                const paginatedData = ranked.slice(start, start + limit);

                return { 
                    places: paginatedData.map(mapPlace), 
                    total: count || ranked.length 
                };
            }

            // --- STANDARD PATH (No Search) ---
            if (cid) query = query.eq('category_id', cid);
            if (aid) query = query.eq('area_id', aid);

            // Apply Sorting
            switch (sort) {
                case 'name': query = query.order('name', { ascending: true }); break;
                case 'newest': query = query.order('created_at', { ascending: false }); break;
                case 'trending': 
                default: query = query.order('views_count', { ascending: false });
            }

            // For normal browsing, we STRICTLY require images to maintain site aesthetics
            const { data, count, error } = await query
                .not('images', 'is', null)
                .range(offset, offset + 59);
            
            if (error) {
                console.error('getPlaces error:', error);
                return { places: [], total: 0 };
            }
            
            const places = (data || [])
                .map(mapPlace)
                .filter(p => p.imageUrl && p.imageUrl.trim() !== '')
                .slice(0, limit);

            return { places, total: count || 0 };
        },
        keys.placesPaginated(page, { categoryId, areaId, sortBy, search }),
        {
            tags: [
                tags.allPlaces(),
                tags.placesPage(page),
                ...(categoryId ? [tags.placesByCategory(categoryId.toString())] : []),
                ...(areaId ? [tags.placesByArea(areaId)] : []),
                ...(search ? [`search-${search}`] : [])
            ],
            revalidate: 86400 // 24 hours
        }
    )(page, categoryId, areaId, sortBy, search);
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
        { tags: [tags.allPlaces()], revalidate: 86400 } // Revalidate once a day
    )();
}

/* =========================================================
   Place Views (Instant Fetch)
========================================================= */

export async function getPlaceViews(placeId: string) {
    return unstable_cache(
        async (id: string) => {
            const supabase = createServiceClient();
            const { data, error } = await supabase
                .from('places')
                .select('views_count')
                .eq('id', id)
                .single();

            if (error || !data) return 0;
            return data.views_count;
        },
        [`place-views-${placeId}`],
        { tags: [tags.placeViews(placeId)], revalidate: 60 } // Revalidate every minute
    )(placeId);
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
        { tags: [tags.place(decodedSlug), tags.allPlaces()], revalidate: 86400 }
    )(decodedSlug);
}

/* =========================================================
   Related Places (Same Category, excluding current)
========================================================= */

export async function getRelatedPlaces(categoryId: number | undefined, excludeId: string, limit = 6, categoryName?: string) {
    return unstable_cache(
        async (cid: number | undefined, eid: string, l: number, cname?: string) => {
            const supabase = createServiceClient();
            let query = supabase
                .from('places')
                .select(`*, categories(name, icon), areas(name, districts(name)), reviews_count:reviews(count)`)
                .neq('id', eid)
                .eq('status', 'approved')
                .not('images', 'is', null)
                .order('avg_rating', { ascending: false })
                .range(0, 49); // Fetch 50 candidates to ensure we find enough with valid images

            if (cid) {
                query = query.eq('category_id', cid);
            } else if (cname) {
                const { data: catData } = await supabase.from('categories').select('id').eq('name', cname).single();
                if (catData?.id) {
                    query = query.eq('category_id', catData.id);
                }
            }

            const { data, error } = await query;

            if (error) return [];
            
            return (data || [])
                .map(mapPlace)
                .filter(p => p.imageUrl && p.imageUrl.trim() !== '')
                .slice(0, 24); // Return up to 24 valid candidates to the client
        },
        // Cache key includes limit to distinguish different calls
        [`related-places-to-${excludeId}-limit-${limit}`],
        { tags: [tags.allPlaces(), tags.newestPlaces()], revalidate: 86400 }
    )(categoryId, excludeId, limit, categoryName);
}

/* =========================================================
   Home Page Data (8 Trending, 8 New - De-duplicated)
========================================================= */

export const getHomePageData = unstable_cache(
    async () => {
        // Fetch 40 trending and 40 recent to have enough for de-duplication and filtering
        const [trendingPotential, recentPotential] = await Promise.all([
            basePlacesQuery('views_count', false, 40),
            basePlacesQuery('created_at', false, 40)
        ]);

        // 1. Take top 20 trending
        const trending = trendingPotential.slice(0, 20);
        const trendingIds = new Set(trending.map(p => p.id));

        // 2. Take top 20 newest that are NOT in trending
        const newPlaces = recentPotential
            .filter(p => !trendingIds.has(p.id))
            .slice(0, 20);

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