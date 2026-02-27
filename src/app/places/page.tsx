import { getPlaces, getCategories, getAreas } from '@/lib/actions/places';
import { PlacesClient } from './_components/PlacesClient';

export default async function PlacesPage() {
    // 🧠 Fetch the initial data on the server
    const [initialPlaces, initialCategories, initialAreas] = await Promise.all([
        getPlaces(),
        getCategories(),
        getAreas()
    ]);

    // 🎨 Pass the raw data down to the Client Component
    return (
        <PlacesClient
            initialPlaces={initialPlaces}
            categories={initialCategories}
            areas={initialAreas}
        />
    );
}

