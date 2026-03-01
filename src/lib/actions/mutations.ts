'use server';

import { createClient } from '../supabase/server';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Server Action to add a new place with revalidation
 */
export async function addPlace(formData: any) {
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
            avg_rating: 0
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding place:', error);
        throw new Error('حدث خطأ أثناء إضافة المكان');
    }

    // 🔥 Revalidate: bust unstable_cache AND UI path
    revalidateTag('places', 'max');
    revalidateTag(`user-${user.id}-stats`, 'max');
    revalidateTag(`user-${user.id}-activities`, 'max');
    revalidatePath('/places');

    return data;
}

/**
 * Server Action to update an existing place
 */
export async function updatePlace(id: string, formData: any) {
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
    revalidateTag('places', 'max');
    revalidateTag(`place-${data.slug}`, 'max');
    revalidateTag(`user-${user.id}-activities`, 'max');
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

    // 1. Fetch public_ids for cleanup
    const { data: place, error: fetchError } = await supabase
        .from('places')
        .select('public_ids')
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
            // We continue with DB deletion even if Cloudinary fails, 
            // but we log the error.
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

    revalidateTag('places', 'max');
    revalidateTag(`user-${user.id}-stats`, 'max');
    revalidateTag(`user-${user.id}-activities`, 'max');
    revalidatePath('/places');
    return { success: true };
}
