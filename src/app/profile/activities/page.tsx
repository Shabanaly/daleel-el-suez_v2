import { SubPageHeader } from '@/app/profile/_components/SubPageHeader';
import { ActivityListTile } from '@/app/profile/_components/ActivityListTile';
import { createClient } from '@/lib/supabase/server';
import { getUserActivities } from '@/lib/actions/profile';
import { redirect } from 'next/navigation';
import { Activity } from 'lucide-react';
import Link from 'next/link';
import { NativeBackButton } from '../../../components/ui/NativeBackButton';

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
            <SubPageHeader user={user} title="سجل النشاطات" />

            <div className="max-w-4xl mx-auto px-4 md:px-12 mt-2">
                <div className="flex justify-start lg:hidden">
                    <NativeBackButton className="-mr-2" />
                </div>
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-text-muted font-medium mb-1">التقييمات، الأماكن، والتعليقات</p>
                        <h2 className="text-3xl font-black text-text-primary">كل ما قمت به</h2>
                    </div>
                    <div className="w-14 h-14 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-lg shadow-blue-500/5">
                        <Activity className="w-7 h-7" />
                    </div>
                </div>

                {activities.length > 0 ? (
                    <div className="space-y-3">
                        {activities.map((activity, index) => (
                            <ActivityListTile
                                key={activity.id}
                                activity={activity as any}
                                index={index}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-surface border border-border-subtle rounded-3xl">
                        <div className="w-16 h-16 bg-elevated rounded-full flex items-center justify-center mx-auto mb-4">
                            <Activity className="w-8 h-8 text-text-muted/30" />
                        </div>
                        <h3 className="text-lg font-bold text-text-primary">لا توجد نشاطات بعد</h3>
                        <p className="text-sm text-text-muted mt-1">ابدأ باستكشاف السويس وإضافة تقييماتك</p>
                    </div>
                )}
            </div>
        </div>
    );
}
