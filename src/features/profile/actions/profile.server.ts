'use server';
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
                        .eq('added_by', uid)
                        .eq('status', 'approved'),
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
                // Fetch recent reviews, places, posts, and comments concurrently
                const [reviewsRes, placesRes, postsRes, commentsRes, ownerRepliesRes] = await Promise.all([
                    supabase
                        .from('reviews')
                        .select(`
                            id, rating, comment, created_at, place_id,
                            places (id, name, slug, images)
                        `)
                        .eq('user_id', uid)
                        .order('created_at', { ascending: false })
                        .limit(cacheLimit),
                    supabase
                        .from('places')
                        .select(`
                            id, name, slug, images, category_id, created_at,
                            categories (name, icon)
                        `)
                        .eq('added_by', uid)
                        .eq('status', 'approved')
                        .order('created_at', { ascending: false })
                        .limit(cacheLimit),
                    supabase
                        .from('posts')
                        .select(`
                            id, title, content, created_at,
                            categories (name)
                        `)
                        .eq('author_id', uid)
                        .order('created_at', { ascending: false })
                        .limit(cacheLimit),
                    supabase
                        .from('comments')
                        .select(`
                            id, content, created_at, post_id, parent_id,
                            posts (id, title, content)
                        `)
                        .eq('author_id', uid)
                        .order('created_at', { ascending: false })
                        .limit(cacheLimit),
                    supabase
                        .from('reviews')
                        .select(`
                            id, reply_text, replied_at, place_id,
                            places!inner(id, name, slug, images)
                        `)
                        .eq('places.added_by', uid)
                        .not('reply_text', 'is', 'null')
                        .order('replied_at', { ascending: false })
                        .limit(cacheLimit)
                ]);

                // Format Activities
                const formattedReviews = (reviewsRes.data || []).map((review) => {
                    const place = Array.isArray(review.places) ? review.places[0] : review.places;
                    return {
                        id: `review-${review.id}`,
                        type: 'review' as const,
                        title: `قيمت ${place?.name || 'مكان'} بـ ${review.rating} نجوم`,
                        description: review.comment || 'بدون تعليق',
                        date: review.created_at,
                        link: `/places/${place?.slug || review.place_id}`,
                        image: Array.isArray(place?.images) ? place.images[0] : null,
                        rating: review.rating,
                    };
                });

                const formattedOwnerReplies = (ownerRepliesRes.data || []).map((review) => {
                    const place = Array.isArray(review.places) ? review.places[0] : review.places;
                    return {
                        id: `owner-reply-${review.id}`,
                        type: 'comment' as const, // Use comment type for similar styling
                        title: `رددت على تقييم في ${place?.name || 'مكانك'}`,
                        description: review.reply_text,
                        date: review.replied_at,
                        link: `/places/${place?.slug || review.place_id}`,
                        image: Array.isArray(place?.images) ? place.images[0] : null,
                    };
                });

                const formattedPlaces = (placesRes.data || []).map((place) => {
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

                const formattedPosts = (postsRes.data || []).map((post) => {
                    return {
                        id: `post-${post.id}`,
                        type: 'post' as const,
                        title: `نشرت منشوراً جديداً`,
                        description: post.title || post.content.substring(0, 100),
                        date: post.created_at,
                        link: `/community/posts/${post.id}`,
                    };
                });

                const formattedComments = (commentsRes.data || []).map((comment) => {
                    const post = Array.isArray(comment.posts) ? comment.posts[0] : comment.posts;
                    const isReply = !!comment.parent_id;
                    
                    // Use title if available, otherwise use excerpt of content
                    const postDisplayName = post?.title || 
                        (post?.content ? `${post.content.substring(0, 30)}...` : 'منشور');

                    return {
                        id: `comment-${comment.id}`,
                        type: 'comment' as const,
                        title: isReply ? `رددت على تعليق في: ${postDisplayName}` : `علقت على: ${postDisplayName}`,
                        description: comment.content,
                        date: comment.created_at,
                        link: `/community/posts/${comment.post_id}`,
                    };
                });

                // Sort combined activities by date descending
                const allActivities = [
                    ...formattedReviews, 
                    ...formattedOwnerReplies,
                    ...formattedPlaces, 
                    ...formattedPosts, 
                    ...formattedComments
                ].sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                );

                return {
                    activities: allActivities.slice(0, cacheLimit),
                    reviews: formattedReviews,
                    places: formattedPlaces,
                    posts: formattedPosts,
                    comments: formattedComments,
                    success: true
                };

            } catch (error) {
                console.error('Error fetching user activities:', error);
                return { activities: [], reviews: [], places: [], posts: [], comments: [], success: false, error: 'حدث خطأ غير متوقع' };
            }
        },
        [`user-activities-${userId}-${limit}`],
        { tags: [`user-${userId}-activities`], revalidate: false }
    )(userId, limit);
}
