'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/client-service';
import { unstable_cache } from 'next/cache';
import { revalidatePath } from 'next/cache';
import { cacheManager, tags } from '@/lib/cache';
import { deleteCloudinaryImage } from '@/lib/actions/media';

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

    cacheManager.invalidatePost(data.id, user.id);
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

    cacheManager.invalidatePost(postId, user.id);
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
        post.public_ids.forEach((pid: string) => deleteCloudinaryImage(pid).catch(console.error));
    }

    cacheManager.invalidatePost(postId, user.id);
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

    cacheManager.invalidatePost(postId, user.id);
    return { success: true, isLiked: !existing };
}

/**
 * Fetches community posts with a custom ranking algorithm and search support.
 */
export async function getCommunityPosts(categoryId?: number, search?: string, page = 1, limit = 10, currentUserId?: string | null) {
    return unstable_cache(
        async (catId?: number, queryStr?: string, p = 1, l = 10, userId?: string | null) => {
            const supabase = createServiceClient();

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

            if (catId) query = query.eq('category_id', catId);
            if (queryStr) query = query.ilike('content', `%${queryStr}%`);

            // Order by date and limit to a reasonable pool (e.g., 200) to keep ranking fast
            const { data: posts, error } = await query
                .order('created_at', { ascending: false })
                .limit(200);

            if (error || !posts) return [];

            const now = new Date();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rankedPosts = posts.map((post: any) => {
                const commentCount = post.comments_count?.[0]?.count || 0;
                const likesCount = post.likes_count || 0;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const isLiked = userId ? post.likes?.some((l: any) => l.user_id === userId) : false;
                const createdDate = new Date(post.created_at);
                const hoursSince = Math.max(0, (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60));
                const score = (likesCount * 2 + commentCount + 1) / Math.pow(hoursSince + 2, 1.5);

                return { ...post, score, commentCount, isLiked };
            });

            rankedPosts.sort((a, b) => b.score - a.score);
            const start = (p - 1) * l;
            return rankedPosts.slice(start, start + l);
        },
        [`community-posts-${categoryId || 'all'}-${search || 'no-search'}-p${page}-u${currentUserId || 'guest'}`],
        { tags: [tags.allPosts()], revalidate: 86400 }
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

            if (error || !data) return null;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const isLiked = userId ? data.likes?.some((l: any) => l.user_id === userId) : false;

            return {
                ...data,
                commentCount: data.comments_count?.[0]?.count || 0,
                isLiked
            };
        },
        [`post-${id}-u${currentUserId || 'guest'}`],
        { tags: [tags.post(id), tags.allPosts()], revalidate: 86400 }
    )(id, currentUserId);
}

/**
 * Fetches all active post IDs for sitemap.
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

            if (error) return [];
            return data;
        },
        ['sitemap-posts'],
        { tags: [tags.allPosts()], revalidate: 86400 }
    )();
}
