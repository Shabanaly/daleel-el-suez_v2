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
            slug,
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
    ['categories-list-v2'],
    { tags: ['categories', 'categories-v2'], revalidate: 86400 }
);

export const getHomeCategories = unstable_cache(
    getHomeCategoriesInternal,
    ['home-categories-v2'],
    { tags: ['categories', 'places', 'categories-v2'], revalidate: 86400 }
);

export const getAllCategories = unstable_cache(
    getAllCategoriesInternal,
    ['all-categories'],
    { tags: ['categories', 'places'], revalidate: 86400 }
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
                    categories(name, icon, slug),
                    areas(name)
                `)
                .eq('category_id', categoryId)
                .eq('status', 'approved')
                .order('avg_rating', { ascending: false })
                .limit(40);

            return {
                ...category,
                places: (places || [])
                    .map(mapPlace)
                    .filter((p: any) => p.imageUrl && p.imageUrl.trim() !== '')
                    .slice(0, 12)
            };
        },
        [`category-details-${id}`],
        { tags: ['categories', 'places'], revalidate: 86400 }
    );
    return cached(id);
}

// ── Landing Page Action (SEO Optimized) ──────────────────────────
export async function getCategoryHighlights(id: string) {
    const cached = unstable_cache(
        async (categoryId: string) => {
            const supabase = createServiceClient();

            // 1. Fetch category info + Total count in one go
            const { data: category, error: catError } = await supabase
                .from('categories')
                .select(`
                    id,
                    name,
                    icon,
                    places(count)
                `)
                .eq('id', categoryId)
                .single();

            if (catError || !category) return null;

            // 2. Fetch TOP 6 places for the "Highlights" grid
            const { data: places, error: placesError } = await supabase
                .from('places')
                .select(`
                    *,
                    categories(name, icon, slug),
                    areas(name, districts(name)),
                    reviews_count:reviews(count)
                `)
                .eq('category_id', categoryId)
                .eq('status', 'approved')
                .not('images', 'is', null)
                .order('avg_rating', { ascending: false })
                .limit(20); // Get more to filter images

            const mappedPlaces = (places || [])
                .map(mapPlace)
                .filter(p => p.imageUrl && p.imageUrl.trim() !== '')
                .slice(0, 6);

            // 3. Get relevant areas for this category (optional but good for UX)
            const { data: areasData } = await supabase
                .from('places')
                .select('area_id, areas(name)')
                .eq('category_id', categoryId)
                .eq('status', 'approved')
                .limit(100);
            
            const areaNames = Array.from(new Set((areasData || []).map((a: any) => a.areas?.name).filter(Boolean)));

            return {
                id: category.id,
                name: category.name,
                icon: category.icon,
                totalPlaces: (category as any).places?.[0]?.count || 0,
                highlights: mappedPlaces,
                topAreas: areaNames.slice(0, 5)
            };
        },
        [`category-highlights-${id}`],
        { tags: ['categories', 'places', `category-h-${id}`], revalidate: 86400 }
    );
    return cached(id);
}

// ── Slug-based Landing Page Action (Info Only) ───────────────────────────────
export async function getCategoryInfoBySlug(slug: string) {
    const cached = unstable_cache(
        async (categorySlug: string) => {
            const supabase = createServiceClient();

            // Fetch category by slug + total count
            const { data: category, error: catError } = await supabase
                .from('categories')
                .select(`
                    id,
                    name,
                    slug,
                    icon,
                    places(count)
                `)
                .eq('slug', categorySlug)
                .eq('type', 'place')
                .single();

            if (catError || !category) return null;

            return {
                id: category.id,
                slug: category.slug,
                name: category.name,
                icon: category.icon,
                totalPlaces: (category as any).places?.[0]?.count || 0,
            };
        },
        [`category-info-slug-${slug}`],
        { tags: ['categories', 'places', `category-info-${slug}`], revalidate: 86400 }
    );
    return cached(slug);
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
    { tags: ['categories'], revalidate: 86400 }
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

export const getRandomCategoryHighlights = unstable_cache(
    async () => {
        const supabase = createServiceClient();

        // 1. Get all categories that have at least one place
        const { data: categories, error: catError } = await supabase
            .from('categories')
            .select(`
                id,
                name,
                slug,
                icon,
                places!inner(id)
            `)
            .eq('type', 'place');

        if (catError || !categories || categories.length === 0) {
            return null;
        }

        // 2. Select a random category
        const randomIndex = Math.floor(Math.random() * categories.length);
        const randomCategory = categories[randomIndex];

        // 3. Fetch up to 8 places for this category (ordered by views to show popular ones)
        const { data: places, error: placesError } = await supabase
            .from('places')
            .select(`
                *,
                categories(name, icon, slug),
                areas(name, districts(name)),
                reviews_count:reviews(count)
            `)
            .eq('category_id', randomCategory.id)
            .eq('status', 'approved')
            .order('views_count', { ascending: false })
            .limit(30);

        if (placesError || !places || places.length === 0) {
            return null;
        }

        return {
            category: {
                id: randomCategory.id,
                name: randomCategory.name,
                slug: randomCategory.slug,
                icon: randomCategory.icon
            },
            places: (places || [])
                .map(mapPlace)
                .filter((p: any) => p.imageUrl && p.imageUrl.trim() !== '')
                .slice(0, 20)
        };
    },
    ['random-category-highlights'],
    { tags: ['categories', 'places'], revalidate: 172800 } // 48 hours ISR
);