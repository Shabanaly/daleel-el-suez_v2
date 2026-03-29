import { getCategoryInfoBySlug } from '@/lib/actions/categories';
import { getPlaces } from '@/lib/actions/places';
import { ChevronLeft, MapPin } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PlaceCard } from '@/app/places/_components/PlaceCard';
import { CategoryPagination } from '../_components/CategoryPagination';

const DynamicIcon = ({ iconName, className }: { iconName: string, className?: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Icon = (LucideIcons as any)[iconName];
    if (!Icon) {
        if (iconName && iconName.length <= 4) return <span className="text-xl md:text-3xl">{iconName}</span>;
        return <LucideIcons.HelpCircle className={className} />;
    }
    return <Icon className={className} />;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const category = await getCategoryInfoBySlug(resolvedParams.slug);

    if (!category) return { title: 'قسم غير موجود' };

    const title = `أفضل ${category.name} في السويس (دليل 2024) - دليل السويس`;
    const description = `تصفح قائمة ${category.name} في محافظة السويس. نوفر لك معلومات التواصل والتقييمات لأكثر من ${category.totalPlaces} مكان في هذا القسم.`;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daleel-al-suez.com';
    const url = `${baseUrl}/categories/${encodeURIComponent(resolvedParams.slug)}`;

    return {
        title,
        description,
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
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
    };
}

export default async function CategoryDetailPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await params;
    const resolvedSearch = await searchParams;
    const page = Number(resolvedSearch.page) || 1;

    const category = await getCategoryInfoBySlug(resolvedParams.slug);

    if (!category) {
        notFound();
    }

    // Fetch places for this category
    const { places, total } = await getPlaces(page, category.id, undefined, 'trending');
    const LIMIT = 24;
    const totalPages = Math.ceil(total / LIMIT);

    // JSON-LD for Search Engines
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `أفضل ${category.name} في السويس`,
        "description": `كل الأماكن في قسم ${category.name} بمدينة السويس`,
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": places.slice(0, 10).map((place, index) => ({
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
        }
    };

    return (
        <main className="min-h-screen pt-28 pb-20 bg-background selection:bg-primary/20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="max-w-7xl mx-auto px-4">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm font-bold text-text-muted mb-6">
                    <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
                    <ChevronLeft className="w-4 h-4" />
                    <Link href="/categories" className="hover:text-primary transition-colors">الأقسام</Link>
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-primary">{category.name}</span>
                </nav>

                {/* Simple Hero Header */}
                <div className="w-full p-6 md:p-10 rounded-3xl bg-surface border border-border-subtle mb-10 shadow-sm flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl md:text-4xl shrink-0">
                        <DynamicIcon iconName={category.icon} className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                    </div>
                    
                    <div className="flex-1 text-center md:text-start">
                        <h1 className="text-3xl md:text-4xl font-black text-text-primary mb-2">
                            {category.name}
                        </h1>
                        <p className="text-text-muted text-base font-bold flex items-center justify-center md:justify-start gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            يوجد <span className="text-primary">{total} مكان</span> متاح في هذا القسم
                        </p>
                    </div>
                </div>

                {/* Full Places Grid */}
                {places.length > 0 ? (
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {places.map((place) => (
                                <PlaceCard 
                                    key={place.id} 
                                    place={place} 
                                />
                            ))}
                        </div>

                        {/* Pagination wrapper for the URL-based pagination */}
                        {totalPages > 1 && (
                            <CategoryPagination currentPage={page} totalPages={totalPages} />
                        )}
                    </div>
                ) : (
                    <div className="py-24 text-center space-y-6 bg-surface rounded-[32px] border border-dashed border-border-subtle">
                        <div className="w-20 h-20 bg-elevated rounded-full flex items-center justify-center text-4xl mx-auto opacity-80">
                            🏝️
                        </div>
                        <h3 className="text-2xl font-black text-text-primary">لا توجد أماكن هنا بعد</h3>
                        <p className="text-text-muted font-bold text-sm">لم يتم إضافة أماكن في هذا القسم حتى الآن.</p>
                        <Link href="/categories" className="inline-block px-8 py-3 rounded-full bg-primary/10 text-primary font-bold hover:bg-primary hover:text-white transition-colors">
                            تصفح أقسام أخرى
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
