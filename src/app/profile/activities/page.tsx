import { getUserActivities } from '@/features/profile/actions/profile.server';
import { redirect } from 'next/navigation';
import { ActivitiesClient } from './_components/ActivitiesClient';
import { createClient } from '@/lib/supabase/server';
export const metadata = {
    title: 'نشاطاتي - دليل السويس',
};

export default async function ActivitiesPage() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }
    const { activities } = await getUserActivities(user.id, 50);

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-12 text-right" dir="rtl">
            <ActivitiesClient activities={activities as any} />
        </div>
    );
}
