import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client-service';

export async function GET(req: NextRequest) {
    const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';

    if (!q || q.length < 1) {
        return NextResponse.json([]);
    }

    const supabase = createServiceClient();
    const term = q.trim();

    const { data, error } = await supabase
        .from('posts')
        .select(`
            id,
            content,
            category:category_id ( name, icon )
        `)
        .eq('status', 'active')
        .ilike('content', `%${term}%`)
        .order('likes_count', { ascending: false })
        .limit(6);

    if (error || !data) {
        console.error("Community autocomplete error:", error);
        return NextResponse.json([]);
    }

    // استخرج جمل مختصرة من المحتوى كاقتراحات
    const suggestions = data.map((p: any) => {
        const cat = Array.isArray(p.category) ? p.category[0] : p.category;
        // اقتطع النص عند 60 حرف كحد أقصى للاقتراح
        const snippet = (p.content as string).slice(0, 60).replace(/\n/g, ' ').trim();
        return {
            name: snippet.length < (p.content as string).length ? `${snippet}...` : snippet,
            slug: p.id as string,
            icon: (cat?.icon as string) || '💬',
        };
    });

    return NextResponse.json(suggestions);
}
