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
import CategoryIntro from '@/features/places/components/CategoryIntro';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }): Promise<Metadata> {
    const params = await searchParams;
    const categoryName = params.category as string;
    const areaName = params.area as string;
    const query = params.q as string;
    const page = Number(params.page) || 1;
    const pageSuffix = page > 1 ? ` - صفحة ${page}` : '';

    let title = 'أماكن السويس - اكتشف كل ما تبحث عنه في مكان واحد';
    let description = 'استكشف أفضل المطاعم، العيادات، المحلات، والخدمات في السويس. دليلك الشامل الذي يضع المدينة بين يديك مع تفاصيل دقيقة وتقييمات حقيقية.';

    if (categoryName && areaName) {
        title = `أفضل ${categoryName} في ${areaName} - دليل السويس`;
        description = `تبحث عن ${categoryName} في ${areaName}؟ هنا تجد أفضل الترشيحات، أرقام التليفون، ومواقعهم على الخريطة في السويس.`;
    } else if (categoryName) {
        title = `دليلك لأفضل ${categoryName} في السويس ومحيطها`;
        description = `اكتشف قائمة شاملة ومحدثة بـ ${categoryName} في محافظة السويس. كل المعلومات اللي تحتاجها في مكان واحد.`;
    } else if (areaName) {
        title = `كل ما يخص منطقة ${areaName} في السويس - الخدمات والأماكن`;
        description = `تعرف على الخدمات والمطاعم والمحلات المتاحة في ${areaName} بالسويس. دليلك المحلي لمنطقتك.`;
    } else if (query) {
        title = `نتائج البحث عن: ${query} - اكتشف المزيد في السويس`;
        description = `عرض كافة النتائج المتعلقة بـ ${query} في السويس. نوفر لك أدق التفاصيل للوصول لهدفك بسرعة.`;
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
            <div className="w-full max-w-7xl mx-auto px-4 pt-8 space-y-8">
                {category && (
                    <CategoryIntro 
                        categorySlug={category.slug} 
                        categoryName={category.name} 
                    />
                )}
                <PlacesClient
                    initialPlaces={initialPlaces}
                    totalCount={total}
                    categories={categoriesList}
                    areas={allAreas}
                    districts={districts}
                />
            </div>
        </Suspense>
    );
}


