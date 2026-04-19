'use server';

import { unstable_cache } from "next/cache";
import { createServiceClient } from "@/lib/supabase/client-service";
import { mapPlace, mapCategory } from "@/lib/utils/mappers";

interface RawCategory {
    id: number;
    name: string;
    slug: string;
    icon: string;
    places: { count: number }[];
}

async function fetchRawCategories(): Promise<RawCategory[]> {
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
    return (data as unknown as RawCategory[] || []).filter((c) => {
        const count = c.places?.[0]?.count || 0;
        const name = c.name.toLowerCase();
        const isInternal = name.includes('مراجعة') || name.includes('راجع');
        return count > 0 && !isInternal;
    });
}

// ── Internal Helpers (No Cache) ──────────────────────────────────
async function getCategoriesInternal(): Promise<{ name: string; count: number; slug: string }[]> {
    const data = await fetchRawCategories();
    
    // 1. Calculate total for "الكل" (Total approved places)
    const supabase = createServiceClient();
    const { count: totalApproved } = await supabase
        .from('places')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

    // 2. Map raw data to the new structure
    const mappedCategories = data.map((c) => ({
        name: c.name,
        count: c.places?.[0]?.count || 0,
        slug: c.slug
    }));

    // 3. Prepend "الكل" with total count
    return [
        { name: 'الكل', count: totalApproved || 0, slug: 'all' },
        ...mappedCategories
    ];
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
            const { data: places } = await supabase
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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            const { data: places } = await supabase
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
            
            const areaNames = Array.from(new Set(
                (areasData || []).map((a: { area_id: number; areas: { name: string } | { name: string }[] | null }) => {
                    const area = Array.isArray(a.areas) ? a.areas[0] : a.areas;
                    return area?.name;
                }).filter(Boolean)
            )) as string[];

            return {
                id: category.id,
                name: category.name,
                icon: category.icon,
                totalPlaces: (category as unknown as { places: { count: number }[] }).places?.[0]?.count || 0,
                highlights: mappedPlaces,
                topAreas: areaNames.slice(0, 5) as string[]
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
            const { data, error } = await supabase
                .from('categories')
                .select(`
                    *,
                    places!category_id(
                        id,
                        views_count,
                        reviews_count:reviews(count)
                    )
                `)
                .eq('slug', categorySlug)
                .single();

            if (error || !data) return null;

            const places = data.places || [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const totalReviews = places.reduce((acc: number, p: any) => acc + (p.reviews_count?.[0]?.count || 0), 0);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const totalViews = places.reduce((acc: number, p: any) => acc + (p.views_count || 0), 0);

            return {
                id: data.id,
                name: data.name,
                slug: data.slug,
                description: data.description,
                icon: data.icon,
                totalPlaces: places.length,
                totalReviews,
                totalViews: totalViews > 1000 ? `${(totalViews / 1000).toFixed(1)}k+` : totalViews
            };
        },
        [`category-info-slug-${slug}`],
        { tags: ['categories', 'places', `category-info-${slug}`], revalidate: 86400 }
    );
    return cached(slug);
}

export const getCategoriesWithIds = unstable_cache(
    async (): Promise<{ id: number; name: string; slug: string }[]> => {
        const supabase = createServiceClient();
        const { data } = await supabase
            .from('categories')
            .select('id, name, slug')
            .eq('type', 'place');
        return (data || []) as { id: number; name: string; slug: string }[];
    },
    ['categories-ids-list'],
    { tags: ['categories'], revalidate: 86400 }
);

export const getCommunityCategories = unstable_cache(
    async (): Promise<{ id: number; name: string; icon: string; slug: string }[]> => {
        const supabase = createServiceClient();
        const { data } = await supabase
            .from('categories')
            .select('id, name, icon, slug')
            .eq('type', 'community');
        return (data || []) as { id: number; name: string; icon: string; slug: string }[];
    },
    ['community-categories-list'],
    { tags: ['categories'], revalidate: 86400 }
);

/* =========================================================
   Smart Category Highlights (Time & Trend Aware for Home Page)
========================================================= */

/**
 * دالة مساعدة لتحديد التصنيفات الأنسب للوقت الحالي 
 * تعتمد على التوقيت المحلي (بتوقيت القاهرة) لتوقع النشاط الأنسب
 */
