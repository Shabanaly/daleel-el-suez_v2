import { Suspense } from 'react';
import { getPlaces } from '@/lib/actions/places';
import { getCategories, getCategoriesWithIds } from '@/lib/actions/categories';

import { PlacesClient } from './_components/PlacesClient';
import { getAreasAction, getDistricts } from '@/lib/actions/areas';
import type { Metadata } from 'next';
import { SortOption } from '@/lib/types/places';

export const metadata: Metadata = {
    title: 'دليل السويس الشامل | خدمات، أماكن، ومطاعم',
    description: 'دليلك الشامل لمحافظة السويس. ابحث عن أفضل المطاعم، العيادات، المحلات، والخدمات الحكومية. اكتشف تقييمات وتفاصيل أكثر من 1000 مكان في السويس.',
    keywords: [
        "مطاعم السويس", "عيادات السويس", "بنوك السويس", "محلات السويس", "خدمات السويس", 
        "دليل السويس", "أماكن ترفيه في السويس", "صيدليات السويس", "مدارس السويس"
    ],
    openGraph: {
        title: 'دليل السويس | اكتشف أفضل الأماكن والخدمات',
        description: 'كل ما تحتاجه في السويس في مكان واحد. بحث سهل وسريع عن كل الخدمات.',
        type: 'website',
    }
};


export default async function PlacesPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const areaName = params.area as string;
    const categoryName = params.category as string;
    const query = params.q as string;
    const sort = (typeof params.sort === 'string' && ['name', 'newest', 'trending'].includes(params.sort) 
        ? params.sort as SortOption 
        : 'trending');

    // 1. Fetch metadata (categories, districts, areas)
    const [categoriesList, categoriesWithIds, districts, allAreas] = await Promise.all([
        getCategories(),
        getCategoriesWithIds(),
        getDistricts(),
        getAreasAction()
    ]);

    // 2. Resolve IDs for filtering
    const category = categoriesWithIds.find(c => c.name === categoryName);
    const area = allAreas.find(a => a.name === areaName);

    // 3. Fetch paginated places
    const { places: initialPlaces, total } = await getPlaces(page, category?.id, area?.id, sort, query);

    // 🎨 Pass the raw data down to the Client Component
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-primary animate-pulse">جاري تحميل الأماكن...</div>}>
            <PlacesClient
                initialPlaces={initialPlaces}
                totalCount={total}
                categories={categoriesList}
                areas={allAreas}
                districts={districts}
            />
        </Suspense>
    );
}


