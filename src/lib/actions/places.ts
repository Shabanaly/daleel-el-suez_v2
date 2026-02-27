'use server';

import { createClient } from '../supabase/server';
import { Place } from '../types/places';

/**
 * Server Action to fetch places from Supabase.
 */
export async function getPlaces(): Promise<Place[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('places')
        .select(`
            *,
            categories(name, icon),
            areas(name)
        `);

    if (error) {
        console.error('Error fetching places:', error);
        return [];
    }

    return (data as any[]).map(p => ({
        id: p.id,
        name: p.name,
        category: p.categories?.name || 'عام',
        rating: Number(p.avg_rating) || 0,
        reviews: 0, // TODO: Implement review count
        area: p.areas?.name || 'السويس',
        color: 'from-primary-600 to-primary-800',
        icon: p.categories?.icon || '📍',
        tags: [],
        imageUrl: p.images?.[0] || '',
        address: p.address || '',
        phoneNumber: p.phone || '',
        isVerified: p.is_verified || false,
        openHours: 'مفتوح الآن',
        description: p.description
    }));
}

/**
 * Fetch a single place by ID from Supabase
 */
export async function getPlaceById(id: string): Promise<Place | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('places')
        .select(`
            *,
            categories(name, icon),
            areas(name)
        `)
        .eq('id', id)
        .single();

    if (error || !data) {
        if (error) console.error('Error fetching place by ID:', error);
        return null;
    }

    const p = data as any;
    return {
        id: p.id,
        name: p.name,
        category: p.categories?.name || 'عام',
        rating: Number(p.avg_rating) || 0,
        reviews: 0,
        area: p.areas?.name || 'السويس',
        color: 'from-primary-600 to-primary-800',
        icon: p.categories?.icon || '📍',
        tags: [],
        imageUrl: p.images?.[0] || '',
        address: p.address || '',
        phoneNumber: p.phone || '',
        isVerified: p.is_verified || false,
        openHours: 'مفتوح الآن',
        description: p.description
    };
}

/**
 * Fetch all categories from Supabase (strings for filtering)
 */
export async function getCategories(): Promise<string[]> {
    const supabase = await createClient();
    const { data } = await supabase
        .from('categories')
        .select('name')
        .eq('type', 'place');

    return ['الكل', ...(data?.map(c => c.name) || [])];
}

/**
 * Fetch all areas from Supabase (strings for filtering)
 */
export async function getAreas(): Promise<string[]> {
    const supabase = await createClient();
    const { data } = await supabase
        .from('areas')
        .select('name');

    return ['كل المناطق', ...(data?.map(a => a.name) || [])];
}

/**
 * Fetch all categories from Supabase (Full objects for forms)
 */
export async function getCategoriesWithIds(): Promise<{ id: number; name: string }[]> {
    const supabase = await createClient();
    const { data } = await supabase
        .from('categories')
        .select('id, name')
        .eq('type', 'place');

    return data || [];
}

/**
 * Fetch all areas from Supabase (Full objects for forms)
 */
export async function getAreasWithIds(): Promise<{ id: number; name: string }[]> {
    const supabase = await createClient();
    const { data } = await supabase
        .from('areas')
        .select('id, name');

    return data || [];
}

/**
 * Server Action to add a new place to Supabase.
 */
export async function addPlace(formData: any) {
    const supabase = await createClient();

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('يجب تسجيل الدخول أولاً');

    // 2. Prepare data
    const slug = formData.name.trim().replace(/\s+/g, '-').toLowerCase() + '-' + Math.random().toString(36).substring(2, 7);

    const { data, error } = await supabase
        .from('places')
        .insert({
            name: formData.name,
            slug,
            description: formData.description,
            category_id: formData.categoryId,
            area_id: formData.areaId,
            address: formData.address,
            phone: formData.phone,
            images: formData.images, // Array of URLs from Cloudinary
            added_by: user.id,
            is_verified: false,
            avg_rating: 0
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding place:', error);
        throw new Error('حدث خطأ أثناء إضافة المكان');
    }

    return data;
}
