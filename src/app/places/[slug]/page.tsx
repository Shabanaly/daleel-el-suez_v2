import { notFound } from 'next/navigation';
import { getPlaceBySlug, getRelatedPlaces } from '@/lib/actions/places';
import { getReviews } from '@/lib/actions/reviews';
import { PlaceDetailsClient } from '../_components/PlaceDetailsClient';
import { ViewTracker } from '@/components/places/ViewTracker';

export default async function PlaceDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const place = await getPlaceBySlug(slug);

    if (!place) {
        notFound();
    }

    const [relatedPlaces, initialReviewsData] = await Promise.all([
        getRelatedPlaces(place.category, place.id),
        getReviews(place.id, 1, 5)
    ]);

    return (
        <>
            <ViewTracker placeId={place.id} />
            <PlaceDetailsClient
                place={place}
                relatedPlaces={relatedPlaces}
                initialReviews={initialReviewsData.reviews}
            />
        </>
    );
}

// Generate static params if we want to pre-render (optional, good for performance)
export async function generateStaticParams() {
    const { getPlaces } = await import('@/lib/actions/places');
    const places = await getPlaces();
    return places.map((place) => ({
        slug: place.slug,
    }));
}
