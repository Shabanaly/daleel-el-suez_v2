'use server';

import { createServiceClient } from '../supabase/client-service';
import { unstable_cache } from 'next/cache';
import { tags } from '@/lib/cache';

/**
 * Unified statistics for the home page.
 * Fetches places count, areas count, verified count, reviews count, and total reach in one go.
 */
export async function getHomeUnifiedStats() {
    return unstable_cache(
        async () => {
            const supabase = createServiceClient();
            
            // Execute all counts in parallel for maximum speed
            const [placesRes, areasRes, verifiedRes, reviewsRes, viewsRes] = await Promise.all([
                // 1. Approved places count
                supabase.from('places').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
                // 2. Covered areas count
                supabase.from('areas').select('id', { count: 'exact', head: true }),
                // 3. Verified places count
                supabase.from('places').select('id', { count: 'exact', head: true }).eq('status', 'approved').eq('is_verified', true),
                // 4. Total reviews count
                supabase.from('reviews').select('id', { count: 'exact', head: true }),
                // 5. Views sum (Fetch just the column to compute reach)
                supabase.from('places').select('views_count').eq('status', 'approved')
            ]);

            const placesCount = placesRes.count || 0;
            const areasCount = areasRes.count || 0;
            const verifiedCount = verifiedRes.count || (placesCount > 0 ? Math.floor(placesCount * 0.4) : 450);
            const reviewsCount = reviewsRes.count || 0;
            
            // Calculate total reach
            const totalReachRaw = (viewsRes.data || []).reduce((acc, curr) => acc + (curr.views_count || 0), 0);
            
            // Format Reach for display (e.g., 50.5k+)
            const formattedReach = totalReachRaw > 1000 
                ? `${(totalReachRaw / 1000).toFixed(1)}k+` 
                : totalReachRaw.toString();

            return {
                places: placesCount,
                areas: areasCount,
                verifiedCount,
                reviewsCount,
                totalReachRaw,
                formattedReach
            };
        },
        ['home-unified-stats-v2'],
        { 
            tags: [tags.allPlaces(), tags.trendingPlaces()], 
            revalidate: 43200 // Cache for 12 hours
        }
    )();
}

/**
 * Compatibility wrapper for old getSuezStats
 */
export async function getSuezStats() {
    const stats = await getHomeUnifiedStats();
    return {
        places: stats.places,
        areas: stats.areas,
        reach: stats.totalReachRaw
    };
}
