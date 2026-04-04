'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/client-service';
import { unstable_cache } from 'next/cache';
import { cacheManager, tags } from '@/lib/cache';
import { NotificationService } from '@/lib/notifications/service';
import { NotificationEvent } from '@/lib/notifications/types';

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
        .select(`
            *,
            author:profiles!author_id(id, username, full_name, avatar_url)
        `)
        .single();

    if (error) {
        console.error('Error adding comment:', error);
        return { error: 'حدث خطأ أثناء إضافة التعليق' };
    }

    // --- Notification Logic ---
    if (data) {
        // Fetch post author and some post details for a better notification
        const { data: postData } = await supabase
            .from('posts')
            .select('author_id, content, title')
            .eq('id', postId)
            .single();
            
        if (postData) {
            try {
                // Use the author data we already got from the insert.select()
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const profile = (data as any)?.author;
                const actorName = profile?.full_name || profile?.username || 'عضو في المجتمع';
                const postTitle = postData.content || postData.title || 'منشور';

                // 1. If it's a reply, notify the parent comment author
                if (parentId) {
                    const { data: parentComment } = await supabase
                        .from('comments')
                        .select('author_id')
                        .eq('id', parentId)
                        .single();

                    if (parentComment && parentComment.author_id && parentComment.author_id !== user.id) {
                        await NotificationService.trigger(NotificationEvent.COMMENT_REPLIED, {
                            postId,
                            postTitle: postTitle,
                            parentCommentId: parentId,
                            actorName,
                            recipientId: parentComment.author_id,
                            actorId: user.id,
                        });
                    }
                }

                // 2. Notify the post author (if not the actor and not already notified as parent author)
                if (postData.author_id && postData.author_id !== user.id) {
                    await NotificationService.trigger(NotificationEvent.COMMENT_ADDED, {
                        postId,
                        postTitle: postTitle,
                        actorName,
                        recipientId: postData.author_id,
                        actorId: user.id,
                    });
                }
            } catch (notifErr) {
                console.error("Failed to send comment notification:", notifErr);
            }
        }
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
