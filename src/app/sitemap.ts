import { MetadataRoute } from 'next';
import { getAllPlacesForSitemap } from '@/features/places/actions/places.server';
import { getAllCategories } from '@/features/taxonomy/actions/categories';
import { getAllPosts } from '@/features/community/actions/posts.server';
import { getMarketCategories, getMarketAdsForSitemap } from '@/features/market/actions/market.server';
import { ROUTES, ROUTE_HELPERS } from '@/constants';


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daleel-al-suez.com';

    // Fetch all paths in parallel
    const [places, categories, posts, marketCategories, marketAds] = await Promise.all([
        getAllPlacesForSitemap(),
        getAllCategories(),
        getAllPosts(),
        getMarketCategories(),
        getMarketAdsForSitemap(),
    ]);

    const postUrls = posts.map((post) => ({
        url: `${baseUrl}${ROUTE_HELPERS.COMMUNITY_POST(post.id)}`,
        lastModified: new Date(post.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    const placeUrls = places.map((place: any) => ({
        url: `${baseUrl}${ROUTE_HELPERS.PLACE(place.slug)}`,
        lastModified: new Date(place.created_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        images: Array.isArray(place.images) && place.images.length > 0 ? [place.images[0]] : [],
    }));

    const categoryUrls = categories.map((category) => ({
        url: `${baseUrl}${ROUTE_HELPERS.PLACES_CATEGORY(category.name)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // Market URLs
    const marketCategoryUrls = marketCategories.map((category: any) => ({
        url: `${baseUrl}${ROUTE_HELPERS.MARKET_CATEGORY(category.slug)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const marketAdUrls = marketAds.map((ad: any) => ({
        url: `${baseUrl}${ROUTE_HELPERS.MARKET_AD(ad.slug)}`,
        lastModified: new Date(ad.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
        images: Array.isArray(ad.images) && ad.images.length > 0 ? [ad.images[0]] : [],
    }));
    
    // Best of Suez URLs
    const bestOfUrls = categories.map((category) => ({
        url: `${baseUrl}${ROUTE_HELPERS.BEST_CATEGORY(category.slug)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const staticUrls = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}${ROUTES.COMMUNITY}`,
            lastModified: new Date(),
            changeFrequency: 'always' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}${ROUTES.CATEGORIES}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}${ROUTES.PLACES}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}${ROUTES.MARKET}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}${ROUTES.MARKET_CATEGORIES}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}${ROUTES.ABOUT}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.4,
        },
        {
            url: `${baseUrl}${ROUTES.PRIVACY}`,
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 0.3,
        },
        {
            url: `${baseUrl}${ROUTES.TERMS}`,
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 0.3,
        },
        {
            url: `${baseUrl}${ROUTES.COPYRIGHT}`,
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 0.3,
        },
        {
            url: `${baseUrl}${ROUTES.GALLERY}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}${ROUTES.BEST}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        },
    ];

    return [
        ...staticUrls, 
        ...placeUrls, 
        ...postUrls,
        ...categoryUrls,
        ...marketCategoryUrls,
        ...marketAdUrls,
        ...bestOfUrls
    ];
}
