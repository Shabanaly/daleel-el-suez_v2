import { getUserMarketAds } from "@/features/market/actions/market.server";
import MyAdsClient from "@/features/market/components/MyAdsClient";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AppBar } from '@/components/ui/AppBar';
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
        <div className="min-h-screen bg-background pb-20" dir="rtl">
            <MyAdsClient initialAds={ads} />
        </div>
    );
}
