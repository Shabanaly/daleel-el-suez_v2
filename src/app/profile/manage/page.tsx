import { createClient } from '@/lib/supabase/server';
import { getOwnedPlaces, getOwnedPlacesReviews } from '@/lib/actions/business';
import { redirect } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { ManageContent } from '@/app/profile/_components/ManageContent';
import { AppBar } from '@/components/ui/AppBar';

export const metadata = {
    title: 'إدارة أعمالي - دليل السويس',
};

export default async function ManagePage() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    // Fetch owned places and their reviews
    const [placesRes, reviewsRes] = await Promise.all([
        getOwnedPlaces(),
        getOwnedPlacesReviews()
    ]);

    const places = placesRes.success ? (placesRes.places || []) : [];
    const reviews = reviewsRes.success ? (reviewsRes.reviews || []) : [];

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-12 text-right" dir="rtl">
            <AppBar title="إدارة أنشطتي" backHref="/profile" />

            <div className="max-w-5xl mx-auto px-4 md:px-12 mt-4 pt-14 md:pt-24">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-text-muted font-medium mb-1">تحكّم في بيانات أماكنك والردود</p>
                        <h1 className="text-3xl font-black text-text-primary">لوحة التحكم</h1>
                    </div>
                    <div className="w-14 h-14 bg-primary/10 rounded-3xl flex items-center justify-center text-primary border border-primary/20 shadow-lg shadow-primary/5">
                        <LayoutDashboard className="w-7 h-7" />
                    </div>
                </div>

                <ManageContent places={places} reviews={reviews} />
            </div>
        </div>
    );
}
