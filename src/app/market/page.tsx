import { MarketClient } from './_components/MarketClient';
import type { Metadata } from 'next';
import { getMarketCategories } from '@/lib/actions/market';

export const metadata: Metadata = {
    title: 'سوق السويس - بيع وشراء في السويس',
    description: 'سوق السويس المحلي - منصة لبيع وشراء المنتجات الجديدة والمستعملة بين أهل السويس بسهولة وأمان.',
};

export default async function MarketPage() {
    const categories = await getMarketCategories();
    
    return <MarketClient initialCategories={categories} />;
}