import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daleel-al-suez.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/profile/',
                    '/login',
                    '/signup',
                    '/settings',
                    '/manage/',
                    '/favorites',
                    '/places/add',
                    '/market/create',
                    '/market/my-ads',
                    '/*/edit',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}