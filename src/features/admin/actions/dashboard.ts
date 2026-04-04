import { createAdminClient } from '@/lib/supabase/admin';
import { getQuickStats } from '@/lib/google/analytics';

export interface DashboardActivity {
    id: string;
    type: 'place' | 'user' | 'listing' | 'post';
    title: string;
    description: string;
    timestamp: string;
    status?: string;
}

export async function getAdminDashboardStats() {
    const supabase = createAdminClient();
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
        totalPlaces,
        pendingPlaces,
        totalUsers,
        newUsers,
        totalListings,
        totalPosts,
        gaStats,
        recentPlaces,
        recentUsers,
        recentListings
    ] = await Promise.all([
        supabase.from('places').select('*', { count: 'exact', head: true }),
        supabase.from('places').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', last7Days),
        supabase.from('listings').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        getQuickStats(),
        // Fetch recent items for activity feed
        supabase.from('places').select('id, name, created_at, status').order('created_at', { ascending: false }).limit(3),
        supabase.from('profiles').select('id, full_name, created_at').order('created_at', { ascending: false }).limit(3),
        supabase.from('listings').select('id, title, created_at').order('created_at', { ascending: false }).limit(3),
    ]);

    // Combine and format recent activities
    const activities: DashboardActivity[] = [
        ...(recentPlaces.data || []).map(p => ({
            id: p.id,
            type: 'place' as const,
            title: 'مكان جديد',
            description: p.name,
            timestamp: p.created_at,
            status: p.status
        })),
        ...(recentUsers.data || []).map(u => ({
            id: u.id,
            type: 'user' as const,
            title: 'مستخدم جديد',
            description: u.full_name || 'مستخدم غير معروف',
            timestamp: u.created_at
        })),
        ...(recentListings.data || []).map(l => ({
            id: l.id,
            type: 'listing' as const,
            title: 'إعلان جديد',
            description: l.title,
            timestamp: l.created_at
        }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

    return {
        totalPlaces: totalPlaces.count || 0,
        pendingPlaces: pendingPlaces.count || 0,
        totalUsers: totalUsers.count || 0,
        newUsers: newUsers.count || 0,
        totalListings: totalListings.count || 0,
        totalPosts: totalPosts.count || 0,
        gaStats,
        activities
    };
}
