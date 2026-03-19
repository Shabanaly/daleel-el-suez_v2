import { getUserMarketAds } from "@/lib/actions/market";
import MyAdsClient from "./_components/MyAdsClient";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';

export const metadata = {
    title: 'إعلاناتي | سوق السويس',
    description: 'إدارة إعلاناتك المعروضة في سوق السويس'
};

export default async function MyAdsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?returnUrl=/market/my-ads");
    }

    const ads = await getUserMarketAds();

    return (
        <div className="min-h-screen bg-background pb-20 pt-24 overflow-x-hidden">
            <div className="max-w-4xl mx-auto px-4">
                {/* ─── Breadcrumbs ─── */}
                <div className="flex items-center justify-between mb-8">
                    <Link 
                        href="/market"
                        className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-bold">الرجوع للسوق</span>
                    </Link>
                </div>

                <MyAdsClient initialAds={ads} />
            </div>
        </div>
    );
}
