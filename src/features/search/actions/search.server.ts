'use server';

import { createServiceClient } from '@/lib/supabase/client-service';
import { unstable_cache } from 'next/cache';
import { tags } from '@/lib/cache';

export interface Suggestion {
    name: string;
    slug: string;
    icon: string;
    type?: 'place' | 'ad' | 'category';
    image?: string | null;
    url: string;
    meta?: string | null;
}

/**
 * 🛠️ The Global Search Engine Service
 * Handles fetching, caching, and organizing search suggestions.
 */

interface ListingResult {
    title: string;
    id: string;
    slug: string | null;
    images: string[] | null;
    price: number | null;
}

interface CategoryResult {
    name: string;
    slug: string;
    icon: string | null;
}

interface PlaceResult {
    name: string;
    slug: string;
    images: string[] | null;
    categories: { icon: string | null } | { icon: string | null }[] | null;
    areas: { name: string } | { name: string }[] | null;
}

export async function getAutocompleteSuggestions(q: string, type: 'market' | 'places' = 'places'): Promise<Suggestion[]> {
    const term = q.trim().toLowerCase();
    
    // 🧠 We use unstable_cache to keep results for 2 hours (7200s)
    return unstable_cache(
        async (query: string, searchType: string) => {
            const supabase = createServiceClient();
            
            if (searchType === 'market') {
                // Search Market Ads and Market Categories
                const [adsRes, catsRes] = await Promise.all([
                    supabase
                        .from('listings')
                        .select('title, id, slug, images, price')
                        .eq('status', 'active')
                        .ilike('title', `%${query}%`)
                        .limit(50),
                    supabase
                        .from('categories')
                        .select('name, slug, icon')
                        .eq('type', 'market')
                        .ilike('name', `%${query}%`)
                        .limit(20)
                ]);

                const ads: Suggestion[] = (adsRes.data as unknown as ListingResult[] || []).map((ad) => ({
                    name: ad.title,
                    slug: ad.slug || ad.id,
                    icon: 'ShoppingBag',
                    type: 'ad',
                    image: Array.isArray(ad.images) ? ad.images[0] : null,
                    url: `/market/${ad.slug || ad.id}`,
                    meta: ad.price ? `${ad.price} ج.م` : null
                }));

                const cats: Suggestion[] = (catsRes.data as unknown as CategoryResult[] || []).map((cat) => ({
                    name: cat.name,
                    slug: cat.slug,
                    icon: cat.icon || 'LayoutGrid',
                    type: 'category',
                    image: null,
                    url: `/market/category/${cat.slug}`,
                    meta: 'قسم بالسوق'
                }));

                // Deduplicate and Sort
                const combined = [...ads, ...cats];
                const uniqueResults = new Map<string, Suggestion>();
                combined.forEach(item => {
                    const key = item.name.trim().toLowerCase();
                    if (!uniqueResults.has(key) || (item.type === 'ad' && uniqueResults.get(key)?.type === 'category')) {
                        uniqueResults.set(key, item);
                    }
                });

                return Array.from(uniqueResults.values()).sort((a,b) => b.type === 'category' ? 1 : -1).slice(0, 50);
            }

            // --- Default: Places and General Categories ---
            const [placesRes, catsRes] = await Promise.all([
                supabase
                    .from('places')
                    .select(`
                        name,
                        slug,
                        images,
                        categories:category_id ( icon ),
                        areas:area_id ( name )
                    `)
                    .eq('status', 'approved')
                    .ilike('name', `%${query}%`)
                    .order('views_count', { ascending: false })
                    .limit(50),
                supabase
                    .from('categories')
                    .select('name, slug, icon')
                    .neq('type', 'market')
                    .ilike('name', `%${query}%`)
                    .limit(20)
            ]);

            const places: Suggestion[] = (placesRes.data as unknown as PlaceResult[] || []).map((p) => {
                const cat = Array.isArray(p.categories) ? p.categories[0] : p.categories;
                const area = Array.isArray(p.areas) ? p.areas[0] : p.areas;
                return {
                    name: p.name,
                    slug: p.slug,
                    icon: cat?.icon || 'MapPin',
                    type: 'place',
                    image: Array.isArray(p.images) ? p.images[0] : null,
                    url: `/places/${p.slug}`,
                    meta: area?.name || 'السويس'
                };
            });

            const cats: Suggestion[] = (catsRes.data as unknown as CategoryResult[] || []).map((cat) => ({
                name: cat.name,
                slug: cat.slug,
                icon: cat.icon || 'LayoutGrid',
                type: 'category',
                image: null,
                url: `/places?category=${encodeURIComponent(cat.name)}`,
                meta: 'قسم دليل السويس'
            }));

            // Deduplicate: Prioritize places over categories
            const combined = [...places, ...cats];
            const uniqueResults = new Map<string, Suggestion>();
            combined.forEach(item => {
                const key = item.name.trim().toLowerCase();
                if (!uniqueResults.has(key) || (item.type === 'place' && uniqueResults.get(key)?.type === 'category')) {
                    uniqueResults.set(key, item);
                }
            });

            return Array.from(uniqueResults.values()).sort((a,b) => b.type === 'category' ? 1 : -1).slice(0, 50);
        },
        [`autocomplete-${type}-${term}`],
        { 
            tags: [tags.autocomplete(type, term), 'all-autocomplete'], 
            revalidate: 7200 // 2 hours
        }
    )(term, type);
}
