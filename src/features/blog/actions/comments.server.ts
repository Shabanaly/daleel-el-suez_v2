'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/client-service';
import { unstable_cache } from 'next/cache';
import { cacheManager, tags } from '@/lib/cache';

/**
 * 📝 Fetch comments for a blog post
 */
export async function getBlogComments(postId: string) {
    return unstable_cache(
        async (id: string) => {
            const supabase = createServiceClient();

            const { data, error } = await supabase
                .from('blog_comments')
                .select(`
                    *,
                    author:profiles!user_id(id, full_name, avatar_url)
                `)
                .eq('blog_post_id', id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching blog comments:', error);
                return [];
            }

            return data || [];
        },
        [`blog-comments-${postId}`],
        { tags: [tags.blogComments(postId)], revalidate: 3600 }
    )(postId);
}

/**
 * ➕ Add a new comment to a blog post
 */
export async function createBlogComment(
    postId: string, 
    postSlug: string,
    content: string, 
    honeypot?: string
) {
    // 🛡️ Honeypot check (anti-spam)
    if (honeypot) {
        console.warn('Spam detected via blog honeypot');
        return { error: 'تم اكتشاف نشاط مشبوه' };
    }

    if (!content || content.trim().length < 2) {
        return { error: 'التعليق قصير جداً' };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'يجب تسجيل الدخول للتعليق' };

    const { data, error } = await supabase
        .from('blog_comments')
        .insert({
            blog_post_id: postId,
            user_id: user.id,
            content: content.trim()
        })
        .select(`
            *,
            author:profiles!user_id(id, full_name, avatar_url)
        `)
        .single();

    if (error) {
        console.error('Error adding blog comment:', error);
        return { error: 'حدث خطأ أثناء إضافة التعليق' };
    }

    // 🔥 Invalidate cache
    cacheManager.invalidateBlogComment(postId, postSlug);

    return { success: true, comment: data };
}

/**
 * 🗑️ Delete a comment
 */
export async function deleteBlogComment(commentId: string, postId: string, postSlug: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'غير مصرح به' };

    // Check if user is owner or admin (admin check can be added if profile has role)
    const { error } = await supabase
        .from('blog_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error deleting blog comment:', error);
        return { error: 'حدث خطأ أثناء حذف التعليق' };
    }

    // 🔥 Invalidate cache
    cacheManager.invalidateBlogComment(postId, postSlug);

    return { success: true };
}
