"use client";
import Link from "next/link";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import DynamicIcon from "@/components/common/DynamicIcon";
import { MarketCategory } from "@/lib/types/market";

interface MarketCategoriesProps {
    categories: MarketCategory[];
}

export default function MarketCategories({ categories }: MarketCategoriesProps) {
    const activeCategories = categories.filter(c => (c.adCount || 0) > 0);
    if (activeCategories.length === 0) return null;

    return (
        <section className="mb-10 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-text-primary min-w-fit">التصنيفات</h2>
                <Link 
                    href="/market/category"
                    className="bg-primary/10 hover:bg-primary/10 text-primary px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 flex items-center gap-2"
                >
                    عرض الكل
                    <ChevronLeft className="w-4 h-4" />
                </Link>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 mask-fade-edges">
                {activeCategories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/market/category/${encodeURIComponent(cat.slug)}`}
                        className="flex flex-col items-center gap-2 min-w-[70px] shrink-0 transition-all text-text-muted hover:text-primary group/cat"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-surface border border-border-subtle flex items-center justify-center transition-all group-hover/cat:bg-primary group-hover/cat:text-white group-hover/cat:shadow-xl group-hover/cat:shadow-primary/30 group-hover/cat:border-primary">
                            <DynamicIcon
                                name={cat.icon || 'ShoppingBag'}
                                className="w-6 h-6"
                                fallback={<ShoppingBag className="w-6 h-6" />}
                            />
                        </div>
                        <span className="text-[11px] font-bold whitespace-nowrap group-hover/cat:font-black text-center px-1">
                            {cat.name}
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
