'use server';

import { createServiceClient } from '@/lib/supabase/client-service';
import type { HeroAd } from '../types/hero-ads';
import { unstable_cache } from 'next/cache';

async function getActiveHeroAdsInternal(): Promise<HeroAd[]> {
    try {
        // نستخدم Service Client لأنه لا يعتمد على الـ cookies/headers
        const supabase = createServiceClient();
        
        const { data, error } = await supabase
            .from('hero_ads')
            .select('*')
            .eq('is_active', true)
            .order('order_index', { ascending: true });

        if (error) {
            console.error('Error fetching hero ads:', error);
            return [];
        }

        return data as HeroAd[];
    } catch (e) {
        console.error('Failed to get active hero ads', e);
        return [];
    }
}

/**
 * دالة جلب الإعلانات النشطة مع التكييش (Cache)
 * يتم تحديث الكاش كل ساعة أو عند عمل revalidate للتاج 'hero-ads'
 */
export const getActiveHeroAds = unstable_cache(
    getActiveHeroAdsInternal,
    ['hero-active-ads-v1'],
    { 
        tags: ['hero-ads', 'marketing'], 
        revalidate: 3600 // ساعة واحدة
    }
);
