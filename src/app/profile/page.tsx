import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfileStats } from '@/features/profile/components/ProfileStats';
import { ProfileNavigation } from '@/features/profile/components/ProfileNavigation';
import { createClient } from '@/lib/supabase/server';
import { getUserProfileStats } from '@/features/profile/actions/profile.server';
import { redirect } from 'next/navigation';
import { AppBar } from '@/components/ui/AppBar';
import { ROUTES } from '@/constants';
import type { Metadata } from 'next';
export const revalidate = 0;
export async function generateMetadata(): Promise<Metadata> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const title = user?.user_metadata?.full_name 
        ? `${user.user_metadata.full_name} | ملفك الشخصي` 
        : 'ملفك الشخصي | دليل السويس';

    return {
        title,
        description: 'إدارة حسابك، منشوراتك، وإشعاراتك في دليل السويس.',
        robots: { index: false, follow: false } // Private page
    };
}

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect(ROUTES.LOGIN);
    }

    // Fetch user stats & profile
    const [stats, { data: profile }] = await Promise.all([
        getUserProfileStats(user.id),
        supabase.from('profiles').select('role').eq('id', user.id).single()
    ]);

    // Check if user is admin/moderator from metadata OR database
    const userRole = profile?.role || (user.user_metadata?.role as string);
    const isAdmin = ['admin', 'moderator'].includes(userRole);

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-12">
            <AppBar title="البروفايل" backHref={ROUTES.HOME} transparent={true} titleBehavior="scroll-reveal" />
            <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 -mb-24 relative z-10 flex justify-start">
            </div>
            {/* Header section includes cover, avatar, and core info */}
            <ProfileHeader user={user} isOwnProfile={true} />

            <div className="max-w-5xl mx-auto px-4 md:px-12 mt-8 space-y-10">
                {/* Hero Stats Section */}
                <ProfileStats stats={stats} />

                {/* Navigation Menu */}
                <ProfileNavigation isAdmin={isAdmin} />
            </div>
        </div>
    );
}
