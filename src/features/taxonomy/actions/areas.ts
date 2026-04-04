'use server';

import { createServiceClient } from '@/lib/supabase/client-service';
import { unstable_cache } from 'next/cache';
import { cacheManager } from '@/lib/cache';

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
    { tags: ['areas'], revalidate: 86400 }
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
    { tags: ['areas'], revalidate: 86400 }
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
    { tags: ['areas'], revalidate: 86400 }
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
