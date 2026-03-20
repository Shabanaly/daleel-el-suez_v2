'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/client-service';
import { cacheManager, tags } from '../cache';
import { mapPlace } from '../utils/mappers';
import { revalidateTag } from 'next/cache';

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
 * Update place details
 */
export async function updateOwnedPlace(placeId: string, data: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'غير مصرح به' };

    try {
        // 1. Verify ownership
        const { data: place } = await supabase
            .from('places')
            .select('added_by, slug')
            .eq('id', placeId)
            .single();

        if (!place || place.added_by !== user.id) {
            return { success: false, error: 'غير مصرح لك بتعديل هذا المكان' };
        }

        // 2. Update place
        const { error } = await supabase
            .from('places')
            .update(data)
            .eq('id', placeId);

        if (error) throw error;

        // Invalidate cache
        cacheManager.invalidatePlace(place.slug, placeId);

        return { success: true };
    } catch (error) {
        console.error('Error updating place:', error);
        return { success: false, error: 'حدث خطأ أثناء تحديث المكان' };
    }
}
