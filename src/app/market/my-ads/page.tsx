import { getUserMarketAds } from "@/lib/actions/market";
import MyAdsClient from "./_components/MyAdsClient";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { NativeBackButton } from "@/components/ui/NativeBackButton";

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
        <div className="min-h-screen bg-background pb-10 pt-20 overflow-x-hidden">
            <div className="max-w-4xl mx-auto px-4">
                {/* ─── Breadcrumbs ─── */}
                <NativeBackButton className='lg:hidden mr-2' />

                <MyAdsClient initialAds={ads} />
            </div>
        </div>
    );
}
