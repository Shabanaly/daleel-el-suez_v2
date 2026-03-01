import { ProfileHeader } from './_components/ProfileHeader';
import { ProfileStats } from './_components/ProfileStats';
import { ProfileTabs } from './_components/ProfileTabs';
import { createClient } from '@/lib/supabase/server';
import { getUserProfileStats, getUserActivities } from '@/lib/actions/profile';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'البروفايل - دليل السويس',
    description: 'الصفحة الشخصية للمستخدم في دليل السويس',
};

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    // Fetch user stats & activities concurrently
    const [stats, activitiesResult] = await Promise.all([
        getUserProfileStats(user.id),
        getUserActivities(user.id)
    ]);

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            {/* Header section includes cover, avatar, and core info */}
            <ProfileHeader user={user} isOwnProfile={true} />

            {/* Quick Stats overview */}
            <ProfileStats stats={stats} />

            {/* Detailed Activities Tabs */}
            <ProfileTabs
                activities={activitiesResult.activities}
                reviews={activitiesResult.reviews}
                places={activitiesResult.places}
            />
        </div>
    );
}
