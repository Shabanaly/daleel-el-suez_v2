import { getCategoriesWithIds, getAreasWithIds } from '@/lib/actions/places';
import { AddPlaceForm } from './_components/AddPlaceForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'أضف نشاطك | دليل السويس',
    description: 'أضف نشاطك التجاري الآن في دليل السويس لتصل لعملاء أكثر.',
};

export default async function AddPlacePage() {
    const [categories, areas] = await Promise.all([
        getCategoriesWithIds(),
        getAreasWithIds()
    ]);

    return (
        <div className="min-h-screen bg-base pt-24 md:pt-32 pb-20">
            <div className="max-w-2xl mx-auto px-4">
                {/* ── Header ────────────────────────────────────────────────── */}
                <div className="mb-12 text-center">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-primary-500/10 text-primary-500 text-[10px] font-black uppercase tracking-widest mb-4 border border-primary-500/20">
                        كن جزءاً من دليل السويس
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-text-primary mb-4 tracking-tight">أضف نشاطك التجاري</h1>
                    <p className="text-text-muted font-medium max-w-md mx-auto opacity-80">
                        ساعد العملاء في السويس على الوصول إليك بسهولة واحترافية
                    </p>
                </div>

                <AddPlaceForm categories={categories} areas={areas} />
            </div>
        </div>
    );
}
