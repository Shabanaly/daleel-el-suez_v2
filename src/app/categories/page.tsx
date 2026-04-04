import { getAllCategories } from '@/features/taxonomy/actions/categories';
import { Sparkles } from 'lucide-react';
import { CategoryGrid } from './_components/CategoryGrid';

// Categories v6: Full Server Component
// البيانات تُجلب من السيرفر مباشرة — لا skeleton، لا useEffect

export const metadata = {
    title: 'أقسام دليل السويس | Suez Directory Categories',
    description: 'استعرض جميع أقسام وتصنيفات الخدمات المتاحة في دليل السويس',
};

export default async function CategoriesPage() {
    const categories = await getAllCategories();

    return (
        <div className="min-h-screen pt-16 md:pt-24 pb-20 bg-background selection:bg-primary/20 w-full overflow-hidden relative">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-linear-to-b from-primary/5 via-transparent to-primary/5 blur-[120px] rounded-full opacity-30" />
            </div>

            <div className="w-full max-w-[1920px] mx-auto px-4 md:px-10 lg:px-16 relative z-10">
                {/* Header — static, no animation needed on server */}
                <div className="flex flex-col items-center text-center mb-12 md:mb-20 space-y-4 md:space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span>تصفح شامل</span>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-8xl font-black text-text-primary tracking-tight leading-tight">
                            دليل <span className="text-primary">أقسام</span> السويس
                        </h1>
                        <p className="text-text-muted text-sm md:text-2xl font-bold opacity-70 max-w-3xl mx-auto leading-relaxed">
                            واجهة موحدة ومنسقة لاستكشاف جميع الخدمات في واجهة واحدة متكاملة.
                        </p>
                    </div>
                </div>

                {/* Grid — Client Component for animations only */}
                <CategoryGrid categories={categories} />
            </div>
        </div>
    );
}
