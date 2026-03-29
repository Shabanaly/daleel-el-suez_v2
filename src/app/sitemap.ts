import { MetadataRoute } from 'next';
import { getAllPlacesForSitemap } from '@/lib/actions/places';
import { getAllCategories } from '@/lib/actions/categories';
import { getAllPosts } from '@/lib/actions/posts';
import { getMarketCategories, getMarketAdsForSitemap } from '@/lib/actions/market';

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
        url: `${baseUrl}/community/posts/${encodeURIComponent(post.id)}`,
        lastModified: new Date(post.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    const placeUrls = places.map((place) => ({
        url: `${baseUrl}/places/${encodeURIComponent(place.slug)}`,
        lastModified: new Date(place.created_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const categoryUrls = categories.map((category) => ({
        url: `${baseUrl}/categories/${encodeURIComponent(category.slug)}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }));

    // Market URLs
    const marketCategoryUrls = marketCategories.map((category) => ({
        url: `${baseUrl}/market/category/${encodeURIComponent(category.slug)}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }));

    const marketAdUrls = marketAds.map((ad) => ({
        url: `${baseUrl}/market/${encodeURIComponent(ad.slug)}`,
        lastModified: new Date(ad.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));
    
    // Best of Suez URLs
    const bestOfUrls = categories.map((category) => ({
        url: `${baseUrl}/best/${encodeURIComponent(category.slug)}`,
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
            url: `${baseUrl}/community`,
            lastModified: new Date(),
            changeFrequency: 'always' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/categories`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/places`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/market`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.4,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 0.3,
        },
        {
            url: `${baseUrl}/copyright`,
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 0.3,
        },
        {
            url: `${baseUrl}/gallery`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/best`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        },
    ];

    return [
        ...staticUrls, 
        ...placeUrls, 
        ...categoryUrls, 
        ...postUrls,
        ...marketCategoryUrls,
        ...marketAdUrls,
        ...bestOfUrls
    ];
}
