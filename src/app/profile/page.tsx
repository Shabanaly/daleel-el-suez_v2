import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfileStats } from '@/features/profile/components/ProfileStats';
import { ProfileNavigation } from '@/features/profile/components/ProfileNavigation';
import { createClient } from '@/lib/supabase/server';
import { getUserProfileStats } from '@/features/profile/actions/profile.server';
import { redirect } from 'next/navigation';
import { AppBar } from '@/components/ui/AppBar';
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

    // Fetch user stats
    const stats = await getUserProfileStats(user.id);

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-12">
            <AppBar title="البروفايل" backHref="/" transparent={true} titleBehavior="scroll-reveal" />
            <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 -mb-24 relative z-10 flex justify-start">
            </div>
            {/* Header section includes cover, avatar, and core info */}
            <ProfileHeader user={user} isOwnProfile={true} />

            <div className="max-w-7xl mx-auto px-4 md:px-12 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

                    {/* Left Sidebar (Desktop): Stats */}
                    <aside className="md:col-span-4 lg:col-span-3 space-y-6 md:sticky md:top-24">
                        <div className="p-1">
                            <ProfileStats stats={stats} />
                        </div>
                    </aside>

                    {/* Main Content (Desktop): Navigation List Tiles */}
                    <main className="md:col-span-8 lg:col-span-9">
                        <ProfileNavigation />
                    </main>

                </div>
            </div>
        </div>
    );
}
