'use server';

import { createClient } from '@/lib/supabase/server';
import { cacheManager, tags } from '../cache';
import { mapPlace } from '../utils/mappers';
import { revalidateTag, revalidatePath } from 'next/cache';
import { deleteCloudinaryImage } from './media';

/**
 * Fetch places owned by the user
 */
export async function getOwnedPlaces() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'يجب تسجيل الدخول لقراءة بياناتك' };

    try {
        const { data, error } = await supabase
            .from('places')
            .select(`
                *,
                categories(name, icon, slug),
                areas(name, districts(name)),
                reviews_count:reviews(count)
            `)
            .eq('added_by', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return { 
            success: true, 
            places: (data || []).map(mapPlace) 
        };
    } catch (error) {
        console.error('Error fetching owned places:', error);
        return { success: false, error: 'حدث خطأ أثناء تحميل أماكنك' };
    }
}

/**
 * Fetch a specific place owned by the user with its statistics
 */
export async function getOwnedPlaceDetails(placeId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'غير مصرح به' };

    try {
        // Fetch place basic details and reviews count in one go
        const [placeDetails, favoritesCountRes] = await Promise.all([
            supabase
                .from('places')
                .select(`
                    *,
                    categories(name, icon, slug),
                    areas(name, districts(name)),
                    reviews_count:reviews(count)
                `)
                .eq('id', placeId)
                .eq('added_by', user.id)
                .single(),
            // Fetch favorites count separately as there's no direct FK (polymorphic item_id)
            supabase
                .from('favorites')
                .select('*', { count: 'exact', head: true })
                .eq('item_id', placeId)
                .eq('item_type', 'place')
        ]);

        const { data, error } = placeDetails;
        const { count: favoritesCount } = favoritesCountRes;

        if (error) {
            if (error.code === 'PGRST116') {
                return { success: false, error: 'النشاط غير موجود أو لا تملك صلاحية إدارته' };
            }
            throw error;
        }

        // Inject favorites count into raw data before mapping
        const rawData = {
            ...data,
            favorites_count: [{ count: favoritesCount || 0 }]
        };

        return { 
            success: true, 
            place: mapPlace(rawData as any)
        };
    } catch (error) {
        console.error('Error fetching place details:', error);
        return { success: false, error: 'حدث خطأ أثناء تحميل بيانات النشاط' };
    }
}

/**
 * Fetch reviews for owned places
 */
