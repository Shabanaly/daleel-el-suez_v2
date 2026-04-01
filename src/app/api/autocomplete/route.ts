import { NextRequest, NextResponse } from 'next/server';
import { getAutocompleteSuggestions } from '@/lib/actions/search';

export async function GET(req: NextRequest) {
    const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
    const type = (req.nextUrl.searchParams.get('type') as 'market' | 'places') ?? 'places';

    if (!q || q.length < 1) {
        return NextResponse.json([]);
    }

    try {
        const suggestions = await getAutocompleteSuggestions(q, type);
        return NextResponse.json(suggestions);
    } catch (error) {
        console.error('Autocomplete API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
