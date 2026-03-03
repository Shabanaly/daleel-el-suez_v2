'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/client-service';
import { unstable_cache } from 'next/cache';

export async function getUserProfileStats(userId: string) {
    return unstable_cache(
        async (uid: string) => {
            const supabase = createServiceClient();
            try {
                const [reviewsResponse, placesResponse, postsResponse] = await Promise.all([
                    supabase
                        .from('reviews')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', uid),
                    supabase
                        .from('places')
                        .select('*', { count: 'exact', head: true })
                        .eq('added_by', uid),
                    supabase
                        .from('posts')
                        .select('*', { count: 'exact', head: true })
                        .eq('author_id', uid),
                ]);

                return {
                    reviewsCount: reviewsResponse.count || 0,
                    placesCount: placesResponse.count || 0,
                    postsCount: postsResponse.count || 0,
                };
            } catch (error) {
                console.error('Error fetching user stats:', error);
                return { reviewsCount: 0, placesCount: 0, postsCount: 0 };
            }
        },
        [`user-stats-${userId}`],
        { tags: [`user-${userId}-stats`], revalidate: false }
    )(userId);
}

export async function getUserActivities(userId: string, limit = 10) {
    return unstable_cache(
        async (uid: string, cacheLimit: number) => {
            const supabase = createServiceClient();

            try {
                // Fetch recent reviews
                const { data: reviews, error: reviewsError } = await supabase
                    .from('reviews')
                    .select(`
                        id,
                        rating,
                        comment,
                        created_at,
                        place_id,
                        places (
                            id,
                            name,
                            slug,
                            images
                        )
                    `)
                    .eq('user_id', uid)
                    .order('created_at', { ascending: false })
                    .limit(cacheLimit);

                if (reviewsError) console.error('Error fetching reviews:', reviewsError);

                // Fetch recent places added
                const { data: places, error: placesError } = await supabase
                    .from('places')
                    .select(`
                        id,
                        name,
                        slug,
                        images,
                        category_id,
                        created_at,
                        categories (
                            name,
                            icon
                        )
                    `)
                    .eq('added_by', uid)
                    .order('created_at', { ascending: false })
                    .limit(cacheLimit);

                if (placesError) console.error('Error fetching user places:', placesError);

                // Format activities
                const formattedReviews = (reviews || []).map((review) => {
                    const place = Array.isArray(review.places) ? review.places[0] : review.places;
                    return {
                        id: `review-${review.id}`,
                        type: 'review' as const,
                        title: `قيمت المراجعة ${place?.name || 'مكان'} بـ ${review.rating} نجوم`,
                        description: review.comment || 'بدون تعليق',
                        date: review.created_at,
                        link: `/places/${review.place_id}`,
                        image: Array.isArray(place?.images) ? place.images[0] : null,
                        rating: review.rating,
                    };
                });

                const formattedPlaces = (places || []).map((place) => {
                    const category = Array.isArray(place.categories) ? place.categories[0] : place.categories;
                    return {
                        id: `place-${place.id}`,
                        type: 'place' as const,
                        title: `أضفت مكان جديد: ${place.name}`,
                        description: `تمت الإضافة تحت تصنيف ${category?.name || 'آخر'}`,
                        date: place.created_at,
                        link: `/places/${place.slug || place.id}`,
                        image: Array.isArray(place.images) ? place.images[0] : null,
                        category: category?.name,
                    };
                });

                // Sort combined activities by date descending
                const allActivities = [...formattedReviews, ...formattedPlaces].sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                );

                return {
                    activities: allActivities.slice(0, cacheLimit),
                    reviews: formattedReviews,
                    places: formattedPlaces,
                    success: true
                };

            } catch (error) {
                console.error('Error fetching user activities:', error);
                return { activities: [], reviews: [], places: [], success: false, error: 'حدث خطأ غير متوقع' };
            }
        },
        [`user-activities-${userId}-${limit}`],
        { tags: [`user-${userId}-activities`], revalidate: false }
    )(userId, limit);
}
