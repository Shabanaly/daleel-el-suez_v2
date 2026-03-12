import { Suspense } from 'react';
import { getPlaces } from '@/lib/actions/places';
import { getCategories, getCategoriesWithIds } from '@/lib/actions/categories';

import { PlacesClient } from './_components/PlacesClient';
import { getAreasAction, getDistricts } from '@/lib/actions/areas';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'دليل الأماكن والخدمات في السويس',
    description: 'ابحث عن أفضل المحلات، المطاعم، العيادات، وكل الخدمات في السويس. تصفح بالمنطقة أو الفئة واكتشف الأماكن الأكثر تقييماً.',
};


export default async function PlacesPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const district = params.district as string;
    const areaName = params.area as string;
    const categoryName = params.category as string;
    const query = params.q as string;
    const sort = (params.sort as any) || 'trending';

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


