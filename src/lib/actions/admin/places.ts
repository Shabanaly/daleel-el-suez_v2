'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export type PlaceStatus = 'pending' | 'approved' | 'rejected';

// Fetch Places with dynamic filtering
export async function getAdminPlaces(params?: { search?: string, status?: PlaceStatus }) {
    const supabase = createAdminClient();

    let query = supabase
        .from('places')
        .select(`
            id,
            name,
            address,
            phone,
            category:categories(name),
            area:areas(name, district:districts(name)),
            created_at,
            status
        `)
        .order('created_at', { ascending: false });

    if (params?.search) {
        query = query.ilike('name', `%${params.search}%`);
    }

    if (params?.status) {
        query = query.eq('status', params.status);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching admin places:', error);
        throw new Error('فشل جلب الأماكن. يرجى المحاولة مرة أخرى.');
    }

    // Map the relationships to match expected data types in the frontend
    return data.map((place: any) => ({
        ...place,
        category: place.category ? place.category : undefined,
        area: place.area?.name || 'غير محدد',
        district: place.area?.district?.name || 'غير محدد',
        rating: 0,
        reviews_count: 0
    }));
}

// Update Place Status
export async function updatePlaceStatusAction(placeId: string, status: PlaceStatus) {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('places')
        .update({ status })
        .eq('id', placeId);

    if (error) {
        console.error('Error updating place status:', error);
        throw new Error('فشل تحديث حالة المكان.');
    }

    // Revalidate custom cache path
    revalidatePath('/admin/places');

    return { success: true };
}

// Delete Place
export async function deletePlaceAction(placeId: string) {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('places')
        .delete()
        .eq('id', placeId);

    if (error) {
        console.error('Error deleting place:', error);
        throw new Error('فشل حذف المكان.');
    }

    // Revalidate custom cache path
    revalidatePath('/admin/places');

    return { success: true };
}
