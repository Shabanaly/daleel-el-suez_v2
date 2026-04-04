import { getMarketCategories } from "@/features/market/actions/market.server";
import { getAreasWithIds } from "@/features/taxonomy/actions/areas";
import { CreateAdForm } from "@/features/market/components/CreateAdForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AppBar } from '@/components/ui/AppBar';
export default async function CreateAdPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?returnUrl=/market/create");
    }

    const [categories, areas] = await Promise.all([
        getMarketCategories(),
        getAreasWithIds()
    ]);

    return (
        <div className="min-h-screen bg-background pb-20 pt-14 md:pt-24 overflow-x-hidden">
            <AppBar title="أضف إعلانك" backHref="/market" />
            {/* ─── Header ─── */}
            <div className="max-w-4xl mx-auto px-4 mb-10 mt-4 md:mt-0">
                <Link 
                    href="/market"
                    className="hidden lg:inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold">الرجوع للسوق</span>
                </Link>
                
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-black text-text-primary tracking-tight">
                        بيع حاجة <span className="text-primary">مستني إيه؟</span>
                    </h1>
                    <p className="text-text-muted font-medium">سوق السويس بيجمعك بأكتر من 100,000 مشترى شهرياً بالمنطقة.</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4">
                <CreateAdForm categories={categories} areas={areas} />
            </div>
        </div>
    );
}
