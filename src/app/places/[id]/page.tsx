import { notFound } from 'next/navigation';
import { getPlaceById, getPlaces } from '@/lib/actions/places';
import { PlaceDetailsClient } from '../_components/PlaceDetailsClient';

export default async function PlaceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const placeId = resolvedParams.id;
    const place = await getPlaceById(placeId);

    if (!place) {
        notFound();
    }

    const allPlaces = await getPlaces();
    const relatedPlaces = allPlaces
        .filter(p => p.category === place.category && p.id !== place.id)
        .slice(0, 3);

    return (
        <PlaceDetailsClient
            place={place}
            relatedPlaces={relatedPlaces}
        />
    );
}

// Generate static params if we want to pre-render (optional, good for performance)
// export async function generateStaticParams() {
//     const places = await getPlaces();
//     return places.map((place) => ({
//         id: place.id.toString(),
//     }));
// }
