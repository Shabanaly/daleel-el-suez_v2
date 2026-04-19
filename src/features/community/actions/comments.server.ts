/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/client-service';
import { unstable_cache } from 'next/cache';
import { cacheManager, tags } from '@/lib/cache';
import { NotificationService } from '@/lib/notifications/service';

/**
 * Adds a comment to a post.
 */
export async function addComment(postId: string, content: string, parentId?: string, honeypot?: string) {
    // 🛡️ Honeypot check
    if (honeypot) {
        console.warn('Spam detected via honeypot');
        return { error: 'تم اكتشاف نشاط مشبوه' };
    }

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
        .select(`
            *,
            author:profiles!author_id(id, username, full_name, avatar_url)
        `)
        .single();

    if (error) {
        console.error('Error adding comment:', error);
        return { error: 'حدث خطأ أثناء إضافة التعليق' };
    }

    cacheManager.invalidateComment(postId, user.id);

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
    cacheManager.invalidateComment(postId, user.id);

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
