'use client';

import { Activity, LayoutDashboard, Settings, ChevronLeft, LogOut, Tag, Bell, ShieldCheck } from 'lucide-react';
import CustomLink from '@/components/customLink/customLink';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface ProfileNavigationProps {
    isAdmin?: boolean;
}

export function ProfileNavigation({ isAdmin }: ProfileNavigationProps) {
    const router = useRouter();
    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const navItems = [
        {
            label: 'نشاطاتي',
            description: 'التقييمات، الأماكن المضافة، والتعليقات',
            href: '/profile/activities',
            icon: <Activity className="w-6 h-6 text-blue-500" />,
            bgColor: 'bg-blue-500/10'
        },
        {
            label: 'الإشعارات',
            description: 'تنبيهات التفاعل، التعليقات، والإعجابات',
            href: '/profile/notifications',
            icon: <Bell className="w-6 h-6 text-orange-500" />,
            bgColor: 'bg-orange-500/10'
        },
        {
            label: 'إعلاناتي',
            description: 'إدارة إعلاناتك في السوق والمبوبة',
            href: '/market/my-ads',
            icon: <Tag className="w-6 h-6 text-emerald-500" />,
            bgColor: 'bg-emerald-500/10'
        },
        {
            label: 'إدارة أعمالي',
            description: 'تحديث بيانات أماكنك والرد على المراجعات',
            href: '/manage',
            icon: <LayoutDashboard className="w-6 h-6 text-primary" />,
            bgColor: 'bg-primary/10'
        },
        {
            label: 'إعدادات الحساب',
            description: 'تعديل بياناتك الشخصية وتغيير كلمة المرور',
            href: '/settings',
            icon: <Settings className="w-6 h-6 text-slate-500" />,
            bgColor: 'bg-slate-500/10'
        }
    ];

    return (
        <div className="w-full pb-24">
            <div className="space-y-3">
                {navItems.map((item, index) => (
                    <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <CustomLink
                            href={item.href}
                            className="flex items-center gap-4 p-4 bg-surface hover:bg-elevated border border-border-subtle rounded-3xl transition-all group shadow-sm hover:shadow-md"
                        >
                            <div className={`w-12 h-12 rounded-2xl ${item.bgColor} flex items-center justify-center shrink-0`}>
                                {item.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-black text-text-primary group-hover:text-primary transition-colors">
                                    {item.label}
                                </h3>
                                <p className="text-xs text-text-muted font-medium">
                                    {item.description}
                                </p>
                            </div>
                            <ChevronLeft className="w-5 h-5 text-text-muted group-hover:text-primary group-hover:translate-x-[-4px] transition-all" />
                        </CustomLink>
                    </motion.div>
                ))}

                {isAdmin && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 }}
                        className="mt-6"
                    >
                        <CustomLink
                            href="/admin"
                            className="flex items-center gap-4 p-4 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-3xl transition-all group shadow-sm hover:shadow-md"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-black text-primary">
                                    لوحة التحكم (إشراف)
                                </h3>
                                <p className="text-xs text-primary/60 font-medium">
                                    إدارة الأماكن، المستخدمين، والطلبات
                                </p>
                            </div>
                            <ChevronLeft className="w-5 h-5 text-primary group-hover:translate-x-[-4px] transition-all" />
                        </CustomLink>
                    </motion.div>
                )}

                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 p-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-3xl transition-all group mt-3"
                >
                    <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0 text-red-600 dark:text-red-500">
                        <LogOut className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-right">
                        <h3 className="text-base font-black text-red-600 dark:text-red-500">
                            تسجيل الخروج
                        </h3>
                        <p className="text-xs text-red-400 font-medium">
                            نراك قريباً في دليل السويس
                        </p>
                    </div>
                </motion.button>
            </div>
        </div>
    );
}
