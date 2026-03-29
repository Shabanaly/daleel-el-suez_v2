import { getCategoryInfoBySlug } from '@/lib/actions/categories';
import { getTopPlacesByCategory } from '@/lib/actions/places';
import BestOfHero from '../_components/BestOfHero';
import TopPlaceCard from '../_components/TopPlaceCard';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { addArabicArticle } from '@/lib/utils';

interface Props {
    params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category: slug } = await params;
    const category = await getCategoryInfoBySlug(slug);

    if (!category) return { title: 'قائمة غير موجودة' };

    const title = `أفضل ${addArabicArticle(category.name)} في السويس لعام 2024 | القائمة الكاملة`;
    const description = `اكتشف أفضل ${addArabicArticle(category.name)} في السويس بناءً على تقييمات حقيقية. قائمة محدثة تشمل رقم التواصل، الموقع، والخدمات المتاحة.`;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daleel-al-suez.com';
    const url = `${baseUrl}/best/${slug}`;

    return {
        title,
        description,
        keywords: [category.name, `افضل ${category.name}`, `احسن ${category.name}`, "السويس", "دليل السويس"],
        alternates: {
            canonical: url,
        },
        robots: {
            index: true,
            follow: true,
        },
        openGraph: {
            title,
            description,
            url,
            type: 'website',
        },
    };
}

export default async function BestOfCategoryPage({ params }: Props) {
    const { category: slug } = await params;
    const category = await getCategoryInfoBySlug(slug);

    if (!category) {
        notFound();
    }

    const places = await getTopPlacesByCategory(category.id, 10);

    interface BestStat {
        label: string;
        value: string | number;
        iconName: "star" | "trending" | "message" | "award" | "users";
    }

    const stats: BestStat[] = [
        { label: "مكان متاح", value: category.totalPlaces, iconName: "star" },
        { label: "إجمالي التقييمات", value: category.totalReviews, iconName: "message" },
        { label: "مشاهدة شهرياً", value: category.totalViews, iconName: "trending" },
    ];

    // JSON-LD for rich results
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `أفضل ${category.name} في السويس لعام 2024`,
        "description": `قائمة حصرية بأفضل ${category.name} في السويس بناءً على التقييمات`,
        "itemListElement": places.map((place, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "LocalBusiness",
                "name": place.name,
                "url": `https://daleel-al-suez.com/places/${place.slug}`,
                "image": place.imageUrl,
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": place.rating,
                    "reviewCount": place.reviews || 1
                }
            }
        }))
    };

    return (
        <main className="min-h-screen bg-background pb-32">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            
            <BestOfHero 
                title={`أفضل ${addArabicArticle(category.name)} في السويس ${new Date().getFullYear()}`}
                description={`لقد قمنا باختيار وتصنيف هذه القائمة بناءً على دقة التقييمات، جودة الخدمة، واستمرارية الأداء. اكتشف الأفضل في مدينتك.`}
                stats={stats}
            />

            <div className="max-w-7xl mx-auto px-4 -mt-12">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-subtle/50">
                    <h2 className="text-xl md:text-2xl font-black text-text-primary">
                        القائمة الذهبية: {addArabicArticle(category.name)}
                    </h2>
                    <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-text-muted">
                        <span>تم التحديث:</span>
                        <span className="text-primary">{new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    {places.map((place, index) => (
                        <TopPlaceCard 
                            key={place.id} 
                            place={place} 
                            rank={index + 1} 
                        />
                    ))}
                </div>

                {places.length === 0 && (
                    <div className="py-24 text-center space-y-4 bg-surface rounded-[40px] border border-dashed border-border-subtle">
                        <div className="text-6xl">🏆</div>
                        <h3 className="text-2xl font-black text-text-primary">القائمة قيد التحضير</h3>
                        <p className="text-text-muted font-bold">نقوم حالياً بجمع البيانات والتقييمات لهذا القسم.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
