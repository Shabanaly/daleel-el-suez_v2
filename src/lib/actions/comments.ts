'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/client-service';
import { unstable_cache } from 'next/cache';
import { cacheManager, tags } from '../cache';

/**
 * Adds a comment to a post.
 */
export async function addComment(postId: string, content: string, parentId?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'يجب تسجيل الدخول للتعليق' };

    const { data, error } = await supabase
        .from('comments')
        .insert({
            post_id: postId,
            author_id: user.id,
            content: content,
            parent_id: parentId || null
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding comment:', error);
        return { error: 'حدث خطأ أثناء إضافة التعليق' };
    }

    // --- Notification Logic ---
    // Fetch post author to notify them
    const { data: postData } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single();
        
    // Send notification if the commenter is not the post author
    if (postData && postData.author_id !== user.id) {
        const { createNotification } = await import('@/lib/services/notifications');
        await createNotification({
            userId: postData.author_id,
            title: 'تعليق جديد',
            message: 'قام أحد الأعضاء بالتعليق على منشورك في المجتمع',
            type: 'COMMUNITY',
            link: `/community/posts/${postId}`
        });
    }

    cacheManager.invalidateComment(postId);

    return { success: true, comment: data };
}

/**
 * Deletes a comment.
 */
export async function deleteComment(commentId: string, postId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'غير مصرح به' };

    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', user.id);

    if (error) {
        console.error('Error deleting comment:', error);
        return { error: 'حدث خطأ أثناء حذف التعليق' };
    }

    cacheManager.invalidateComment(postId);

    return { success: true };
}

/**
 * Fetches comments for a post.
 */
export async function getPostComments(postId: string) {
    return unstable_cache(
        async (id: string) => {
            const supabase = createServiceClient();

            const { data, error } = await supabase
                .from('comments')
                .select(`
                    *,
                    author:profiles!author_id(id, username, full_name, avatar_url)
                `)
                .eq('post_id', id)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching comments:', error);
                return [];
            }

            return data || [];
        },
        [`comments-${postId}`],
        { tags: [tags.postComments(postId), tags.allPosts()], revalidate: 86400 }
    )(postId);
}
