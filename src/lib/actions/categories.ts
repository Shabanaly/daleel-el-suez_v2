'use server';

import { unstable_cache } from "next/cache";
import { createServiceClient } from "../supabase/client-service";
import { mapPlace, mapCategory } from "../utils/mappers";

async function fetchRawCategories() {
    const supabase = createServiceClient();

    // Always fetch counts to allow filtering empty ones
    const { data, error } = await supabase
        .from('categories')
        .select(`
            id,
            name,
            icon,
            places(count)
        `)
        .eq('type', 'place');

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    // Filter out:
    // 1. Categories with 0 places
    // 2. Categories with "مراجعة" or "راجع" in name (internal/pending)
    return (data || []).filter((c: any) => {
        const count = c.places?.[0]?.count || 0;
        const name = c.name.toLowerCase();
        const isInternal = name.includes('مراجعة') || name.includes('راجع');
        return count > 0 && !isInternal;
    });
}

// ── Internal Helpers (No Cache) ──────────────────────────────────
async function getCategoriesInternal(): Promise<string[]> {
    const data = await fetchRawCategories();
    return ['الكل', ...data.map((c: any) => c.name)];
}

async function getHomeCategoriesInternal() {
    const data = await fetchRawCategories();
    return data
        .map(mapCategory)
        .slice(0, 6);
}

async function getAllCategoriesInternal() {
    const data = await fetchRawCategories();
    return data.map(mapCategory);
}

// ── Public API (Server Actions & Cached) ─────────────────────────
export const getCategories = unstable_cache(
    getCategoriesInternal,
    ['categories-list'],
    { tags: ['categories'], revalidate: 86400 }
);

export const getHomeCategories = unstable_cache(
    getHomeCategoriesInternal,
    ['home-categories'],
    { tags: ['categories', 'places'], revalidate: 3600 }
);

export const getAllCategories = unstable_cache(
    getAllCategoriesInternal,
    ['all-categories'],
    { tags: ['categories', 'places'], revalidate: 3600 }
);

// This one is for Client side calls (useEffect) to avoid unstable_cache issues
export async function getAllCategoriesAction() {
    return await getAllCategoriesInternal();
}

export async function getCategoryDetails(id: string) {
    const cached = unstable_cache(
        async (categoryId: string) => {
            const supabase = createServiceClient();

            // Fetch category info
            const { data: category, error: catError } = await supabase
                .from('categories')
                .select('*')
                .eq('id', categoryId)
                .single();

            if (catError || !category) return null;

            // Fetch places in this category
            const { data: places, error: placesError } = await supabase
                .from('places')
                .select(`
                    *,
                    categories(name, icon),
                    areas(name)
                `)
                .eq('category_id', categoryId)
                .order('avg_rating', { ascending: false })
                .limit(12);

            return {
                ...category,
                places: (places || []).map(mapPlace)
            };
        },
        [`category-details-${id}`],
        { tags: ['categories', 'places'], revalidate: 3600 }
    );
    return cached(id);
}

export const getCategoriesWithIds = unstable_cache(
    async (): Promise<{ id: number; name: string }[]> => {
        const supabase = createServiceClient();
        const { data } = await supabase
            .from('categories')
            .select('id, name')
            .eq('type', 'place');
        return data || [];
    },
    ['categories-ids-list'],
    { tags: ['categories'] }
);

export const getCommunityCategories = unstable_cache(
    async (): Promise<{ id: number; name: string; icon: string }[]> => {
        const supabase = createServiceClient();
        const { data } = await supabase
            .from('categories')
            .select('id, name, icon')
            .eq('type', 'community');
        return (data || []) as { id: number; name: string; icon: string }[];
    },
    ['community-categories-list'],
    { tags: ['categories'], revalidate: 86400 }
);