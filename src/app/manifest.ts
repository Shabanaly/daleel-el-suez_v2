import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'دليل السويس | Suez Guide',
        short_name: 'دليل السويس',
        description: 'دليلك الشامل للأماكن والخدمات في محافظة السويس',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0066FF',
        icons: [
            {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
        ],
        orientation: 'portrait',
        scope: '/',
        categories: ['lifestyle', 'travel', 'local'],
        lang: 'ar',
        dir: 'rtl',
    };
}
