'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function getAdminDashboardStats() {
    const supabase = createAdminClient();

    // 1. Total Places
    const { count: totalPlacesCount, error: totalPlacesError } = await supabase
        .from('places')
        .select('*', { count: 'exact', head: true });

    // 2. Pending Places
    const { count: pendingPlacesCount, error: pendingPlacesError } = await supabase
        .from('places')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    // 3. Total Users
    const { count: totalUsersCount, error: totalUsersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });


    if (totalPlacesError) console.error("Error fetching total places count:", totalPlacesError);
    if (pendingPlacesError) console.error("Error fetching pending places count:", pendingPlacesError);
    if (totalUsersError) console.error("Error fetching total users count:", totalUsersError);

    return {
        totalPlaces: totalPlacesCount || 0,
        pendingPlaces: pendingPlacesCount || 0,
        totalUsers: totalUsersCount || 0,
    };
}
