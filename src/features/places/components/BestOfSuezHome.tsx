import { Award, ChevronLeft } from "lucide-react";
import CustomLink from "@/components/customLink/customLink";
import { ROUTES } from '@/constants';

import { getHomeUnifiedStats } from "@/features/stats/actions/stats.server";

export default async function BestOfSuezHome() {
    const stats = await getHomeUnifiedStats();
    return (
        <section className="w-full max-w-7xl mx-auto px-4 pt-0 pb-8 md:pt-0 md:pb-16">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-surface border border-primary/10 shadow-3xl group">
                {/* Decorative background gradients - adjusted for theme harmony */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-amber-500/20 transition-colors duration-700" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="relative p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-12" dir="rtl">
                    <div className="flex-1 space-y-6 text-right">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 text-[10px] font-black uppercase tracking-widest">
                            <Award className="w-3.5 h-3.5" />
                            القائمة الذهبية لعام {new Date().getFullYear()}
                        </div>

                        <h2 className="text-3xl md:text-5xl font-black text-text-primary leading-tight">
                            اكتشف <span className="text-amber-600 dark:text-amber-500">أفضل الأماكن</span> في مدينة السويس
                        </h2>

                        <p className="text-text-muted font-bold text-base md:text-lg max-w-xl opacity-90">
                            قائمة منسقة ومحدثة تضم أفضل المطاعم، العيادات، والمحلات الحاصلة على أعلى تقييمات حقيقية من أهل السويس.
                        </p>

                        <div className="flex items-center gap-8">
                            <div className="space-y-1">
                                <div className="text-3xl font-black text-text-primary">{stats.verifiedCount}+</div>
                                <div className="text-[10px] font-black text-text-muted/60 uppercase tracking-widest text-right">مكان موثق</div>
                            </div>
                            <div className="w-px h-12 bg-border-subtle/50" />
                            <div className="space-y-1">
                                <div className="text-3xl font-black text-text-primary">{stats.reviewsCount}+</div>
                                <div className="text-[10px] font-black text-text-muted/60 uppercase tracking-widest text-right">تقييم حقيقي</div>
                            </div>
                        </div>
                    </div>

                    <div className="shrink-0">
                        <CustomLink
                            href={ROUTES.BEST}
                            className="group/btn relative flex items-center gap-3 px-10 py-5 bg-text-primary text-surface font-black text-lg rounded-2xl hover:bg-amber-600 dark:hover:bg-amber-500 hover:text-white transition-all shadow-2xl hover:scale-105 active:scale-95 overflow-hidden"
                        >
                            تصفح القائمة
                            <ChevronLeft className="w-6 h-6 group-hover/btn:-translate-x-1 transition-transform" />

                            {/* Reflection effect */}
                            <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                        </CustomLink>
                    </div>
                </div>

                {/* Bottom decorative bar */}
                <div className="absolute bottom-0 inset-x-0 h-1.5 bg-linear-to-r from-transparent via-amber-500/30 to-transparent opacity-40" />
            </div>
        </section>
    );
}