export async function getOwnedPlacesReviews() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'غير مصرح به' };

    try {
        // 1. Get IDs of places owned by the user
        const { data: ownedPlaces } = await supabase
            .from('places')
            .select('id')
            .eq('added_by', user.id);

        if (!ownedPlaces || ownedPlaces.length === 0) {
            return { success: true, reviews: [] };
        }

        const placeIds = ownedPlaces.map(p => p.id);

        // 2. Fetch reviews for those places
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                place:places(id, name, slug),
                user:profiles!user_id(id, username, full_name, avatar_url)
            `)
            .in('place_id', placeIds)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return { success: true, reviews: data || [] };
    } catch (error) {
        console.error('Error fetching reviews for owned places:', error);
        return { success: false, error: 'حدث خطأ أثناء تحميل التقييمات' };
    }
}

/**
 * Reply to a review as the place owner
 */
export async function replyToReview(reviewId: string, replyText: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'يجب تسجيل الدخول للرد' };

    try {
        // 1. Verify ownership
        const { data: review } = await supabase
            .from('reviews')
            .select('place_id, places(added_by)')
            .eq('id', reviewId)
            .single();

        if (!review || (review.places as any)?.added_by !== user.id) {
            return { success: false, error: 'غير مصرح لك بالرد على هذا التقييم' };
        }

        // 2. Update the review with the reply
        const { error } = await supabase
            .from('reviews')
            .update({
                reply_text: replyText,
                replied_at: new Date().toISOString()
            })
            .eq('id', reviewId);

        if (error) throw error;

        // Invalidate cache
        cacheManager.invalidateReview(review.place_id);

        return { success: true };
    } catch (error) {
        console.error('Error replying to review:', error);
        return { success: false, error: 'حدث خطأ أثناء إرسال الرد' };
    }
}


/**
 * Handle image removal from a place (Both Cloudinary and DB)
 */
export async function removePlaceImage(placeId: string, index: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'غير مصرح به' };

    try {
        // 1. Fetch current data
        const { data: place, error: fetchError } = await supabase
            .from('places')
            .select('added_by, images, public_ids, slug')
            .eq('id', placeId)
            .single();

        if (fetchError || !place) throw new Error('لم يتم العثور على المكان');
        if (place.added_by !== user.id) return { success: false, error: 'ليس لديك صلاحية' };

        // 2. Physical deletion from Cloudinary (if public_id exists)
        const currentPublicIds = place.public_ids || [];
        const publicIdToDelete = currentPublicIds[index];
        if (publicIdToDelete) {
            await deleteCloudinaryImage(publicIdToDelete);
        }

        // 3. Update DB arrays
        const newImages = (place.images || []).filter((_: string, i: number) => i !== index);
        const newPublicIds = currentPublicIds.filter((_: string, i: number) => i !== index);

        const { error: updateError } = await supabase
            .from('places')
            .update({
                images: newImages,
                public_ids: newPublicIds
            })
            .eq('id', placeId);

        if (updateError) throw updateError;

        // 4. Invalidate and revalidate
        cacheManager.invalidatePlace(place.slug, placeId);
        revalidatePath(`/manage/${placeId}`);

        return { success: true };
    } catch (error) {
        console.error('Error in removePlaceImage:', error);
        return { success: false, error: 'حدث خطأ أثناء حذف الصورة' };
    }
}

/**
 * Set an image as the main image (moves it to index 0)
 */
export async function setPlaceMainImage(placeId: string, imageUrl: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'غير مصرح به' };

    try {
        // 1. Fetch
        const { data: place, error: fetchError } = await supabase
            .from('places')
            .select('added_by, images, public_ids, slug')
            .eq('id', placeId)
            .single();

        if (fetchError || !place) throw new Error('المكان غير موجود');
        if (place.added_by !== user.id) return { success: false, error: 'صلاحية مرفوضة' };

        const currentImages = place.images || [];
        const currentPublicIds = place.public_ids || [];

        // 2. Reorder
        const imgIndex = currentImages.indexOf(imageUrl);
        if (imgIndex === -1) throw new Error('الصورة غير موجودة');

        const newImages = [imageUrl, ...currentImages.filter((img: string) => img !== imageUrl)];
        
        let newPublicIds = currentPublicIds;
        if (currentPublicIds[imgIndex]) {
            const targetPid = currentPublicIds[imgIndex];
            newPublicIds = [targetPid, ...currentPublicIds.filter((pid: string) => pid !== targetPid)];
        }

        // 3. Save
        const { error: updateError } = await supabase
            .from('places')
            .update({
                images: newImages,
                public_ids: newPublicIds,
                // Also update the dedicated imageUrl column if it exists and matches main
                // image_url: newImages[0]
            })
            .eq('id', placeId);

        if (updateError) throw updateError;

        cacheManager.invalidatePlace(place.slug, placeId);
        revalidatePath(`/manage/${placeId}`);

        return { success: true };
    } catch (error) {
        console.error('Error in setPlaceMainImage:', error);
        return { success: false, error: 'حدث خطأ أثناء تعيين الصورة الرئيسية' };
    }
}

/**
 * Enhanced update for basic info with formatting logic
 */
export async function updatePlaceBasicInfo(placeId: string, field: string, value: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'غير مصرح به' };

    try {
        // 1. Fetch to verify ownership and get current state
        const { data: place, error: fetchError } = await supabase
            .from('places')
            .select('added_by, slug, phone')
            .eq('id', placeId)
            .single();

        if (fetchError || !place) throw new Error('المكان غير موجود');
        if (place.added_by !== user.id) return { success: false, error: 'ليس لديك صلاحية التعديل' };

        // 2. Prepare data with business logic
        let dataToUpdate: any = { [field]: value };

        if (field === 'phone') {
            const currentPhone = place.phone || { primary: '', others: [], whatsapp: '' };
            dataToUpdate = {
                phone: {
                    ...currentPhone,
                    primary: value
                }
            };
        } else if (field === 'working_hours') {
            dataToUpdate = { working_hours: value };
        }

        // 3. Perform update
        const { error: updateError } = await supabase
            .from('places')
            .update(dataToUpdate)
            .eq('id', placeId);

        if (updateError) throw updateError;

        cacheManager.invalidatePlace(place.slug, placeId);
        revalidatePath(`/manage/${placeId}`);

        return { success: true };
    } catch (error) {
        console.error('Error in updatePlaceBasicInfo:', error);
        return { success: false, error: 'حدث خطأ أثناء تحديث البيانات' };
    }
}

