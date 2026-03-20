'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/client-service';
import { revalidatePath, unstable_cache } from 'next/cache';
import { cacheManager, tags } from '../cache';
import { Review } from '../types/reviews';

export async function submitReview(formData: {
    placeId: string;
    rating: number;
    comment: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'يجب تسجيل الدخول لإضافة تقييم' };
    }

    const { error } = await supabase
        .from('reviews')
        .upsert({
            place_id: formData.placeId,
            user_id: user.id,
            rating: formData.rating,
            comment: formData.comment,
        }, {
            onConflict: 'place_id,user_id'
        });

    if (error) {
        console.error('Error submitting review:', error);
        return { error: 'حدث خطأ أثناء حفظ التقييم' };
    }

    // 🔥 Granular Revalidation
    cacheManager.invalidateReview(formData.placeId, user.id);
    revalidatePath(`/places/${formData.placeId}`);
    revalidatePath('/places');

    return { success: true };
}

export async function getReviews(placeId: string, page = 1, limit = 10) {
    return unstable_cache(
        async (pId: string, p: number, l: number) => {
            const supabase = createServiceClient();

            const { data, error, count } = await supabase
                .from('reviews')
                // We use 'profiles' directly. If an alias is needed, it's safer to map it in JS 
                // to avoid PGRST200 if the FK discovery fails for Aliases.
                .select(`
                    *,
                    profiles (
                        username,
                        full_name,
                        avatar_url
                    )
                `, { count: 'exact' })
                .eq('place_id', pId)
                .order('created_at', { ascending: false })
                .range((p - 1) * l, p * l - 1);

            if (error) {
                console.error('Error fetching reviews:', error);
                return { reviews: [], count: 0 };
            }

            // Map profiles to user to maintain compatibility with the UI
            const reviewsWithUser = (data || []).map(review => {
                const { profiles, ...rest } = review as unknown as { profiles: unknown };
                return {
                    ...rest,
                    user: profiles as Review['user']
                } as Review;
            });

            return {
                reviews: reviewsWithUser,
                count: count || 0,
                timestamp: new Date().getTime()
            };
        },
        [`reviews-place-${placeId}-p${page}`],
        { tags: [tags.placeReviews(placeId), 'places'], revalidate: 86400 }
    )(placeId, page, limit);
}

export async function deleteReview(placeId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'غير مصرح به' };
    }

    const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('place_id', placeId)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error deleting review:', error);
        return { error: 'حدث خطأ أثناء حذف التقييم' };
    }

    // 🔥 Granular Revalidation
    cacheManager.invalidateReview(placeId, user.id);
    revalidatePath(`/places/${placeId}`);
    revalidatePath('/places');

    return { success: true };
}

export async function getCurrentUserReview(placeId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('place_id', placeId)
        .eq('user_id', user.id)
        .single();

    if (error || !data) return null;

    return data;
}
