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

    const title = `${category.name} في السويس | بيع وشراء ${category.name}`;
    const description = `تصفح أفضل العروض والأسعار لقسم ${category.name} في سوق السويس المحلي. أعلن عن ${category.name} الخاصة بك مجاناً الآن.`;

    return {
        title,
        description,
        keywords: [category.name, `بيع وشراء ${category.name}`, "سوق السويس", "عروض السويس"],
        openGraph: {
            title,
            description,
            type: 'website',
        }
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

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `قسم ${category.name} في سوق السويس`,
        "description": `قائمة المنتجات المتاحة في قسم ${category.name}`,
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": adsResult.ads.slice(0, 10).map((ad, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `https://daleel-al-suez.com/market/${ad.slug}`
            }))
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <CategoryClient
                category={category}
                allCategories={allCategories}
                initialAds={adsResult.ads}
                initialTotal={adsResult.total}
                initialQuery={q}
            />
        </>
    );
}
