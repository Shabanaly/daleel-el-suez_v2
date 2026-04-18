import { MetadataRoute } from 'next';
import { getAllPlacesForSitemap } from '@/features/places/actions/places.server';
import { getAllCategories } from '@/features/taxonomy/actions/categories';
import { getAllPosts } from '@/features/community/actions/posts.server';
import { getMarketCategories, getMarketAdsForSitemap } from '@/features/market/actions/market.server';
import { getAllBlogPostsForSitemap } from '@/features/blog/actions/blog';
import { ROUTES, ROUTE_HELPERS } from '@/constants';

// ⚡ Optimization: Cache sitemap for 24 hours
export const revalidate = 86400;


// ⚡ Utility: Escape XML special characters
const escapeXml = (str: string) => 
    str.replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&apos;');

interface SitemapPlace {
    slug: string;
    created_at?: string;
    images?: string[];
}

interface SitemapMarketAd {
    slug: string;
    created_at: string;
    images?: string[];
}

interface SitemapCategory {
    name: string;
    slug: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daleel-al-suez.com';

    // Fetch all paths in parallel
    const [places, categories, posts, marketCategories, marketAds, blogPosts] = await Promise.all([
        getAllPlacesForSitemap(),
        getAllCategories(),
        getAllPosts(),
        getMarketCategories(),
        getMarketAdsForSitemap(),
        getAllBlogPostsForSitemap(),
    ]);

    const postUrls = posts.map((post) => ({
        url: escapeXml(`${baseUrl}${ROUTE_HELPERS.COMMUNITY_POST(post.id)}`),
        lastModified: new Date(post.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    const placeUrls = places.map((place: SitemapPlace) => ({
        url: escapeXml(`${baseUrl}${ROUTE_HELPERS.PLACE(place.slug)}`),
        lastModified: new Date(place.created_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        images: Array.isArray(place.images) && place.images.length > 0 
            ? [escapeXml(place.images[0])] 
            : [],
    }));

    const categoryUrls = categories.map((category) => ({
        url: escapeXml(`${baseUrl}${ROUTE_HELPERS.PLACES_CATEGORY(category.name)}`),
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // Market URLs
    const marketCategoryUrls = marketCategories.map((category: SitemapCategory) => ({
        url: escapeXml(`${baseUrl}${ROUTE_HELPERS.MARKET_CATEGORY(category.slug)}`),
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const marketAdUrls = marketAds.map((ad: SitemapMarketAd) => ({
        url: escapeXml(`${baseUrl}${ROUTE_HELPERS.MARKET_AD(ad.slug)}`),
        lastModified: new Date(ad.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
        images: Array.isArray(ad.images) && ad.images.length > 0 
            ? [escapeXml(ad.images[0])] 
            : [],
    }));
    
    // Best of Suez URLs
    const bestOfUrls = categories.map((category) => ({
        url: escapeXml(`${baseUrl}${ROUTE_HELPERS.BEST_CATEGORY(category.slug)}`),
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const blogUrls = blogPosts.map((post) => ({
        url: escapeXml(`${baseUrl}${ROUTE_HELPERS.BLOG_POST(post.slug)}`),
        lastModified: new Date(post.updated_at || post.published_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
        images: post.image_url ? [escapeXml(post.image_url)] : [],
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
            url: `${baseUrl}${ROUTES.BLOG}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
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
            url: `${baseUrl}${ROUTES.BEST}`,
            lastModified: new Date(),
            changeFrequency: 'always' as const,
            priority: 1.0,
        },
    ];

    // Wrap static URLs too just in case baseUrl or routes have special chars (unlikely but safe)
    const escapedStaticUrls = staticUrls.map(s => ({ ...s, url: escapeXml(s.url) }));

    return [
        ...escapedStaticUrls, 
        ...placeUrls, 
        ...postUrls,
        ...categoryUrls,
        ...marketCategoryUrls,
        ...marketAdUrls,
        ...bestOfUrls,
        ...blogUrls
    ];
}
