import { getMarketAdById, getMarketCategories } from "@/lib/actions/market";
import { getAreasWithIds } from "@/lib/actions/areas";
import { CreateAdForm } from "../../create/_components/CreateAdForm";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { NativeBackButton } from "@/components/ui/NativeBackButton";

interface EditAdPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditAdPage({ params }: EditAdPageProps) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/login?returnUrl=/market/edit/${id}`);
    }

    const [ad, categories, areas] = await Promise.all([
        getMarketAdById(id),
        getMarketCategories(),
        getAreasWithIds()
    ]);

    if (!ad) {
        notFound();
    }

    // Verify ownership
    if (ad.seller_id !== user.id) {
        redirect("/market/my-ads?error=permission-denied");
    }

    return (
        <div className="min-h-screen bg-background pb-20 pt-24 overflow-x-hidden">
            <div className="max-w-4xl mx-auto px-4 mb-10">
                <NativeBackButton className="mb-6 lg:hidden" />
                
                <Link 
                    href="/market/my-ads"
                    className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-6 group lg:flex"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold">الرجوع لإعلاناتي</span>
                </Link>
                
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-black text-text-primary tracking-tight">
                        تعديل <span className="text-primary">إعلانك</span>
                    </h1>
                    <p className="text-text-muted font-medium">عدل بيانات إعلانك عشان تضمن أسرع بيعة.</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4">
                <CreateAdForm categories={categories} areas={areas} initialAd={ad} />
            </div>
        </div>
    );
}
