import { notFound } from 'next/navigation';
import { getPlaceBySlug } from '@/features/places/actions/places.server';
import { getCategoriesWithIds } from '@/features/taxonomy/actions/categories';
import { getAreasWithIds } from '@/features/taxonomy/actions/areas';
import { EditPlaceForm } from './_components/EditPlaceForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'تعديل النشاط | دليل السويس',
};

export default async function EditPlacePage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    const [place, categories, areas] = await Promise.all([
        getPlaceBySlug(slug),
        getCategoriesWithIds(),
        getAreasWithIds()
    ]);

    if (!place) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background pt-24 md:pt-32 pb-20">
            <div className="max-w-2xl mx-auto px-4">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-black text-text-primary tracking-tight">تعديل بيانات المكان</h1>
                    <p className="mt-2 text-text-muted font-medium">تحديث معلومات &quot;{place.name}&quot;</p>
                </div>

                <EditPlaceForm
                    place={place}
                    categories={categories}
                    areas={areas}
                />
            </div>
        </div>
    );
}
