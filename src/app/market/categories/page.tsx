import { getMarketCategories } from '@/features/market/actions/market.server';
import { Sparkles } from 'lucide-react';
import { MarketCategoryGrid } from '@/features/market/components/MarketCategoryGrid';
import { MarketCategory } from '@/features/market/types';
import { AppBar } from '@/components/ui/AppBar';

export const metadata = {
    title: 'أقسام سوق السويس | Suez Market Categories',
    description: 'استعرض جميع أقسام وتصنيفات المنتجات المتاحة في سوق السويس',
};

export default async function MarketCategoriesPage() {
    const allCategories = await getMarketCategories();
    const categories = allCategories.filter((cat: MarketCategory) => (cat.adCount || 0) > 0);

    return (
        <div className="min-h-screen pt-16 md:pt-24 pb-20 bg-background selection:bg-primary/20 w-full overflow-hidden relative" dir="rtl">
            <AppBar title="أقسام السوق" backHref="/market" />
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-linear-to-b from-primary/5 via-transparent to-primary/5 blur-[120px] rounded-full opacity-30" />
            </div>

            <div className="w-full max-w-7xl mx-auto px-4 md:px-10 relative z-10">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-12 md:mb-20 space-y-4 md:space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span>سوق السويس الرسمي</span>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-7xl font-black text-text-primary tracking-tight leading-tight">
                            تصفح حسب <span className="text-primary">القسم</span>
                        </h1>
                        <p className="text-text-muted text-sm md:text-2xl font-bold opacity-70 max-w-3xl mx-auto leading-relaxed">
                            استكشف آلاف الإعلانات في واجهة واحدة منظمة حسب الاهتمام والاحتياج.
                        </p>
                    </div>
                </div>

                {/* Grid */}
                <MarketCategoryGrid categories={categories as MarketCategory[]} />
            </div>
        </div>
    );
}
