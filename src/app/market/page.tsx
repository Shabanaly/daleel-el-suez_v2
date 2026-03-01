import { MarketClient } from './_components/MarketClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'سوق السويس - بيع وشراء في السويس',
    description: 'سوق السويس المحلي - قريباً منصة لبيع وشراء المنتجات الجديدة والمستعملة بين أهل السويس بسهولة وأمان.',
};

export default function MarketPage() {
    return <MarketClient />;
}