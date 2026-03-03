import { notFound } from 'next/navigation';
import { getPlaceBySlug, getRelatedPlaces } from '@/lib/actions/places';
import { getReviews } from '@/lib/actions/reviews';
import { PlaceDetailsClient } from '../_components/PlaceDetailsClient';
import { ViewTracker } from '@/components/places/ViewTracker';
import { isItemFavorite } from '@/lib/actions/favorites';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const place = await getPlaceBySlug(resolvedParams.slug);

    if (!place) return { title: 'مكان غير موجود' };

    const title = `${place.name} | ${place.category} في ${place.area}`;
    const description = `تعرف على ${place.name} في ${place.area}، السويس. ${place.description?.slice(0, 150)}...`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: place.imageUrl ? [place.imageUrl] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: place.imageUrl ? [place.imageUrl] : [],
        },
    };
}


export default async function PlaceDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const place = await getPlaceBySlug(slug);

    if (!place) {
        notFound();
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const [relatedPlaces, initialReviewsData, favoriteStatus] = await Promise.all([
        getRelatedPlaces(place.category, place.id),
        getReviews(place.id, 1, 5),
        user ? isItemFavorite(place.id, 'place') : false
    ]);

    return (
        <>
            <ViewTracker placeId={place.id} />
            <PlaceDetailsClient
                place={place}
                relatedPlaces={relatedPlaces}
                initialReviews={initialReviewsData.reviews}
                isFavorite={favoriteStatus}
            />
        </>
    );
}

// Generate static params if we want to pre-render (optional, good for performance)
export async function generateStaticParams() {
    const { getAllPlacesForSitemap } = await import('@/lib/actions/places');
    const places = await getAllPlacesForSitemap();
    return places.map((place) => ({
        slug: place.slug,
    }));
}
