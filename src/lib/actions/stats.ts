'use server';

import { createServiceClient } from '../supabase/client-service';
import { unstable_cache } from 'next/cache';
import { tags } from '@/lib/cache';

export async function getSuezStats() {
    return unstable_cache(
        async () => {
            const supabase = createServiceClient();
            
            // 1. Get count of approved places
            const { count: placesCount, error: placesError } = await supabase
                .from('places')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'approved');

            // 2. Get count of covered areas
            const { count: areasCount, error: areasError } = await supabase
                .from('areas')
                .select('*', { count: 'exact', head: true });

            // 3. Get total sum of views (Reach)
            const { data: viewsData, error: viewsError } = await supabase
                .from('places')
                .select('views_count')
                .eq('status', 'approved');

            const totalViews = (viewsData || []).reduce((acc, curr) => acc + (curr.views_count || 0), 0);

            if (placesError || areasError || viewsError) {
                console.error('Error fetching Suez stats:', { placesError, areasError, viewsError });
            }

            return {
                places: placesCount || 0,
                areas: areasCount || 0,
                reach: totalViews || 0
            };
        },
        ['suez-global-stats'],
        { 
            tags: [tags.allPlaces()], 
            revalidate: 86400 // Cache for 24 hours
        }
    )();
}
