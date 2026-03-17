import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client-service';
import { unstable_cache } from 'next/cache';

const getCachedSuggestions = (q: string) =>
    unstable_cache(
        async (query: string) => {
            const supabase = createServiceClient();
            const term = query.trim();

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

            return data.map((p: any) => {
                // categories يرجع object أو null من الـ join
                const cat = Array.isArray(p.categories) ? p.categories[0] : p.categories;
                return {
                    name: p.name as string,
                    slug: p.slug as string,
                    icon: (cat?.icon as string) || '📍',
                };
            });
        },
        [`autocomplete-${q}`],
        { revalidate: 7200 }
    )(q);

export async function GET(req: NextRequest) {
    const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';

    if (!q || q.length < 1) {
        return NextResponse.json([]);
    }

    const suggestions = await getCachedSuggestions(q);
    return NextResponse.json(suggestions);
}
