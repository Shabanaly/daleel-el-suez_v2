import { getAllCategories } from "@/lib/actions/categories";
import { getTopPlacesByCategory, getOverallStats } from "@/lib/actions/places";
import BestOfHero from "./_components/BestOfHero";
import TopPlaceCard from "./_components/TopPlaceCard";
import Link from "next/link";
import { Metadata } from "next";
import { addArabicArticle } from "@/lib/utils";

const currentYear = new Date().getFullYear();

export const metadata: Metadata = {
    title: `أفضل الأماكن في السويس | القائمة الذهبية لعام ${currentYear}`,
    description: "اكتشف القائمة الذهبية لأفضل المطاعم، العيادات، والخدمات في السويس بناءً على تقييمات المستخدمين الحقيقية.",
    keywords: ["افضل اماكن السويس", "احسن خدمات السويس", "ترشيحات السويس", "دليل السويس"],
    alternates: {
        canonical: 'https://daleel-al-suez.com/best',
    },
};

export default async function BestOfIndex() {
    const [categories, statsData] = await Promise.all([
        getAllCategories(),
        getOverallStats()
    ]);
    
    // Fetch top place for top 12 categories (expanded)
    const topPerCategory = await Promise.all(
        categories
            .filter(c => c.rawCount > 0)
            .slice(0, 12)
            .map(async (cat) => {
                const places = await getTopPlacesByCategory(cat.id, 1);
                return { category: cat, topPlace: places[0] };
            })
    );

    interface BestStat {
        label: string;
        value: string | number;
        iconName: "star" | "trending" | "message" | "award" | "users";
    }

    const stats: BestStat[] = [
        { label: "مكان موثق", value: `${statsData.verifiedCount}+`, iconName: "award" },
        { label: "تقييم حقيقي", value: `${statsData.reviewsCount}+`, iconName: "star" },
        { label: "مشاهدة شهرياً", value: statsData.totalViews, iconName: "trending" },
    ];

    return (
        <main className="min-h-screen bg-background pb-32">
            <BestOfHero 
                title={`القائمة الذهبية لأفضل أماكن السويس ${currentYear}`}
                description="نحن نقوم بتحليل آلاف التقييمات والمراجعات لنقدم لك الأفضل دائماً. جودة، ثقة، ومصداقية بين يديك."
                stats={stats}
            />

            <div className="max-w-7xl mx-auto px-4 -mt-12">
                <div className="flex flex-col gap-16">
                    {topPerCategory.map((item) => item.topPlace && (
                        <div key={item.category.id} className="group/section">
                            <div className="flex items-end justify-between mb-6 pb-3 border-b border-border-subtle/50 group-hover/section:border-primary/30 transition-colors">
                                <div className="space-y-1">
                                    <h2 className="text-xl md:text-2xl font-black text-text-primary">
                                        أفضل {addArabicArticle(item.category.name)}
                                    </h2>
                                    <p className="text-xs font-bold text-text-muted">
                                        الأماكن الحاصلة على أعلى تقييم في السويس
                                    </p>
                                </div>
                                <Link 
                                    href={`/best/${item.category.slug}`}
                                    className="px-4 py-2 rounded-xl bg-surface border border-border-subtle text-xs font-black text-primary hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                                >
                                    عرض الكل
                                </Link>
                            </div>
                            
                            <TopPlaceCard place={item.topPlace} rank={1} />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
