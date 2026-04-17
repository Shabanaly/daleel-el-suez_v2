import { Suspense } from 'react';
import { MarketClient } from '@/features/market/components/MarketClient';
import type { Metadata } from 'next';
import { getMarketCategories, getMarketAds, getMarketHomePageData } from '@/features/market/actions/market.server';
import { getAreasAction } from '@/features/taxonomy/actions/areas';
import { getDistricts } from '@/features/taxonomy/actions/districts';
import { MarketAd, MarketCategory } from '@/features/market/types';
import { MarketSortOption } from '@/features/market/hooks/useMarketFilter';
import { APP_CONFIG, ROUTES } from '@/constants';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }): Promise<Metadata> {
    const params = await searchParams;
    const categoryName = params.category as string;
    const areaName = params.area as string;
    const query = params.q as string;
    const page = Number(params.page) || 1;
    const pageSuffix = page > 1 ? ` - صفحة ${page}` : '';

    let title = 'سوق السويس | بيع وشراء، مستعمل، وعروض في السويس';
    let description = 'سوق السويس المحلي - أفضل منصة لبيع وشراء المنتجات الجديدة والمستعملة في محافظة السويس. أضف إعلانك الآن مجاناً.';

    if (categoryName && categoryName !== 'all') {
        title = `سوق ال${categoryName} في السويس | عروض ومستعمل`;
        description = `تصفح أحدث إعلانات ${categoryName} في السويس. بيع وشراء بأفضل الأسعار وتواصل مباشر مع البائعين.`;
    }
    
    if (areaName) {
        title = `${title} - في ${areaName}`;
        description = `${description} متاح في منطقة ${areaName}.`;
    }

    if (query) {
        title = `نتائج البحث عن "${query}" في سوق السويس`;
        description = `استعرض كل العروض المتعلقة بـ ${query} في السويس. نوفر لك أفضل خيارات البيع والشراء.`;
    }

    title += pageSuffix;

    // Build canonical URL with relevant filters
    const searchParamsObj = new URLSearchParams();
    if (categoryName && categoryName !== 'all') searchParamsObj.set('category', categoryName);
    if (areaName) searchParamsObj.set('area', areaName);
    if (query) searchParamsObj.set('q', query);
    if (page > 1) searchParamsObj.set('page', page.toString());
    
    const queryString = searchParamsObj.toString();
    const canonical = queryString 
        ? `${APP_CONFIG.BASE_URL}${ROUTES.MARKET}?${queryString}`
        : `${APP_CONFIG.BASE_URL}${ROUTES.MARKET}`;

    return {
        title,
        description,
        alternates: {
            canonical,
        },
        keywords: [
            categoryName, areaName, query, 
            "سوق السويس", "بيع وشراء السويس", "مستعمل السويس", "اعلانات مبوبة السويس"
        ].filter(Boolean) as string[],
        openGraph: {
            title,
            description,
            type: 'website',
            url: canonical,
            locale: 'ar_EG',
        },
        robots: {
            index: true,
            follow: true,
        }
    };
}

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