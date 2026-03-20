import { Metadata } from 'next';
import { getMarketCategories } from '@/lib/actions/market';
import CategoriesGrid from './_components/CategoriesGrid';
import { MarketCategory } from '@/lib/types/market';

export const metadata: Metadata = {
    title: 'جميع الأقسام - سوق السويس',
    description: 'تصفح جميع أقسام سوق السويس وتعرف على أحدث الإعلانات والمنتجات المتوفرة في كل تصنيف.',
};

export default async function MarketCategoriesPage() {
    const categories = await getMarketCategories();

    return (
        <CategoriesGrid categories={categories as MarketCategory[]} />
    );
}
