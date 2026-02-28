import { Suspense } from 'react';
import { getPlaces } from '@/lib/actions/places';
import { getCategories } from '@/lib/actions/categories';

import { PlacesClient } from './_components/PlacesClient';
import { getAreasAction, getDistricts } from '@/lib/actions/areas';

export default async function PlacesPage() {
    // 🧠 Fetch the initial data on the server
    const [initialPlaces, initialCategories, initialAreas, districts] = await Promise.all([
        getPlaces(),
        getCategories(),
        getAreasAction(),
        getDistricts()
    ]);

    // 🎨 Pass the raw data down to the Client Component
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>}>
            <PlacesClient
                initialPlaces={initialPlaces}
                categories={initialCategories}
                areas={initialAreas}
                districts={districts}
            />
        </Suspense>
    );
}


