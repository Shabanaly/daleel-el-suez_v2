import { notFound } from 'next/navigation';
import { getPlaceBySlug, getRelatedPlaces } from '@/features/places/actions/places.server';
import { getReviews } from '@/features/places/actions/reviews.server';
import { PlaceDetailsClient } from '@/features/places/components/PlaceDetailsClient';
import { ViewTracker } from '@/features/places/components/ViewTracker';
import { isItemFavorite } from '@/features/favorites/actions/favorites.server';
import { createClient } from '@/lib/supabase/server';
import BreadcrumbsJsonLd from '@/components/seo/BreadcrumbsJsonLd';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const place = await getPlaceBySlug(resolvedParams.slug);

    if (!place) return { title: 'مكان غير موجود' };

    const title = `${place.name} | ${place.category} في ${place.area}`;
    const description = `تعرف على ${place.name} في ${place.area}، السويس. ${place.description?.slice(0, 150) || ''}...`;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daleel-al-suez.com';
    const url = `${baseUrl}/places/${encodeURIComponent(place.slug)}`;

    return {
        title,
        description,
        keywords: [place.name, place.category || '', place.area || '', "السويس", "دليل السويس", "اماكن السويس"],
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
            images: place.imageUrl ? [place.imageUrl] : (place.images?.[0] ? [place.images[0]] : []),
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: place.imageUrl ? [place.imageUrl] : (place.images?.[0] ? [place.images[0]] : []),
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
        getRelatedPlaces(place.categoryId, place.id, place.area, 6, place.category),
        getReviews(place.id, 1, 5),
        user ? isItemFavorite(place.id, 'place') : false
    ]);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daleel-al-suez.com';

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: place.name,
        image: place.images?.length ? place.images : (place.imageUrl ? [place.imageUrl] : []),
        '@id': `${baseUrl}/places/${encodeURIComponent(place.slug)}`,
        url: `${baseUrl}/places/${encodeURIComponent(place.slug)}`,
        telephone: place.phoneNumber?.primary || undefined,
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

    const breadcrumbs = [
        { name: 'الرئيسية', item: '/' },
        { name: 'أماكن', item: '/places' },
        { name: place.category || 'تصنيف', item: `/places?category=${encodeURIComponent(place.category || '')}` },
        { name: place.name, item: `/places/${place.slug}` }
    ];

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <BreadcrumbsJsonLd items={breadcrumbs} />
            <ViewTracker placeId={place.id} slug={place.slug} />
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
    try {
        const { getAllPlacesForSitemap } = await import('@/features/places/actions/places.server');
        const places = await getAllPlacesForSitemap();
        
        // 🚀 Optimization: Only pre-render the top 50 recently added/popular places
        // The rest will be rendered on-demand (ISR) when first visited.
        // This significantly reduces Vercel CPU usage during Build.
        return places.slice(0, 50).map((place: any) => ({
            slug: place.slug,
        }));
    } catch (error) {
        console.error('Error in generateStaticParams:', error);
        return [];
    }
}
