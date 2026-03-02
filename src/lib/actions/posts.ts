'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/client-service';
import { unstable_cache, revalidateTag } from 'next/cache';
import { revalidatePath } from 'next/cache';

/**
 * Creates a new community post.
 */
export async function createPost(formData: {
    content: string;
    categoryId: number;
    images?: string[];
    publicIds?: string[];
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'يجب تسجيل الدخول لنشر منشور' };
    }

    const { data, error } = await supabase
        .from('posts')
        .insert({
            content: formData.content,
            category_id: formData.categoryId,
            author_id: user.id,
            images: formData.images || [],
            public_ids: formData.publicIds || [],
            status: 'active'
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating post:', error);
        return { error: 'حدث خطأ أثناء نشر المنشور' };
    }

    revalidateTag('community-posts', 'max');
    revalidatePath('/community');

    return { success: true, post: data };
}

/**
 * Updates an existing post.
 */
export async function updatePost(postId: string, formData: {
    content: string;
    categoryId: number;
    images?: string[];
    publicIds?: string[];
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'غير مصرح به' };

    const { error } = await supabase
        .from('posts')
        .update({
            content: formData.content,
            category_id: formData.categoryId,
            images: formData.images,
            public_ids: formData.publicIds
        })
        .eq('id', postId)
        .eq('author_id', user.id);

    if (error) {
        console.error('Error updating post:', error);
        return { error: 'حدث خطأ أثناء تحديث المنشور' };
    }

    revalidateTag('community-posts', 'max');
    revalidateTag(`post-${postId}`, 'max');
    revalidatePath('/community');

    return { success: true };
}

/**
 * Deletes a post.
 */
export async function deletePost(postId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'غير مصرح به' };

    // Fetch images for cleanup if needed
    const { data: post } = await supabase
        .from('posts')
        .select('public_ids')
        .eq('id', postId)
        .eq('author_id', user.id)
        .single();

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', user.id);

    if (error) {
        console.error('Error deleting post:', error);
        return { error: 'حدث خطأ أثناء حذف المنشور' };
    }

    // Cleanup images in background
    if (post?.public_ids?.length) {
        const { deleteCloudinaryImage } = await import('./media');
        post.public_ids.forEach((pid: string) => deleteCloudinaryImage(pid).catch(console.error));
    }

    revalidateTag('community-posts', 'max');
    revalidateTag(`post-${postId}`, 'max');
    revalidatePath('/community');

    return { success: true };
}

/**
 * Toggles a like on a post.
 */
export async function toggleLikePost(postId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'يجب تسجيل الدخول للإعجاب' };

    // Check if already liked
    const { data: existing } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single();

    if (existing) {
        // Unlike
        const { error } = await supabase
            .from('likes')
            .delete()
            .eq('id', existing.id);

        if (error) return { error: 'حدث خطأ' };

        // Decrement like count
        await supabase.rpc('decrement_post_likes', { target_post_id: postId });
    } else {
        // Like
        const { error } = await supabase
            .from('likes')
            .insert({
                user_id: user.id,
                post_id: postId
            });

        if (error) return { error: 'حدث خطأ' };

        // Increment like count
        await supabase.rpc('increment_post_likes', { target_post_id: postId });
    }

    revalidateTag('community-posts', 'max');
    revalidateTag(`post-${postId}`, 'max');
    return { success: true, isLiked: !existing };
}

/**
 * Fetches community posts with a custom ranking algorithm and search support.
 * Equation: (likes_count * 2 + comments_count * 1 + 1) / (hours_since_post + 2) ^ 1.5
 */
export async function getCommunityPosts(categoryId?: number, search?: string, page = 1, limit = 10, currentUserId?: string | null) {
    return unstable_cache(
        async (catId?: number, queryStr?: string, p = 1, l = 10, userId?: string | null) => {
            const supabase = createServiceClient();

            // Build base query
            let query = supabase
                .from('posts')
                .select(`
                    *,
                    author:profiles!author_id(id, username, full_name, avatar_url),
                    category:categories(id, name, icon),
                    comments_count:comments(count),
                    likes:likes(id, user_id)
                `)
                .eq('status', 'active');

            // Apply filters
            if (catId) {
                query = query.eq('category_id', catId);
            }

            if (queryStr) {
                query = query.ilike('content', `%${queryStr}%`);
            }

            const { data: posts, error } = await query;

            if (error || !posts) {
                console.error('Error fetching community posts:', error);
                return [];
            }

            // Apply Ranking Algorithm in JS
            const now = new Date();
            const rankedPosts = posts.map((post: any) => {
                const commentCount = post.comments_count?.[0]?.count || 0;
                const likesCount = post.likes_count || 0;

                // Check if user liked this post from the joined likes
                const isLiked = userId
                    ? post.likes?.some((l: any) => l.user_id === userId)
                    : false;

                const createdDate = new Date(post.created_at);
                const hoursSince = Math.max(0, (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60));

                // Score formula
                const score = (likesCount * 2 + commentCount + 1) / Math.pow(hoursSince + 2, 1.5);

                return { ...post, score, commentCount, isLiked };
            });

            // Sort by score DESC
            rankedPosts.sort((a, b) => b.score - a.score);

            // Pagination
            const start = (p - 1) * l;
            const paginated = rankedPosts.slice(start, start + l);

            return paginated;
        },
        [`community-posts-${categoryId || 'all'}-${search || 'no-search'}-p${page}-u${currentUserId || 'guest'}`],
        { tags: ['community-posts'], revalidate: 3600 } // Cache for 1 hour or until revalidated
    )(categoryId, search, page, limit, currentUserId);
}

/**
 * Fetches a single post by ID with all relations.
 */
export async function getPostById(id: string, currentUserId?: string | null) {
    return unstable_cache(
        async (postId: string, userId?: string | null) => {
            const supabase = createServiceClient();

            const { data, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    author:profiles!author_id(id, username, full_name, avatar_url),
                    category:categories(id, name, icon),
                    comments_count:comments(count),
                    likes:likes(id, user_id)
                `)
                .eq('id', postId)
                .eq('status', 'active')
                .single();

            if (error || !data) {
                console.error('Error fetching post by ID:', error);
                return null;
            }

            const isLiked = userId
                ? data.likes?.some((l: any) => l.user_id === userId)
                : false;

            return {
                ...data,
                commentCount: data.comments_count?.[0]?.count || 0,
                isLiked
            };
        },
        [`post-${id}-u${currentUserId || 'guest'}`],
        { tags: [`post-${id}`, 'community-posts'], revalidate: 3600 } // Cache for 1 hour or until revalidated
    )(id, currentUserId);
}
/**
 * Fetches all active post IDs and update times for sitemap generation.
 */
export async function getAllPosts() {
    return unstable_cache(
        async () => {
            const supabase = createServiceClient();
            const { data, error } = await supabase
                .from('posts')
                .select('id, created_at')
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching posts for sitemap:', error);
                return [];
            }

            return data;
        },
        ['sitemap-posts'],
        { tags: ['community-posts'], revalidate: 3600 } // Cache for 1 hour
    )();
}
