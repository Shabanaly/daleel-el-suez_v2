import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client-service';
import { unstable_cache } from 'next/cache';

const getCachedSuggestions = (q: string, type: string = 'places') =>
    unstable_cache(
        async (query: string) => {
            const supabase = createServiceClient();
            const term = query.trim();

            if (type === 'market') {
                // Search Market Ads and Categories
                const [adsRes, catsRes] = await Promise.all([
                    supabase
                        .from('listings')
                        .select('title, id')
                        .eq('status', 'active')
                        .ilike('title', `%${term}%`)
                        .limit(5),
                    supabase
                        .from('categories')
                        .select('name, slug, icon')
                        .eq('type', 'market')
                        .ilike('name', `%${term}%`)
                        .limit(3)
                ]);

                const ads = (adsRes.data || []).map(ad => ({
                    name: ad.title,
                    slug: ad.id,
                    icon: 'ShoppingBag'
                }));

                const cats = (catsRes.data || []).map(cat => ({
                    name: cat.name,
                    slug: cat.slug,
                    icon: cat.icon || 'LayoutGrid'
                }));

                return [...cats, ...ads];
            }

            // Default: Search Places
            const { data, error } = await supabase
                .from('places')
                .select(`
                    name,
                    slug,
                    categories:category_id ( icon )
                `)
                .eq('status', 'approved')
                .ilike('name', `%${term}%`)
                .order('views_count', { ascending: false })
                .limit(8);

            if (error || !data) return [];

            return data.map((p) => {
                const cat = Array.isArray(p.categories) ? p.categories[0] : (p.categories as any);
                return {
                    name: p.name as string,
                    slug: p.slug as string,
                    icon: (cat?.icon as string) || '📍',
                };
            });
        },
        [`autocomplete-${type}-${q}`],
        { revalidate: 3600 }
    )(q);

export async function GET(req: NextRequest) {
    const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
    const type = req.nextUrl.searchParams.get('type') ?? 'places';

    if (!q || q.length < 1) {
        return NextResponse.json([]);
    }

    const suggestions = await getCachedSuggestions(q, type);
    return NextResponse.json(suggestions);
}
