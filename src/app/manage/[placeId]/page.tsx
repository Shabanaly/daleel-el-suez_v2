import { createClient } from '@/lib/supabase/server';
import { getOwnedPlaceDetails, getOwnedPlacesReviews } from '@/features/business/actions/business.server';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants';
import { BusinessDashboardClient } from '@/features/business/components/BusinessDashboardClient';

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

    // Fetch place details
    const placeRes = await getOwnedPlaceDetails(placeId);

    if (!placeRes.success || !placeRes.place) {
        redirect(ROUTES.MANAGE); // Redirect back to list if unauthorized or not found
    }

    // We can also reuse getOwnedPlacesReviews but filter it down, or we can fetch reviews specifically for this place later if we want.
    // For now, let's fetch all user reviews and filter to this place (as done in previous implementation) or create a specific function later.
    const reviewsRes = await getOwnedPlacesReviews();
    const allReviews = reviewsRes.success ? (reviewsRes.reviews || []) : [];
    const placeReviews = allReviews.filter(r => r.place_id === placeId);

    return (
        <BusinessDashboardClient
            place={placeRes.place}
            reviews={placeReviews}
        />
    );
}
