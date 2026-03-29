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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daleel-al-suez.com';
    const url = `${baseUrl}/places/${encodeURIComponent(place.slug)}`;

    return {
        title,
        description,
        keywords: [place.name, place.category, place.area, "السويس", "دليل السويس", "اماكن السويس"],
        alternates: {
            canonical: url,
        },
        robots: {
            index: true,
            follow: true,
        },
        openGraph: {
            title,
            description,
            url,
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
        getRelatedPlaces(place.categoryId, place.id, 6, place.category),
        getReviews(place.id, 1, 5),
        user ? isItemFavorite(place.id, 'place') : false
    ]);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: place.name,
        image: place.images?.length ? place.images : (place.imageUrl ? [place.imageUrl] : []),
        '@id': `https://daleel-al-suez.com/places/${encodeURIComponent(place.slug)}`,
        url: `https://daleel-al-suez.com/places/${encodeURIComponent(place.slug)}`,
        address: {
            '@type': 'PostalAddress',
            streetAddress: place.address || place.area,
            addressLocality: 'Suez',
            addressRegion: 'Suez Governorate',
            addressCountry: 'EG'
        },
        ...(place.rating && place.reviews ? {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: place.rating,
                reviewCount: place.reviews
            }
        } : {})
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
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
