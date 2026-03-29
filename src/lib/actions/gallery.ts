'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '../supabase/client-service';
import { revalidatePath } from 'next/cache';

export type GalleryImage = {
    id: string;
    url: string;
    title: string;
    category?: string;
    user_id?: string;
    views_count: number;
    is_approved: boolean;
    created_at: string;
    public_id?: string;
    profiles?: {
        full_name: string;
        avatar_url: string;
        username: string;
    };
};

/**
 * Fetch images with pagination and optional sorting.
 */
export async function getGalleryImages(
    limit: number = 20,
    offset: number = 0,
    category?: string,
    onlyApproved: boolean = true
) {
    const supabase = await createClient();
    
    let query = supabase
        .from('gallery_images')
        .select(`
            *,
            profiles:user_id (
                full_name,
                avatar_url,
                username
            )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (onlyApproved) {
        query = query.eq('is_approved', true);
    }

    if (category && category !== 'الكل') {
        query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching gallery images:', error);
        return [];
    }

    return data as GalleryImage[];
}

import { unstable_cache } from 'next/cache';

/**
 * Fetch the top 5 most viewed approved images.
 * Cached for 2 hours as these don't change very frequently.
 */
export async function getTopGalleryImages(limit: number = 5) {
    return unstable_cache(
        async (l: number) => {
            const supabase = createServiceClient();
            
            const { data, error } = await supabase
                .from('gallery_images')
                .select(`
                    *,
                    profiles:user_id (
                        full_name,
                        avatar_url,
                        username
                    )
                `)
                .eq('is_approved', true)
                .order('views_count', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(l);

            if (error) {
                console.error('Error fetching top gallery images:', error);
                return [];
            }

            return data as GalleryImage[];
        },
        [`top-gallery-images-${limit}`],
        { 
            tags: ['gallery-top', 'gallery'],
            revalidate: 7200 // 2 hours
        }
    )(limit);
}

/**
 * Add a new image to the gallery.
 */
export async function addGalleryImage(data: {
    url: string;
    title: string;
    category?: string;
    public_id?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const { data: insertion, error } = await supabase
        .from('gallery_images')
        .insert({
            ...data,
            user_id: user.id,
            is_approved: false, // Default to pending moderation
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding gallery image:', error);
        throw new Error('Failed to add image to gallery');
    }

    revalidatePath('/');
    revalidatePath('/gallery');
    
    return insertion;
}

/**
 * Increment the view count for a specific image.
 */
export async function incrementImageViews(id: string) {
    const supabase = await createClient();
    
    const { error } = await supabase.rpc('increment_gallery_view', { x: 1, row_id: id });

    // Fallback if RPC doesn't exist yet, we'll try direct update
    if (error) {
        const { error: updateError } = await supabase
            .from('gallery_images')
            .update({ views_count: (await supabase.from('gallery_images').select('views_count').eq('id', id).single()).data?.views_count + 1 })
            .eq('id', id);
        
        if (updateError) {
            console.error('Error incrementing view count:', updateError);
        }
    }
}
