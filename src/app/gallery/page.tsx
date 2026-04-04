import { getGalleryImages } from '@/features/gallery/actions/gallery.server';
import GalleryClient from './_components/GalleryClient';
import type { Metadata } from 'next';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ category?: string }> }): Promise<Metadata> {
    const params = await searchParams;
    const category = params.category;

    const title = category && category !== 'الكل' 
        ? `صور ${category} في السويس | عدسة السويس` 
        : 'عدسة السويس | معرض صور مدينة السويس';
    
    const description = category && category !== 'الكل'
        ? `استكشف أجمل صور ${category} في مدينة السويس. شارك بصورتك ووثق جمال معالم مدينتك.`
        : 'اكتشف وشارك أجمل صور مدينة السويس ومعالمها بعيون أهلها وزوارها. معرض صور مجتمعي يوثق جمال وتاريخ السويس.';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        }
    };
}

export default async function GalleryPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
    const params = await searchParams;
    const selectedCategory = params.category || 'الكل';
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
                    initialCategory={selectedCategory}
                />
            </main>
        </>
    );
}
