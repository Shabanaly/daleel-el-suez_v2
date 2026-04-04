import { getArchivedNotificationsAction, markAllNotificationsAsReadAction } from '@/features/notifications/actions/notifications.server';
import { NotificationArchiveList } from '@/features/notifications/components/NotificationArchiveList';
import { AppBar } from '@/components/ui/AppBar';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CheckCheck } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const metadata = {
    title: 'الإشعارات - دليل السويس',
    description: 'تاريخ الإشعارات والتنبيهات الخاصة بك في دليل السويس',
};

export default async function NotificationsArchivePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { notifications, total } = await getArchivedNotificationsAction(1, 20);

    const markAllRead = async () => {
        'use server';
        await markAllNotificationsAsReadAction();
        revalidatePath('/profile/notifications');
    };

    return (
        <div className="min-h-screen bg-background pb-32">
            <AppBar 
                title="الإشعارات" 
                backHref="/profile" 
                transparent={true}
                titleBehavior="scroll-reveal"
            />

            {/* Header Background Decoration */}
            <div className="absolute top-0 right-0 w-full h-64 bg-linear-to-b from-primary/10 via-primary/2 to-transparent -z-10" />

            <div className="max-w-3xl mx-auto px-6 pt-20 md:pt-28">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-text-primary tracking-tight">
                            أرشيف الإشعارات
                        </h1>
                        <p className="text-text-muted font-bold mt-3 max-w-md leading-relaxed">
                            تابع نشاطاتك وتفاعلات المجتمع مع منشوراتك وأماكنك المفضلة في السويس
                        </p>
                    </div>

                    <form action={markAllRead}>
                        <button 
                            type="submit"
                            className="flex items-center gap-2 px-6 py-3 bg-surface hover:bg-primary/10 text-primary border border-primary/20 text-sm font-bold rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-95"
                        >
                            <CheckCheck className="w-5 h-5" />
                            تمييز الكل كمقروء
                        </button>
                    </form>
                </div>

                <div className="relative">
                    <NotificationArchiveList 
                        initialNotifications={notifications} 
                        initialTotal={total} 
                    />
                </div>
            </div>
        </div>
    );
}
