'use server';

import { createClient } from '../supabase/server';
import { revalidatePath } from 'next/cache';
import { cacheManager } from '../cache';
import { notifyAdmins } from './admin.server';

import { WeeklySchedule } from '@/features/places/types';

interface PlaceMutationData {
    name: string;
    description: string;
    categoryId: number;
    areaId: number;
    address: string;
    phone: {
        primary: string;
        others: string[];
        whatsapp: string;
    };
    socialLinks: { platform: string, url: string }[];
    images: string[];
    publicIds: string[];
    openHours: string | WeeklySchedule;
}

/**
 * Server Action to add a new place with revalidation
 */
export async function addPlace(formData: PlaceMutationData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('يجب تسجيل الدخول أولاً');

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
            social_links: formData.socialLinks,
            images: formData.images,
            public_ids: formData.publicIds,
            working_hours: formData.openHours,
            added_by: user.id,
            is_verified: false,
            avg_rating: 0,
            status: 'pending'
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding place:', error);
        throw new Error('حدث خطأ أثناء إضافة المكان');
    }

    // 🔥 Revalidate: bust unstable_cache AND UI path
    cacheManager.invalidateAllPlaces();
    cacheManager.invalidateMetadata();
    cacheManager.invalidateUserStats(user.id);
    revalidatePath('/places');

    // Notify Admins
    await notifyAdmins({
        title: 'مكان جديد يحتاج للمراجعة',
        message: `تم إضافة مكان جديد: ${formData.name}`,
        type: 'place_created',
        link: `/admin/places?status=pending`,
        actor_id: user.id,
        metadata: { place_id: data.id }
    });

    return data;
}

/**
 * Server Action to update an existing place
 */
export async function updatePlace(id: string, formData: PlaceMutationData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('يجب تسجيل الدخول أولاً');

    const { data, error } = await supabase
        .from('places')
        .update({
            name: formData.name,
            description: formData.description,
            category_id: formData.categoryId,
            area_id: formData.areaId,
            address: formData.address,
            phone: formData.phone,
            social_links: formData.socialLinks,
            images: formData.images,
            public_ids: formData.publicIds,
            working_hours: formData.openHours,
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating place:', error);
        throw new Error('حدث خطأ أثناء تحديث البيانات');
    }

    // 🔥 Revalidate: bust unstable_cache AND UI paths
    cacheManager.invalidatePlace(data.slug, data.id, data.category_id, data.area_id);
    revalidatePath('/places');
    revalidatePath(`/places/${data.slug}`);

    return data;
}

/**
 * Server Action to delete a place
 */
export async function deletePlace(id: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('يجب تسجيل الدخول أولاً');

    // 1. Fetch public_ids and slug for cleanup/revalidation
    const { data: place, error: fetchError } = await supabase
        .from('places')
        .select('public_ids, slug')
        .eq('id', id)
        .single();

    if (fetchError) {
        console.error('Error fetching place for deletion:', fetchError);
        throw new Error('حدث خطأ أثناء البحث عن المكان');
    }

    // 2. Delete from Cloudinary if public_ids exist
    if (place?.public_ids && place.public_ids.length > 0) {
        const { deleteCloudinaryImage } = await import('./media');
        try {
            await Promise.all((place.public_ids as string[]).map((pid: string) => deleteCloudinaryImage(pid)));
        } catch (cloudinaryErr) {
            console.error('Error cleaning up Cloudinary images:', cloudinaryErr);
        }
    }

    // 3. Delete from DB
    const { error } = await supabase
        .from('places')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting place:', error);
        throw new Error('حدث خطأ أثناء حذف المكان');
    }

    cacheManager.invalidatePlace(place.slug, id);
    cacheManager.invalidateMetadata();
    cacheManager.invalidateUserStats(user.id);
    revalidatePath('/places');
    return { success: true };
}
