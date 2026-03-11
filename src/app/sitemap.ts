import { MetadataRoute } from 'next';
import { getAllPlacesForSitemap } from '@/lib/actions/places';
import { getAllCategories } from '@/lib/actions/categories';
import { getAllPosts } from '@/lib/actions/posts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daleel-al-suez.com';

    // Fetch all paths in parallel
    const [places, categories, posts] = await Promise.all([
        getAllPlacesForSitemap(),
        getAllCategories(),
        getAllPosts(),
    ]);

    const postUrls = posts.map((post) => ({
        url: `${baseUrl}/community/posts/${post.id}`,
        lastModified: new Date(post.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    const placeUrls = places.map((place) => ({
        url: `${baseUrl}/places/${encodeURIComponent(place.slug)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const categoryUrls = categories.map((category) => ({
        url: `${baseUrl}/categories/${category.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
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
    ];

    return [...staticUrls, ...placeUrls, ...categoryUrls, ...postUrls];
}
