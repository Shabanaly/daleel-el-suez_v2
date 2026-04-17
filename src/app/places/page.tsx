import { Suspense } from 'react';
import { getPlaces } from '@/features/places/actions/places.server';
import { getCategories, getCategoriesWithIds } from '@/features/taxonomy/actions/categories';

import { PlacesClient } from '@/features/places/components/PlacesClient';
import { getAreasAction } from '@/features/taxonomy/actions/areas';
import { getDistricts } from '@/features/taxonomy/actions/districts';
import type { Metadata } from 'next';
import { SortOption } from '@/features/places/types';
import { ROUTES } from '@/constants/routes';
import { APP_CONFIG } from '@/constants/config';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }): Promise<Metadata> {
    const params = await searchParams;
    const categoryName = params.category as string;
    const areaName = params.area as string;
    const query = params.q as string;
    const page = Number(params.page) || 1;
    const pageSuffix = page > 1 ? ` - صفحة ${page}` : '';

    let title = 'دليل السويس الشامل | خدمات، أماكن، ومطاعم';
    let description = 'دليلك الشامل لمحافظة السويس. ابحث عن أفضل المطاعم، العيادات، المحلات، والخدمات الحكومية. اكتشف تقييمات وتفاصيل أكثر من 1000 مكان في السويس.';

    if (categoryName && areaName) {
        title = `${categoryName} في ${areaName} | دليل السويس`;
        description = `اكتشف أفضل ${categoryName} في منطقة ${areaName} بالسويس. مواعيد العمل، أرقام التليفون، والتقييمات الحقيقية.`;
    } else if (categoryName) {
        title = `أفضل ${categoryName} في السويس | دليل السويس`;
        description = `دليلك لأفضل ${categoryName} في محافظة السويس. اطلع على العناوين والتقييمات وتواصل مباشرة.`;
    } else if (areaName) {
        title = `دليل الخدمات في ${areaName} | السويس`;
        description = `كل الخدمات والأماكن المتاحة في منطقة ${areaName} بالسويس. بحث شامل وسريع.`;
    } else if (query) {
        title = `نتائج البحث عن: ${query} | دليل السويس`;
        description = `نتائج البحث عن ${query} في السويس. اعثر على ما تحتاجه بسرعة وسهولة.`;
    }

    title += pageSuffix;

    // Build canonical URL with relevant filters
    const searchParamsObj = new URLSearchParams();
    if (categoryName) searchParamsObj.set('category', categoryName);
    if (areaName) searchParamsObj.set('area', areaName);
    if (query) searchParamsObj.set('q', query);
    if (page > 1) searchParamsObj.set('page', page.toString());
    
    const queryString = searchParamsObj.toString();
    const canonical = queryString 
        ? `${APP_CONFIG.BASE_URL}${ROUTES.PLACES}?${queryString}`
        : `${APP_CONFIG.BASE_URL}${ROUTES.PLACES}`;

    return {
        title,
        description,
        alternates: {
            canonical,
        },
        keywords: [
            categoryName, areaName, query, 
            "مطاعم السويس", "عيادات السويس", "بنوك السويس", "محلات السويس", "خدمات السويس", 
            "دليل السويس", "أماكن ترفيه في السويس", "صيدليات السويس", "مدارس السويس"
        ].filter(Boolean) as string[],
        openGraph: {
            title,
            description,
            type: 'website',
            url: canonical,
        },
        robots: {
            index: true,
            follow: true,
        }
    };
}


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


