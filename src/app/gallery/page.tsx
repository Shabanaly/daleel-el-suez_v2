import { getGalleryImages } from '@/lib/actions/gallery';
import GalleryClient from './_components/GalleryClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'عدسة السويس | معرض صور مدينة السويس',
    description: 'اكتشف وشارك أجمل صور مدينة السويس ومعالمها بعيون أهلها وزوارها. معرض صور مجتمعي يوثق جمال وتاريخ السويس.',
    openGraph: {
        title: 'عدسة السويس | معرض صور مدينة السويس',
        description: 'اكتشف وشارك أجمل صور مدينة السويس ومعالمها بعيون أهلها وزوارها.',
        type: 'website',
        images: [
            {
                url: '/images/og-gallery.png', // Fallback OG image
                width: 1200,
                height: 630,
                alt: 'عدسة السويس'
            }
        ]
    },
    twitter: {
        card: 'summary_large_image',
        title: 'عدسة السويس | معرض صور مدينة السويس',
        description: 'اكتشف وشارك أجمل صور مدينة السويس ومعالمها بعيون أهلها وزوارها.',
    },
    alternates: {
        canonical: 'https://daleel-al-suez.com/gallery',
    },
};

export default async function GalleryPage() {
    const images = await getGalleryImages(50);

    // Filter categories to only those relevant for places/scenery if needed, 
    // but for now we'll just use the main ones.
    const galleryCategories = ['الكل', 'معالم', 'طبيعة', 'تراث', 'سياحة', 'حياة شوارع'];

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "ImageGallery",
                        "name": "عدسة السويس | معرض صور مدينة السويس",
                        "description": "معرض صور مجتمعي يوثق جمال وتاريخ مدينة السويس بعيون أهلها.",
                        "url": "https://daleel-al-suez.com/gallery",
                        "image": images.map(img => ({
                            "@type": "ImageObject",
                            "url": img.url,
                            "name": img.title,
                            "caption": img.title,
                            "contentUrl": img.url,
                            "description": `صورة ${img.title} في السويس - تصنيف ${img.category || 'عام'}`,
                            "author": {
                                "@type": "Person",
                                "name": img.profiles?.full_name || img.profiles?.username || "أحد سكان السويس"
                            },
                            "datePublished": img.created_at
                        }))
                    })
                }}
            />
            <main className="min-h-screen bg-surface pt-20 pb-12">
                <GalleryClient 
                    initialImages={images} 
                    categories={galleryCategories} 
                />
            </main>
        </>
    );
}