function getTimeAppropriateCategories(): string[] {
    const utcHour = new Date().getUTCHours();
    const egyptHour = (utcHour + 2) % 24; 

    // الصباح (6 ص إلى 1 م)
    if (egyptHour >= 6 && egyptHour < 13) {
        return ['كافيهات', 'بنوك', 'مدارس', 'سوبرماركت', 'صحة وطب'];
    }
    // بعد الظهر والمساء (1 م إلى 8 م)
    if (egyptHour >= 13 && egyptHour < 20) {
        return ['عيادات', 'أثاث', 'ملابس وأزياء', 'إلكترونيات', 'سيارات وصيانة'];
    }
    // السهرة (8 م إلى 1 ص)
    if ((egyptHour >= 20 && egyptHour <= 23) || egyptHour === 0) {
        return ['مطاعم', 'ترفيه ورياضة', 'سياحة ورحلات', 'هدايا ولعب', 'كافيهات'];
    }
    // آخر الليل والفجر (1 ص إلى 6 ص)
    return ['صيدليات', 'عقارات', 'أخرى', 'خدمات منزلية', 'بناء وتجهيزات'];
}

export const getSmartCategoryHighlights = unstable_cache(
    async () => {
        const supabase = createServiceClient();
        
        // 1. تحديد قائمة الأسماء المرشحة حسب الوقت
        const candidateNames = getTimeAppropriateCategories();

        // 2. العشوائية الموجهة: لا نكرر نفس التصنيف في نفس الوقت كل يوم
        const dateSeed = new Date().getDate() + new Date().getHours();
        const selectedIndex = dateSeed % candidateNames.length;
        const targetCategoryName = candidateNames[selectedIndex];

        // 3. سحب الفئة المستهدفة
        const { data: categoryData, error: catError } = await supabase
            .from('categories')
            .select('id, name, slug, icon')
            .eq('type', 'place')
            .eq('name', targetCategoryName)
            .single();

        let categoryToUse = categoryData;

        // التراجع الآمن في حال عدم وجود التصنيف في قاعدة البيانات (Fallback)
        if (catError || !categoryToUse) {
            const { data: fallbackCats } = await supabase
                .from('categories')
                .select('id, name, slug, icon')
                .eq('type', 'place')
                .limit(1);
            if (!fallbackCats || fallbackCats.length === 0) return null;
            categoryToUse = fallbackCats[0];
        }

        // 4. جلب شريحة كبيرة من الأماكن داخل هذا التصنيف بغرض فلترتها
        const { data: rawPlaces, error: placesError } = await supabase
            .from('places')
            .select(`
                *,
                categories(name, icon, slug),
                areas(name, districts(name)),
                reviews_count:reviews(count)
            `)
            .eq('category_id', categoryToUse.id)
            .eq('status', 'approved')
            .not('images', 'is', null)
            .limit(60); 

        if (placesError || !rawPlaces || rawPlaces.length === 0) {
            return null; // التصنيف فارغ
        }

        // 5. حساب معيار الجودة المركب (التقييمات أكثر أهمية من المشاهدات البسيطة)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const scoredPlaces = rawPlaces.map((p: any) => {
            const views = p.views_count || 0;
            const reviews = p.reviews_count?.[0]?.count || 0;
            const avgRating = p.avg_rating || 0;
            const qualityScore = views + (reviews * 50) + (avgRating * 200);
            return { ...p, qualityScore };
        });

        // 6. ترتيب النتائج وإرجاع أنقاها وأفضلها للزائر
        scoredPlaces.sort((a, b) => b.qualityScore - a.qualityScore);
        
        const bestPlaces = scoredPlaces
            .map(mapPlace)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((p: any) => p.imageUrl && p.imageUrl.trim() !== '')
            .slice(0, 8); // السلايدر يكفي ليتسع 8 أماكن بطريقة ممتازة

        if (bestPlaces.length === 0) return null;

        return {
            category: {
                id: categoryToUse.id,
                name: categoryToUse.name,
                slug: categoryToUse.slug,
                icon: categoryToUse.icon
            },
            places: bestPlaces
        };
    },
    ['smart-category-highlights-v1'],
    { tags: ['categories', 'places'], revalidate: 3600 } // الكاش يستمر لمدة ساعة ليسمح بالتحديث مع التوقيتات الجديدة
);