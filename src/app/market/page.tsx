import { MarketClient } from './_components/MarketClient';
import type { Metadata } from 'next';
import { getMarketCategories, getMarketAds, getMarketHomePageData } from '@/lib/actions/market';
import { MarketAd, MarketCategory } from '@/lib/types/market';

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

interface Props {
    searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function MarketPage({ searchParams }: Props) {
    const params = await searchParams;
    const q = params.q || '';
    const category = params.category || 'all';
    
    // 1. Fetch Categories and Highlights first
    const [categories, highlights] = await Promise.all([
        getMarketCategories(),
        getMarketHomePageData()
    ]);

    // 2. Collect IDs to exclude from main results to avoid duplicates
    const excludeIds = [
        ...highlights.trendingAds.map(ad => ad.id),
        ...highlights.latestAds.map(ad => ad.id)
    ];

    // 3. Fetch main ads excluding the ones already shown in highlights (only if not searching)
    const adsResult = await getMarketAds(
        1, 
        category === 'all' ? undefined : category, 
        q, 
        20, 
        q ? [] : excludeIds
    );
    
    return (
        <MarketClient 
            initialCategories={categories as MarketCategory[]} 
            initialAds={adsResult.ads as MarketAd[]}
            initialTotal={adsResult.total}
            initialQuery={q}
            initialCategory={category}
            trendingAds={highlights.trendingAds}
            latestAds={highlights.latestAds}
            excludeIds={excludeIds}
        />
    );
}