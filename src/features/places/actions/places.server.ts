'use server';

import { createServiceClient } from '@/lib/supabase/client-service';
import { unstable_cache, revalidateTag } from 'next/cache';
import { mapPlace } from '@/lib/utils/mappers';
import { keys, tags } from '@/lib/cache';
import { SortOption, RawPlace } from '@/features/places/types';

async function basePlacesQuery(orderBy: string, ascending = false, limit = 20, offset = 0) {
    const supabase = createServiceClient();

    // Fetch slightly more to account for potential filtering if some are missing images
    // although the query below should handle most cases
    const { data, error } = await supabase
        .from('places')
        .select(`
            *,
            categories(name, icon, slug),
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
                categories(name, icon, slug),
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
                
                // Helper to generate Arabic variations comprehensively
                const getVariants = (t: string) => {
                    let strings = [t];
                    
                    // 1. Alef normalizations
                    if (/[أإآ]/.test(t)) {
                        strings.push(t.replace(/[أإآ]/g, 'ا'));
                    }
                    
                    // 2. Teh Marbuta / Heh normalizations
                    const temps1: string[] = [];
                    strings.forEach(s => {
                        temps1.push(s);
                        if (s.includes('ة')) temps1.push(s.replace(/ة/g, 'ه'));
                        if (s.includes('ه')) temps1.push(s.replace(/ه/g, 'ة'));
                    });
                    strings = temps1;
                    
                    // 3. Yeh / Alef Maksura normalizations (ي/ى)
                    const temps2: string[] = [];
                    strings.forEach(s => {
                        temps2.push(s);
                        if (s.endsWith('ي')) temps2.push(s.replace(/ي$/, 'ى'));
                        if (s.endsWith('ى')) temps2.push(s.replace(/ى$/, 'ي'));
                    });
                    strings = temps2;

                    return Array.from(new Set(strings));
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

                // 🧠 Step 3: Fetch candidate pool for high-quality ranking (Max 200 items)
                const maxResults = 200;
                const { data: rawData, count, error } = await query.range(0, maxResults - 1);
                if (error || !rawData) return { places: [], total: 0 };

                const noiseWords = ['السويس', 'حي', 'منطقة', 'شارع', 'ش', 'مدينة', 'مساكن', 'محل', 'مركز', 'شركة'];

                // 🧠 Step 4: Weighted Relevance Ranking with Entity Intersection
                const ranked = (rawData as unknown as RawPlace[]).map((place) => {
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
                            if (typeof catId === 'number' && matchedIds?.catIds.includes(catId)) {
                                bestTermScore = Math.max(bestTermScore, 15000);
                            }

                            // 3. Area Match (Location Context)
                            if (typeof areaId === 'number' && matchedIds?.areaIds.includes(areaId)) {
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
                    if (Array.isArray(place.images) && place.images.length > 0) totalScore += 20;
                    if (typeof place.views_count === 'number' && place.views_count > 0) totalScore += Math.log10(place.views_count + 1);

                    return { ...place, searchScore: totalScore };
                });

                // Sort by highest confidence scores first
                ranked.sort((a, b) => b.searchScore - a.searchScore);

                // Paginate safely
                const start = (page - 1) * limit;
                const paginatedData = ranked.slice(start, start + limit);
                
                // CRITICAL FIX: Ensure total places promised doesn't exceed the max pool we fetched
                // otherwise clicking page 11+ on a very broad search will show empty results
                const actualTotal = Math.min(count || ranked.length, maxResults);

                return { 
                    places: paginatedData.map(mapPlace), 
                    total: actualTotal 
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
                .select('slug, created_at, images')
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
   Top Rated Places (Best of Category)
========================================================= */

export async function getTopPlacesByCategory(categoryId?: string | number, limit = 10) {
    return unstable_cache(
        async (cid: string | number | undefined, l: number) => {
            const supabase = createServiceClient();
            let query = supabase
                .from('places')
                .select(`
                    *,
                    categories(name, icon, slug),
                    areas(name, districts(name)),
                    reviews_count:reviews(count)
                `)
                .eq('status', 'approved')
                .not('images', 'is', null)
                .order('avg_rating', { ascending: false })
                .order('reviews_count', { ascending: false })
                .range(0, l + 10); // Fetch more to ensure we have enough after image filtering

            if (cid) {
                query = query.eq('category_id', Number(cid));
            }

            const { data, error } = await query;
            if (error) return [];

            return (data || [])
                .map(mapPlace)
                .filter(p => p.imageUrl && p.imageUrl.trim() !== '')
                .slice(0, l);
        },
        [`top-places-${categoryId || 'all'}-limit-${limit}`],
        { tags: [tags.allPlaces(), tags.trendingPlaces()], revalidate: 86400 }
    )(categoryId, limit);
}

/* =========================================================
   Global Stats for "Best of" Section
========================================================= */


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
                .select(`*, categories(name, icon, slug), areas(name, districts(name)), reviews_count:reviews(count)`)
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

export async function getRelatedPlaces(categoryId: number | undefined, excludeId: string, areaName: string | undefined = undefined, limit = 6, categoryName?: string) {
    return unstable_cache(
        async (cid: number | undefined, eid: string, aname: string | undefined, l: number, cname?: string) => {
            const supabase = createServiceClient();
            
            // Resolve Category ID if not provided
            let finalCatId = cid;
            if (!finalCatId && cname) {
                const { data: catData } = await supabase.from('categories').select('id').eq('name', cname).single();
                finalCatId = catData?.id;
            }

            if (!finalCatId) return [];

            // ── Approach: Fetch Candidates and Score them (Hyper-Local + Quality) ──
            const { data, error } = await supabase
                .from('places')
                .select(`*, categories(name, icon, slug), areas(name, districts(name)), reviews_count:reviews(count)`)
                .eq('category_id', finalCatId)
                .neq('id', eid)
                .eq('status', 'approved')
                .not('images', 'is', null)
                .range(0, 49); // Fetch 50 candidates

            if (error || !data) return [];
            
            // ── Scoring System ──
            const scoredCandidates = data.map(p => {
                let score = 0;
                
                // 1. Proximity Bonus (Hyper-Local using area name)
                const mappedPlace = mapPlace(p);
                if (aname && mappedPlace.area === aname) {
                    score += 50000; // MASSIVE boost for same area
                }
                
                // 2. Quality & Popularity Bonus
                const rating = Number(p.avg_rating) || 0;
                let reviews = 0;
                if (Array.isArray(p.reviews_count) && p.reviews_count.length > 0) {
                    reviews = Number(p.reviews_count[0].count);
                } else if (typeof p.reviews_count === 'number') {
                    reviews = p.reviews_count;
                }
                const views = Number(p.views_count) || 0;
                
                // Score = (Rating * 100) + (Reviews * 5) + (Views * 0.1)
                score += (rating * 100) + (reviews * 5) + (views * 0.1);
                
                return { place: mappedPlace, score };
            });

            // Sort by Intelligent Score
            scoredCandidates.sort((a, b) => b.score - a.score);

            // Filter out places with no images and return top Limit
            return scoredCandidates
                .map(item => item.place)
                .filter(p => p.imageUrl && p.imageUrl.trim() !== '')
                .slice(0, l); // Return exact limit
        },
        // Cache key includes area name to distinguish different contexts
        [`related-places-to-${excludeId}-area-${areaName || 'none'}-limit-${limit}`],
        { tags: [tags.allPlaces(), tags.newestPlaces()], revalidate: 86400 }
    )(categoryId, excludeId, areaName, limit, categoryName);
}

/* =========================================================
   Helper: Interleave Places by Category (Diversity Logic) 🧠
   Ensures the UI shows a mix of categories instead of just one.
========================================================= */

function interleavePlacesByCategory(places: any[], limit: number): any[] {
    if (!places.length) return [];
    
    // 1. Group by category
    const buckets = new Map<number, any[]>();
    places.forEach(p => {
        const cid = p.categoryId || 0;
        if (!buckets.has(cid)) buckets.set(cid, []);
        buckets.get(cid)!.push(p);
    });

    const result: any[] = [];
    const categoryIds = Array.from(buckets.keys());
    
    // 2. Round-robin picking
    let hasMore = true;
    let round = 0;
    
    while (result.length < limit && hasMore) {
        hasMore = false;
        categoryIds.forEach(cid => {
            const bucket = buckets.get(cid)!;
            if (round < bucket.length) {
                if (result.length < limit) {
                    result.push(bucket[round]);
                }
                hasMore = true;
            }
        });
        round++;
    }

    return result;
}

/* =========================================================
   Home Page Data (Trending & New - Weighted Score)
========================================================= */

export const getHomePageData = unstable_cache(
    async () => {
        const supabase = createServiceClient();
        
        // 🧠 High-Intelligence Trending Algorithm: Weighted engagement score
        // Score = (views * 1) + (calls * 5) + (whatsapp * 5) + (directions * 3)
        const { data: trendingRaw, error: trendingError } = await supabase
            .from('places')
            .select(`
                *,
                categories(name, icon, slug),
                areas(name, districts(name)),
                reviews_count:reviews(count)
            `)
            .eq('status', 'approved')
            .not('images', 'is', null)
            .limit(50); // Fetch 50 candidates

        if (trendingError) console.error('Error fetching trending candidates:', trendingError);

        // Calculate scores and sort
        const trendingPotential = (trendingRaw || []).map(p => {
            const views = Number(p.views_count || 0);
            const calls = Number(p.calls_count || 0);
            const whatsapp = Number(p.whatsapp_count || 0);
            const directions = Number(p.directions_count || 0);
            
            // Formula for trending score
            const score = (views * 1) + (calls * 5) + (whatsapp * 5) + (directions * 3);
            return { ...mapPlace(p), trendingScore: score };
        });

        // Sort by score descending
        trendingPotential.sort((a, b) => b.trendingScore - a.trendingScore);
        const trending = trendingPotential.slice(0, 20);
        const trendingIds = new Set(trending.map(p => p.id));

        // Fetch a larger pool for newest places (Diversity Logic)
        const recentPool = await basePlacesQuery('created_at', false, 60);

        // Filter and Interleave for "Newly Added" section
        const filteredRecent = recentPool.filter(p => !trendingIds.has(p.id));
        const newPlaces = interleavePlacesByCategory(filteredRecent, 20);

        return { trending, newPlaces };
    },
    keys.homePage(),
    { tags: [tags.trendingPlaces(), tags.newestPlaces(), tags.allPlaces()], revalidate: 3600 }
);

export async function incrementPlaceViews(placeId: string, slug?: string) {
    const supabase = createServiceClient();
    const { error } = await supabase.rpc('increment_place_views', {
        target_place_id: placeId
    });

    if (!error) {
        // Revalidate both the specific views counter and the whole place object
        revalidateTag(tags.placeViews(placeId), 'max');
        if (slug) {
            revalidateTag(tags.place(slug), 'max');
        }
    }
    return { success: !error };
}

export async function incrementPlaceCall(placeId: string) {
    const supabase = createServiceClient();
    const { error } = await supabase.rpc('increment_place_calls', {
        target_place_id: placeId
    });
    return { success: !error };
}

export async function incrementPlaceWhatsapp(placeId: string) {
    const supabase = createServiceClient();
    const { error } = await supabase.rpc('increment_place_whatsapp', {
        target_place_id: placeId
    });
    return { success: !error };
}

export async function incrementPlaceDirections(placeId: string) {
    const supabase = createServiceClient();
    const { error } = await supabase.rpc('increment_place_directions', {
        target_place_id: placeId
    });
    return { success: !error };
}

/* =========================================================
   Community Pulse (Trending by Recent Reviews)
========================================================= */

export const getCommunityPulsePlaces = unstable_cache(
    async (days = 14, limit = 8) => {
        const supabase = createServiceClient();
        
        // 1. حساب التاريخ المرجعي (قبل 14 يوم أو حسب المتغير)
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - days);
        const isoString = dateThreshold.toISOString();

        // 2. جلب المراجعات الحديثة فقط
        const { data: recentReviews, error: reviewsError } = await supabase
            .from('reviews')
            .select('place_id, rating')
            .gte('created_at', isoString); 

        if (reviewsError || !recentReviews || recentReviews.length === 0) {
            return []; // لا يوجد نبض أو تفاعل حديث البتة
        }

        // 3. التجميع (Grouping) لمعرفة الأماكن الأكثر تفاعلاً
        const pulseMap = new Map<string, { count: number, totalRating: number }>();
        
        recentReviews.forEach(review => {
            if (!review.place_id) return;
            const current = pulseMap.get(review.place_id) || { count: 0, totalRating: 0 };
            current.count += 1;
            current.totalRating += review.rating || 0;
            pulseMap.set(review.place_id, current);
        });

        // 4. تحويل الـ Map إلى Array وحساب الـ Pulse Score
        const pulseList = Array.from(pulseMap.entries()).map(([place_id, data]) => {
            const avgRating = data.totalRating / data.count;
            // معادلة النبض: كمية المراجعات * الجودة + حافز إضافي إذا كان التقييم ممتاز
            const pulseScore = data.count * (avgRating + (avgRating > 4.0 ? 2 : 0));
            return {
                place_id,
                recentReviewCount: data.count,
                recentAvgRating: avgRating,
                pulseScore
            };
        });

        // 5. الترتيب تنازلياً حسب النبض
        pulseList.sort((a, b) => b.pulseScore - a.pulseScore);
        
        // 6. استخلاص أفضل الـ IDs لطلبها من الـ DB
        const topPulseItems = pulseList.slice(0, limit);
        const topPlaceIds = topPulseItems.map(item => item.place_id);

        if (topPlaceIds.length === 0) return [];

        // 7. جلب بيانات الأماكن بالكامل
        const { data: rawPlaces, error: placesError } = await supabase
            .from('places')
            .select(`
                *,
                categories(name, icon, slug),
                areas(name, districts(name)),
                reviews_count:reviews(count)
            `)
            .in('id', topPlaceIds)
            .eq('status', 'approved')
            .not('images', 'is', null);

        if (placesError || !rawPlaces) return [];

        // 8. دمج بيانات المكان مع معلومات "شريط النبض"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const finalPlaces = rawPlaces.map((p: any) => {
            const pulseInfo = topPulseItems.find(item => item.place_id === p.id);
            const mapped = mapPlace(p);
            return {
                ...mapped,
                pulseContext: pulseInfo ? {
                    newReviews: pulseInfo.recentReviewCount,
                    avgRating: pulseInfo.recentAvgRating
                } : undefined
            };
        });

        // إعادة الترتيب مرة أخرى لأن Supabase .in() لا تضمن ترتيب الـ Array الأصلي
        finalPlaces.sort((a, b) => {
            const scoreA = topPulseItems.find(item => item.place_id === a.id)?.pulseScore || 0;
            const scoreB = topPulseItems.find(item => item.place_id === b.id)?.pulseScore || 0;
            return scoreB - scoreA;
        });

        return finalPlaces;
    },
    ['community-pulse'],
    { tags: ['places', 'reviews', 'community-pulse', 'allPlaces'], revalidate: 3600 } 
);
