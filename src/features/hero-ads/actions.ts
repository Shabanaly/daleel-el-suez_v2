'use server';

import { createClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { deleteCloudinaryImage } from '@/lib/actions/media';
import { HeroAd, HeroAdFormValues } from './types';
import { CACHE_KEYS, keys } from '@/lib/cache/keys';

/**
 * Fetch all active hero ads for public display
 * 🔥 Cached with unstable_cache and revalidated via CACHE_KEYS.heroAds
 */
export const getActiveHeroAds = unstable_cache(
  async (): Promise<HeroAd[]> => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from('hero_ads')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching hero ads:', error);
      return [];
    }

    return (data as HeroAd[]) || [];
  },
  keys.heroAds(),
  {
    tags: [CACHE_KEYS.heroAds],
  }
);

/**
 * Admin: Get all hero ads (active + inactive)
 */
export async function getAllHeroAds(): Promise<HeroAd[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('hero_ads')
    .select('*')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin hero ads:', error);
    return [];
  }

  return (data as HeroAd[]) || [];
}

/**
 * Admin: Create a hero ad
 */
export async function createHeroAd(values: HeroAdFormValues): Promise<HeroAd> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('hero_ads')
    .insert([values])
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/');
  revalidatePath('/admin/hero-ads');
  revalidateTag(CACHE_KEYS.heroAds, 'max');
  return data as HeroAd;
}

/**
 * Admin: Update a hero ad
 */
export async function updateHeroAd(
  id: string,
  values: Partial<HeroAdFormValues>
): Promise<HeroAd> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('hero_ads')
    .update(values)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/');
  revalidatePath('/admin/hero-ads');
  revalidateTag(CACHE_KEYS.heroAds, 'max');
  return data as HeroAd;
}

/**
 * Admin: Delete a hero ad
 */
export async function deleteHeroAd(id: string): Promise<{ success: boolean }> {
  const supabase = createAdminClient();

  // Fetch the ad first to get the media_url for deletion
  const { data: ad } = await supabase
    .from('hero_ads')
    .select('media_url')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('hero_ads')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  // Attempt to delete from Cloudinary if there's an image
  if (ad?.media_url && ad.media_url.includes('cloudinary.com')) {
    try {
      const parts = ad.media_url.split('/upload/');
      if (parts.length >= 2) {
        const withoutVersion = parts[1].replace(/^v\d+\//, '');
        const lastDotIndex = withoutVersion.lastIndexOf('.');
        const publicId = lastDotIndex !== -1 ? withoutVersion.substring(0, lastDotIndex) : withoutVersion;
        await deleteCloudinaryImage(publicId);
      }
    } catch (err) {
      console.error('Failed to delete cloudinary image for hero ad:', err);
    }
  }

  revalidatePath('/');
  revalidatePath('/admin/hero-ads');
  revalidateTag(CACHE_KEYS.heroAds, 'max');
  return { success: true };
}
