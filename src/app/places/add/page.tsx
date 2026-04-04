import { getCategoriesWithIds } from '@/features/taxonomy/actions/categories';
import { AddPlaceForm } from './_components/AddPlaceForm';
import { Metadata } from 'next';
import { getAreasWithIds } from '@/features/taxonomy/actions/areas';
import { getDistricts } from '@/features/taxonomy/actions/districts';

export const metadata: Metadata = {
    title: 'أضف نشاطك | دليل السويس',
    description: 'أضف نشاطك التجاري الآن في دليل السويس لتصل لعملاء أكثر.',
};

export default async function AddPlacePage() {
    const [categories, areas, districts] = await Promise.all([
        getCategoriesWithIds(),
        getAreasWithIds(),
        getDistricts()
    ]);

    return (
        <main className="min-h-screen bg-background pb-32">
            <div className=" pt-32 pb-20 px-4 mb-8 relative overflow-hidden">
                <div className="absolute inset-0  opacity-20 mix-blend-overlay"></div>
                <div className="container mx-auto max-w-2xl relative z-10 text-center">
                    <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                        إضافة <span className="text-primary">مكان</span> جديد 
                    </h1>
                    <p className="text-text-muted text-lg font-bold max-w-xl mx-auto">
                        سجل مكانك التجاري في دليل السويس للوصول لآلاف العملاء يومياً
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-2xl -mt-16 relative z-20">
                <AddPlaceForm categories={categories} areas={areas} districts={districts} />
            </div>
        </main>
    );
}
