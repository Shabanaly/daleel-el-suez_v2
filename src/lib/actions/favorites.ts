'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/client-service';
import { unstable_cache, revalidateTag } from 'next/cache';
import { mapPlace } from '../utils/mappers';
import { tags, keys, cacheManager } from '@/lib/cache';
import { NotificationService } from '@/lib/notifications/service';
import { NotificationEvent } from '@/lib/notifications/types';

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
        const { error: removeError } = await supabase
            .from('favorites')
            .delete()
            .eq('id', existing.id);

        if (removeError) {
            console.error('Error removing favorite:', removeError);
            return { error: 'حدث خطأ أثناء الحذف من المفضلة' };
        }
    } else {
        // Add to favorites
        const { error: insertError } = await supabase
            .from('favorites')
            .insert({
                user_id: user.id,
                item_id: itemId,
                item_type: itemType
            });

        if (insertError) {
            console.error('Error adding favorite:', insertError);
            return { error: 'حدث خطأ أثناء الإضافة للمفضلة' };
        }
        
        // --- Notification Logic ---
        try {
            if (itemType === 'place') {
                 const { data: itemData } = await supabase
                    .from('places')
                    .select('added_by, name, slug') 
                    .eq('id', itemId)
                    .single();
                    
                 if (itemData && itemData.added_by && itemData.added_by !== user.id) {
                     // Fetch liker's name
                     const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name, username')
                        .eq('id', user.id)
                        .single();

                     await NotificationService.trigger(NotificationEvent.PLACE_FAVORITED, {
                        placeId: itemId,
                        placeName: itemData.name,
                        placeSlug: itemData.slug || itemId,
                        actorName: profile?.full_name || profile?.username || 'عضو',
                        recipientId: itemData.added_by,
                        actorId: user.id,
                     });
                 }
            }
        } catch (notifErr) {
            console.error("Failed to send favorite notification:", notifErr);
        }
    }

    // Revalidate granularly
    cacheManager.invalidateFavorites(user.id, itemId);

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
        keys.isFavorite(user.id, itemId),
        { tags: [tags.userFavorites(user.id)], revalidate: false }
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
                .eq('status', 'approved')
                .in('id', placeIds);

            if (placesError) {
                console.error('Error fetching favorite places details:', placesError);
                return [];
            }

            return (places || []).map(mapPlace);
        },
        [`user-${userId}-favorite-places`],
        { tags: [`user-${userId}-favorites`], revalidate: false }
    )(userId);
}
export async function getFavoriteAds(userId: string) {
    return unstable_cache(
        async (uid: string) => {
            const supabase = createServiceClient();

            // 1. Fetch favorite records for listings (market ads)
            const { data: favorites, error: favError } = await supabase
                .from('favorites')
                .select('item_id')
                .eq('user_id', uid)
                .eq('item_type', 'listing');

            if (favError || !favorites || favorites.length === 0) {
                if (favError) console.error('Error fetching favorite ads list:', favError);
                return [];
            }

            const adIds = favorites.map(f => f.item_id);

            // 2. Fetch full ad details
            const { data: ads, error: adsError } = await supabase
                .from('listings')
                .select(`
                    *,
                    categories (name, icon),
                    areas (name)
                `)
                .eq('status', 'active')
                .in('id', adIds);

            if (adsError) {
                console.error('Error fetching favorite ads details:', adsError);
                return [];
            }

            // Map to MarketAd type
            return (ads || []).map(ad => ({
                id: ad.id,
                title: ad.title,
                description: ad.description,
                price: ad.price,
                currency: 'ج.م',
                images: ad.images,
                category_id: ad.category_id,
                category_name: ad.categories?.name,
                location: ad.areas?.name,
                area_id: ad.area_id,
                area_name: ad.areas?.name,
                condition: ad.condition,
                status: ad.status,
                phone: ad.phone,
                whatsapp: ad.whatsapp,
                user_id: ad.user_id,
                seller_id: ad.seller_id,
                seller_name: ad.seller_name,
                seller_phone: ad.seller_phone,
                views_count: ad.views_count || 0,
                created_at: ad.created_at
            }));
        },
        [`user-${userId}-favorite-ads`],
        { tags: [`user-${userId}-favorites`], revalidate: false }
    )(userId);
}
