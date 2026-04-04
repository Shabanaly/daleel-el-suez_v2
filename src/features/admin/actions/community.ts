'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidateTag } from 'next/cache';
import { tags } from '@/lib/cache';

export async function getAdminCommunityPosts(page = 1, limit = 50, search?: string) {
    const supabase = createAdminClient();
    const offset = (page - 1) * limit;

    let query = supabase
        .from('posts')
        .select(`
            *,
            author:profiles!author_id(id, username, full_name, avatar_url),
            category:categories(id, name, icon),
            comments_count:comments(count)
        `, { count: 'exact' });

    if (search) {
        query = query.ilike('content', `%${search}%`);
    }

    const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('getAdminCommunityPosts error:', error);
        return { posts: [], total: 0 };
    }

    return {
        posts: data || [],
        total: count || 0
    };
}

export async function deletePostAdmin(id: string) {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('deletePostAdmin error:', error);
        return { success: false, error: error.message };
    }

    revalidateTag(tags.allPosts(), 'max');
    revalidateTag(tags.post(id), 'max');
    
    return { success: true };
}

export async function updatePostStatusAdmin(id: string, status: string) {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('posts')
        .update({ status })
        .eq('id', id);

    if (error) {
        console.error('updatePostStatusAdmin error:', error);
        return { success: false, error: error.message };
    }

    revalidateTag(tags.allPosts(), 'max');
    revalidateTag(tags.post(id), 'max');
    
    return { success: true };
}
