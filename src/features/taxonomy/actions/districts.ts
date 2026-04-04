'use server';

import { createServiceClient } from '@/lib/supabase/client-service';
import { unstable_cache } from 'next/cache';

/**
 * Fetch all Official Districts
 */
export const getDistricts = unstable_cache(
    async () => {
        const supabase = createServiceClient();
        const { data } = await supabase
            .from('districts')
            .select('*')
            .order('id');
        return data || [];
    },
    ['districts-list'],
    { tags: ['areas'], revalidate: 86400 }
);

/**
 * Fetch the 5 Official Districts with icons and counts for Home Page
 */
export const getHomeDistricts = unstable_cache(
    async () => {
        const supabase = createServiceClient();

        // 5 Official Suez Districts
        const officialDistricts = [
            { name: 'حي السويس', icon: '🏛️' },
            { name: 'حي الأربعين', icon: '🕌' },
            { name: 'حي فيصل', icon: '🏢' },
            { name: 'حي عتاقة', icon: '🏭' },
            { name: 'حي الجناين', icon: '🌴' },
        ];

        const { data, error } = await supabase
            .from('districts')
            .select(`
                id,
                name,
                places_count:areas(places(count))
            `)
            .in('name', officialDistricts.map(d => d.name));

        if (error) return [];

        // Map database counts back to the ordered official list
        return officialDistricts.map((off, index) => {
            const dbMatch = data?.find(d => d.name === off.name);

            // Calculate total count by summing places in all areas of this district
            let totalPlaces = 0;
            if (dbMatch?.places_count) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                dbMatch.places_count.forEach((area: any) => {
                    totalPlaces += area.places?.[0]?.count || 0;
                });
            }

            return {
                id: dbMatch?.id || index.toString(),
                name: off.name,
                icon: off.icon,
                count: `${totalPlaces}+ مكان`,
            };
        });
    },
    ['home-districts-official-v3'],
    { tags: ['areas', 'places'], revalidate: 86400 }
);
