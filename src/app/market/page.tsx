import { Suspense } from 'react';
import { MarketClient } from './_components/MarketClient';
import type { Metadata } from 'next';
import { getMarketCategories, getMarketAds, getMarketHomePageData } from '@/lib/actions/market';
import { getAreasAction, getDistricts } from '@/lib/actions/areas';
import { MarketAd, MarketCategory } from '@/lib/types/market';
import { MarketSortOption } from '@/hooks/useMarketFilter';

export const metadata: Metadata = {
    title: 'سوق السويس | بيع وشراء، مستعمل، وعروض في السويس',
    description: 'سوق السويس المحلي - أفضل منصة لبيع وشراء المنتجات الجديدة والمستعملة، العقارات، والسيارات في محافظة السويس. أضف إعلانك الآن مجاناً.',
    keywords: [
        "سوق السويس", "بيع وشراء السويس", "مستعمل السويس", "اعلانات مبوبة السويس", 
        "حراج السويس", "عقارات السويس", "سيارات للبيع في السويس", "خدمات السويس"
    ],
    openGraph: {
        title: 'سوق السويس - بيع وشراء في السويس',
        description: 'منصة أهل السويس لبيع وشراء كل شيء. تصفح آلاف العروض المتاحة الآن.',
        type: 'website',
        locale: 'ar_EG',
    }
};

export default async function MarketPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const areaName = params.area as string;
    const categoryName = (params.category as string) || 'all';
    const query = (params.q as string) || '';
    const sort = (typeof params.sort === 'string' && ['newest', 'cheapest', 'expensive', 'trending'].includes(params.sort) 
        ? params.sort as MarketSortOption 
        : 'newest');
    
    // 1. Fetch metadata (categories, districts, areas) & highlights
    const [categories, districts, allAreas, highlights] = await Promise.all([
        getMarketCategories(),
        getDistricts(),
        getAreasAction(),
        getMarketHomePageData()
    ]);

    // 2. Resolve IDs for filtering
    const area = allAreas.find(a => a.name === areaName);

    // 3. Collect IDs to exclude from main results to avoid duplicates (only for trending section)
    const excludeIds = [
        ...highlights.trendingAds.map(ad => ad.id),
    ];

    // Check if we have active filters
    const hasFilters = query !== '' || categoryName !== 'all' || areaName || sort !== 'newest' || page > 1;

    // 4. Fetch main ads excluding the ones already shown in highlights (only if not searching/filtering)
    const adsResult = await getMarketAds(
        page, 
        categoryName === 'all' ? undefined : categoryName, 
        query, 
        20, 
        hasFilters ? [] : excludeIds,
        area?.id,
        sort
    );
    
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-primary animate-pulse">جاري تحميل الإعلانات...</div>}>
            <MarketClient 
                initialCategories={categories as MarketCategory[]} 
                districts={districts}
                areas={allAreas}
                initialAds={adsResult.ads as MarketAd[]}
                initialTotal={adsResult.total}
                trendingAds={hasFilters ? [] : highlights.trendingAds}
                latestAds={hasFilters ? [] : highlights.latestAds}
                excludeIds={hasFilters ? [] : excludeIds}
            />
        </Suspense>
    );
}