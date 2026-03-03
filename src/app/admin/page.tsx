import { getAdminDashboardStats } from '@/lib/actions/admin/dashboard';
import { Users, MapPin, Clock } from 'lucide-react';

export const metadata = {
    title: 'لوحة التحكم',
};

// Next.js Server Component
export default async function AdminDashboardPage() {
    const stats = await getAdminDashboardStats();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-primary">لوحة التحكم</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Total Places */}
                <div className="bg-surface p-6 rounded-2xl border border-border-subtle shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                        <MapPin className="w-24 h-24 text-primary" />
                    </div>
                    <div className="relative z-10 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <h3 className="text-text-muted text-sm font-bold">إجمالي الأماكن</h3>
                        </div>
                        <p className="text-4xl font-black text-text-primary mt-2">{stats.totalPlaces}</p>
                    </div>
                </div>

                {/* Pending Places */}
                <div className="bg-surface p-6 rounded-2xl border border-border-subtle shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                        <Clock className="w-24 h-24 text-warning" />
                    </div>
                    <div className="relative z-10 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-warning/10 text-warning">
                                <Clock className="w-5 h-5" />
                            </div>
                            <h3 className="text-text-muted text-sm font-bold">الأماكن المعلقة (للمراجعة)</h3>
                        </div>
                        <p className="text-4xl font-black text-warning mt-2">{stats.pendingPlaces}</p>
                    </div>
                </div>

                {/* Users Count */}
                <div className="bg-surface p-6 rounded-2xl border border-border-subtle shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                        <Users className="w-24 h-24 text-accent" />
                    </div>
                    <div className="relative z-10 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-accent/10 text-accent">
                                <Users className="w-5 h-5" />
                            </div>
                            <h3 className="text-text-muted text-sm font-bold">المستخدمين المسجلين</h3>
                        </div>
                        <p className="text-4xl font-black text-accent mt-2">{stats.totalUsers}</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
