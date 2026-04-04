import { getAdminDashboardStats, DashboardActivity } from '@/features/admin/actions/dashboard';
import { Users, MapPin, Clock, ShoppingBag, MessageSquare, TrendingUp, UserPlus, ShieldCheck, Activity, Eye, AlertTriangle, Settings } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export const metadata = {
    title: 'لوحة التحكم | دليل السويس',
};

function ActivityIcon({ type }: { type: DashboardActivity['type'] }) {
    switch (type) {
        case 'place': return <MapPin className="w-5 h-5" />;
        case 'user': return <UserPlus className="w-5 h-5" />;
        case 'listing': return <ShoppingBag className="w-5 h-5" />;
        case 'post': return <MessageSquare className="w-5 h-5" />;
        default: return <Activity className="w-5 h-5" />;
    }
}

export default async function AdminDashboardPage() {
    const stats = await getAdminDashboardStats();

    const statCards = [
        {
            label: 'إجمالي الأماكن',
            value: stats.totalPlaces,
            icon: MapPin,
            color: 'text-primary',
            bg: 'bg-primary/5',
            link: '/admin/places',
            trend: stats.pendingPlaces > 0 ? `${stats.pendingPlaces} معلق` : 'مستقر',
            description: 'أماكن مضافة في الدليل'
        },
        {
            label: 'المستخدمين',
            value: stats.totalUsers,
            icon: Users,
            color: 'text-accent',
            bg: 'bg-accent/5',
            link: '/admin/users',
            trend: `+${stats.newUsers}`,
            description: 'خلال آخر 7 أيام'
        },
        {
            label: 'زوار اليوم (GA)',
            value: stats.gaStats.activeUsers24h,
            icon: Activity,
            color: 'text-success',
            bg: 'bg-success/5',
            link: '#',
            trend: 'مباشر',
            description: 'نشاط حقيقي من Analytics'
        },
        {
            label: 'معاينات الصفحات',
            value: stats.gaStats.screenPageViews,
            icon: Eye,
            color: 'text-warning',
            bg: 'bg-warning/5',
            link: '#',
            trend: 'نشط',
            description: 'إجمالي المشاهدات اليوم'
        },
        {
            label: 'الماركت والمجتمع',
            value: stats.totalListings + stats.totalPosts,
            icon: ShoppingBag,
            color: 'text-secondary',
            bg: 'bg-secondary/5',
            link: '/admin/market',
            trend: 'متفاعل',
            description: 'إعلانات ومنشورات'
        },
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-border-subtle/50">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-widest">
                        <ShieldCheck className="w-4 h-4" />
                        نظام الإدارة المتطور
                    </div>
                    <h1 className="text-4xl font-black text-text-primary tracking-tighter">لوحة التحكم</h1>
                    <p className="text-text-muted font-medium">مرحباً بك مجدداً، إليك نظرة سريعة على ما يحدث في دليل السويس</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="glass-card px-4 py-2 rounded-2xl flex items-center gap-2 border-primary/20 bg-primary/5">
                        <TrendingUp className="w-4 h-4 text-primary animate-bounce-slow" />
                        <span className="text-xs font-bold text-primary">الموقع في نمو مستمر</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {statCards.map((stat, idx) => (
                    <Link 
                        key={idx} 
                        href={stat.link}
                        className={cn(
                            "glass-card p-6 rounded-3xl group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden border-border-subtle/50",
                            "hover:shadow-2xl hover:shadow-primary/5"
                        )}
                    >
                        {/* Background Decoration */}
                        <div className="absolute -top-4 -left-4 p-8 opacity-[0.03] group-hover:scale-150 transition-transform duration-1000">
                            <stat.icon className={cn("w-20 h-20", stat.color)} />
                        </div>

                        <div className="relative z-10 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className={cn("p-3 rounded-2xl border border-border-subtle shadow-inner", stat.bg)}>
                                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                                </div>
                                <span className={cn(
                                    "text-[10px] font-black px-2 py-0.5 rounded-full border border-border-subtle bg-background/50 uppercase",
                                    idx === 2 ? 'text-success border-success/20' : 'text-primary border-primary/20'
                                )}>
                                    {stat.trend}
                                </span>
                            </div>
                            
                            <div>
                                <h3 className="text-text-secondary text-xs font-black uppercase tracking-wider mb-1">{stat.label}</h3>
                                <div className="text-3xl font-black text-text-primary tracking-tighter mb-1 leading-none">
                                    {stat.value.toLocaleString()}
                                </div>
                                <p className="text-[10px] text-text-muted font-bold">{stat.description}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Main Dashboard Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Section */}
                <div className="lg:col-span-2 glass-card rounded-3xl overflow-hidden border-border-subtle/50 shadow-xl">
                    <div className="p-6 border-b border-border-subtle bg-elevated/20 flex justify-between items-center">
                        <h3 className="font-black text-lg text-text-primary flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            النشاط الأخير
                        </h3>
                        {/* <button className="text-xs font-bold text-primary hover:underline">عرض الكل</button> */}
                    </div>
                    <div className="p-0">
                        {stats.activities.length > 0 ? (
                            <div className="divide-y divide-border-subtle">
                                {stats.activities.map((activity) => (
                                    <div key={activity.id} className="flex items-center gap-4 p-6 hover:bg-primary/5 transition-colors group">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl bg-elevated border border-border-subtle flex items-center justify-center text-text-muted group-hover:border-primary/50 transition-all shadow-inner",
                                            activity.type === 'place' && activity.status === 'pending' ? 'bg-warning/5 text-warning' : ''
                                        )}>
                                            <ActivityIcon type={activity.type} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-text-primary">{activity.title}: {activity.description}</div>
                                            <div className="text-xs text-text-muted font-medium mt-0.5">
                                                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: ar })}
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "text-[10px] font-black px-3 py-1 rounded-full border",
                                            activity.type === 'place' && activity.status === 'pending' 
                                                ? 'bg-warning/10 text-warning border-warning/20' 
                                                : 'bg-primary/5 text-primary border-primary/20'
                                        )}>
                                            {activity.type === 'place' && activity.status === 'pending' ? 'في انتظار المراجعة' : 'تلقائي'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-text-muted font-bold text-sm">
                                لا يوجد نشاط مؤخرأً
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions & System Health */}
                <div className="space-y-6">
                    <div className="glass-card p-6 rounded-3xl border-border-subtle/50 shadow-xl bg-linear-to-br from-primary/5 to-accent/5">
                        <h3 className="font-black text-lg text-text-primary mb-6 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                            إجراءات سريعة
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            <Link href="/admin/reports" className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border-subtle hover:border-error/50 hover:bg-error/5 transition-all text-right group">
                                <div className="p-3 rounded-xl bg-error/10 text-error border border-error/20 group-hover:scale-110 transition-transform">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-black text-text-primary">البلاغات المعلقة</div>
                                    <div className="text-[10px] text-text-muted font-bold">مراجعة المحتوى المبلغ عنه</div>
                                </div>
                            </Link>
                            <Link href="/admin/places?status=pending" className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border-subtle hover:border-warning/50 hover:bg-warning/5 transition-all text-right group">
                                <div className="p-3 rounded-xl bg-warning/10 text-warning border border-warning/20 group-hover:scale-110 transition-transform">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-black text-text-primary">الأماكن المعلقة</div>
                                    <div className="text-[10px] text-text-muted font-bold">الموافقة على الإضافات الجديدة</div>
                                </div>
                            </Link>
                            <Link href="/admin/settings" className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border-subtle hover:border-primary/50 hover:bg-primary/5 transition-all text-right group">
                                <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                                    <Settings className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-black text-text-primary">إعدادات النظام</div>
                                    <div className="text-[10px] text-text-muted font-bold">تغيير حالة الموقع والـ SEO</div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Site Health / Meta */}
                    <div className="glass-card p-6 rounded-3xl border-border-subtle/50 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-black text-text-muted uppercase tracking-widest">حالة النظام</h4>
                            {stats.gaStats.activeUsers > 0 && (
                                <span className="flex items-center gap-1 text-[10px] font-black text-success">
                                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                    {stats.gaStats.activeUsers} نشط حالياً
                                </span>
                            )}
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-text-secondary">قاعدة البيانات</span>
                                <span className="flex items-center gap-1.5 text-success font-black text-[10px]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                                    مستقر
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-text-secondary">تخزين الصور</span>
                                <span className="flex items-center gap-1.5 text-success font-black text-[10px]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                                    مستقر
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-text-secondary">إرسال الإشعارات</span>
                                <span className="flex items-center gap-1.5 text-success font-black text-[10px]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                                    مستقر
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
