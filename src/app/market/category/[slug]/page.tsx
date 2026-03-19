import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getMarketCategoryBySlug, getMarketCategories, getMarketAds } from '@/lib/actions/market';
import { CategoryClient } from './_components/CategoryClient';

interface Props {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const category = await getMarketCategoryBySlug(slug);
    if (!category) return { title: 'تصنيف غير موجود' };
    return {
        title: `${category.name} - سوق السويس`,
        description: `تصفح إعلانات ${category.name} في سوق السويس. أفضل العروض والأسعار بين أهل السويس.`,
    };
}

export default async function CategoryPage({ params, searchParams }: Props) {
    const { slug } = await params;
    const { q } = await searchParams;

    const [category, allCategories, adsResult] = await Promise.all([
        getMarketCategoryBySlug(slug),
        getMarketCategories(),
        getMarketAds(1, slug, q),
    ]);

    if (!category) notFound();

    return (
        <CategoryClient
            category={category}
            allCategories={allCategories}
            initialAds={adsResult.ads}
            initialTotal={adsResult.total}
            initialQuery={q}
        />
    );
}
