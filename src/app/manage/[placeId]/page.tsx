import { createClient } from '@/lib/supabase/server';
import { getOwnedPlaceDetails, getOwnedPlacesReviews } from '@/features/business/actions/business.server';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants';
import { BusinessDashboardClient } from '@/features/business/components/BusinessDashboardClient';
import { getCategoriesWithIds } from '@/features/taxonomy/actions/categories';
import { getAreasWithIds } from '@/features/taxonomy/actions/areas';

export const metadata = {
    title: 'لوحة التحكم - دليل السويس',
};

interface DashboardPageProps {
    params: Promise<{
        placeId: string;
    }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
    const { placeId } = await params;
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect(ROUTES.LOGIN);
    }

    // Fetch place details, reviews, categories, and areas in parallel
    const [placeRes, reviewsRes, categories, areas] = await Promise.all([
        getOwnedPlaceDetails(placeId),
        getOwnedPlacesReviews(),
        getCategoriesWithIds(),
        getAreasWithIds(),
    ]);

    if (!placeRes.success || !placeRes.place) {
        redirect(ROUTES.MANAGE); // Redirect back to list if unauthorized or not found
    }

    const allReviews = reviewsRes.success ? (reviewsRes.reviews || []) : [];
    const placeReviews = allReviews.filter(r => r.place_id === placeId);

    return (
        <BusinessDashboardClient
            place={placeRes.place}
            reviews={placeReviews}
            categories={categories}
            areas={areas}
        />
    );
}
