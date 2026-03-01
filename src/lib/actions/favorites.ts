'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/client-service';
import { unstable_cache, revalidateTag } from 'next/cache';
import { mapPlace } from '../utils/mappers';

/**
 * Toggles a favorite item for the current user.
 * Supports 'place' and 'listing' (market) types.
 */
export async function toggleFavorite(itemId: string, itemType: 'place' | 'listing') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'يجب تسجيل الدخول لإضافة للمفضلة' };
    }

    // Check if already exists
    const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .eq('item_type', itemType)
        .single();

    if (existing) {
        // Remove from favorites
        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('id', existing.id);

        if (error) {
            console.error('Error removing favorite:', error);
            return { error: 'حدث خطأ أثناء الحذف من المفضلة' };
        }
    } else {
        // Add to favorites
        const { error } = await supabase
            .from('favorites')
            .insert({
                user_id: user.id,
                item_id: itemId,
                item_type: itemType
            });

        if (error) {
            console.error('Error adding favorite:', error);
            return { error: 'حدث خطأ أثناء الإضافة للمفضلة' };
        }
    }

    // Revalidate relevant tags
    revalidateTag(`user-${user.id}-favorites`, 'max');

    return { success: true, isFavorite: !existing };
}

/**
 * Checks if an item is favorited by the current user.
 * Cached to reduce DB load on high-traffic pages.
 */
export async function isItemFavorite(itemId: string, itemType: 'place' | 'listing') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    return unstable_cache(
        async (uid: string, iid: string, itype: string) => {
            const svc = createServiceClient();
            const { data } = await svc
                .from('favorites')
                .select('id')
                .eq('user_id', uid)
                .eq('item_id', iid)
                .eq('item_type', itype)
                .single();

            return !!data;
        },
        [`user-${user.id}-fav-${itemId}`],
        { tags: [`user-${user.id}-favorites`], revalidate: 3600 }
    )(user.id, itemId, itemType);
}

/**
 * Fetches favorite places for a user with caching.
 */
export async function getFavoritePlaces(userId: string) {
    return unstable_cache(
        async (uid: string) => {
            const supabase = createServiceClient();

            // 1. Fetch favorite records for places
            const { data: favorites, error: favError } = await supabase
                .from('favorites')
                .select('item_id')
                .eq('user_id', uid)
                .eq('item_type', 'place');

            if (favError || !favorites || favorites.length === 0) {
                if (favError) console.error('Error fetching favorites list:', favError);
                return [];
            }

            const placeIds = favorites.map(f => f.item_id);

            // 2. Fetch full place details using the IDs
            const { data: places, error: placesError } = await supabase
                .from('places')
                .select(`
                    *,
                    categories (name, icon),
                    areas (name, districts (name))
                `)
                .in('id', placeIds);

            if (placesError) {
                console.error('Error fetching favorite places details:', placesError);
                return [];
            }

            return (places || []).map(mapPlace);
        },
        [`user-${userId}-favorite-places`],
        { tags: [`user-${userId}-favorites`], revalidate: 3600 }
    )(userId);
}
