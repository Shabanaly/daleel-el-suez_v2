import { MarketClient } from './_components/MarketClient';
import type { Metadata } from 'next';
import { getMarketCategories, getMarketAds } from '@/lib/actions/market';
import { MarketAd, MarketCategory } from '@/lib/types/market';

export const metadata: Metadata = {
    title: 'سوق السويس - بيع وشراء في السويس',
    description: 'سوق السويس المحلي - منصة لبيع وشراء المنتجات الجديدة والمستعملة بين أهل السويس بسهولة وأمان.',
};

interface Props {
    searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function MarketPage({ searchParams }: Props) {
    const params = await searchParams;
    const q = params.q || '';
    const category = params.category || 'all';
    
    const [categories, adsResult] = await Promise.all([
        getMarketCategories(),
        getMarketAds(1, category === 'all' ? undefined : category, q)
    ]);
    
    return (
        <MarketClient 
            initialCategories={categories as MarketCategory[]} 
            initialAds={adsResult.ads as MarketAd[]}
            initialTotal={adsResult.total}
            initialQuery={q}
            initialCategory={category}
        />
    );
}