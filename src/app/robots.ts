import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daleel-al-suez.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api',
                    '/admin',
                    '/profile',
                    '/login',
                    '/signup',
                    '/dashboard',
                    '/settings',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}