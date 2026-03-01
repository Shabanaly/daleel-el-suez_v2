import { MetadataRoute } from 'next';
import { getPlaces } from '@/lib/actions/places';
import { getAllCategories } from '@/lib/actions/categories';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daleel-el-suez.vercel.app';

    // Fetch all paths in parallel
    const [places, categories] = await Promise.all([
        getPlaces(),
        getAllCategories(),
    ]);

    const placeUrls = places.map((place) => ({
        url: `${baseUrl}/places/${place.slug}`,
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

    return [...staticUrls, ...placeUrls, ...categoryUrls];
}
