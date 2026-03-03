'use server';

import { createServiceClient } from '../supabase/client-service';
import { unstable_cache } from 'next/cache';
import { cacheManager } from '../cache';

/**
 * Cached Areas (Simple list of names)
 */
export const getAreas = unstable_cache(
    async (): Promise<string[]> => {
        const supabase = createServiceClient();
        const { data } = await supabase
            .from('areas')
            .select('name');

        return ['كل المناطق', ...(data?.map(a => a.name) || [])];
    },
    ['areas-list'],
    { tags: ['areas'], revalidate: false }
);

/**
 * Fetch all areas for forms (with IDs)
 */
export const getAreasWithIds = unstable_cache(
    async (): Promise<{ id: number; name: string }[]> => {
        const supabase = createServiceClient();
        const { data } = await supabase
            .from('areas')
            .select('id, name');
        return data || [];
    },
    ['areas-ids-list'],
    { tags: ['areas'], revalidate: false }
);

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
    { tags: ['areas'], revalidate: false }
);

export interface AreaWithDistrict {
    id: number;
    name: string;
    district_id: number;
}

/**
 * Fetch all areas with their district IDs (Cached for client usage)
 */
export const getAreasAction = unstable_cache(
    async (): Promise<AreaWithDistrict[]> => {
        const supabase = createServiceClient();
        const { data } = await supabase
            .from('areas')
            .select('id, name, district_id')
            .order('name');
        return data || [];
    },
    ['areas-action-list'],
    { tags: ['areas'], revalidate: false }
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
                // @ts-ignore
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
    { tags: ['areas', 'places'], revalidate: false }
);

/**
 * Get or Create a new area dynamically
 * Used when a user types a custom area name during place creation
 */
export async function getOrCreateArea(areaName: string, districtId: number): Promise<number> {
    const supabase = createServiceClient();

    const trimmedName = areaName.trim();
    if (!trimmedName || !districtId) {
        throw new Error('اسم المنطقة والحي مطلوبان');
    }

    // 1. Smart match: Double check if it exists in DB (across all districts)
    const allAreas = await getAreasWithIds();

    if (allAreas) {
        const normalizeText = (text: string) => text
            .replace(/[أإآا]/g, 'ا')
            .replace(/[ةه]/g, 'ه')
            .replace(/[يى]/g, 'ي')
            .trim()
            .toLowerCase();

        const ignoreWords = ['حي', 'منطقة', 'شارع', 'ش', 'مدينة', 'مساكن', 'تعاونيات', 'تقسيم', 'قرية', 'عزبة', 'بمنطقة', 'بحي', 'مدينة', 'و', 'في', 'من', 'ال', 'ابو', 'أبو'];
        const normalizedIgnoreWords = ignoreWords.map(normalizeText);

        const normalizedSearch = normalizeText(trimmedName);
        const searchWords = normalizedSearch
            .split(/\s+/)
            .filter(w => w.length > 2 && !normalizedIgnoreWords.includes(w));

        // Exact normalized match
        let existingMatch = allAreas.find(a => normalizeText(a.name) === normalizedSearch);

        // Smart word intersection match
        if (!existingMatch && searchWords.length > 0) {
            existingMatch = allAreas.find(a => {
                const areaWords = normalizeText(a.name).split(/\s+/);
                return searchWords.some(searchWord => areaWords.includes(searchWord));
            });
        }

        if (existingMatch) {
            return existingMatch.id;
        }
    }

    // 2. If it doesn't exist, create it
    const baseSlug = trimmedName.replace(/\s+/g, '-').toLowerCase();
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    const { data: newArea, error } = await supabase
        .from('areas')
        .insert({
            name: trimmedName,
            slug: uniqueSlug,
            district_id: districtId
        })
        .select('id')
        .single();

    if (error || !newArea) {
        console.error('Error creating dynamic area:', error);
        throw new Error('فشل إضافة المنطقة الجديدة');
    }

    // Revalidate areas cache
    cacheManager.invalidateMetadata();

    return newArea.id;
}
