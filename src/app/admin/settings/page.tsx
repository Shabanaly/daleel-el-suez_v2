'use client';

import { useState, useEffect } from 'react';
import { getSystemSettings, updateSystemSettings } from '@/features/admin/actions/settings';
import { Settings, ShieldCheck, Globe, Zap, AlertTriangle, Save } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({
        maintenance_mode: false,
        site_title: '',
        site_description: '',
        allowed_registrations: true
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const data = await getSystemSettings();
                setSettings(data);
            } catch (err) {
                console.error(err);
                toast.error('فشل تحميل الإعدادات');
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await updateSystemSettings(settings);
            if (result.success) {
                toast.success('تم حفظ الإعدادات بنجاح');
            } else {
                toast.error(result.error || 'فشل الحفظ');
            }
        } catch (err) {
            toast.error('حدث خطأ في النظام');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin glow-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom duration-700">
            <Toaster position="top-right" />
            
            {/* Header */}
            <div className="space-y-2 border-b border-border-subtle/50 pb-6">
                <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full w-fit border border-primary/20">
                    <Settings className="w-3.5 h-3.5" />
                    تكوين النظام الأساسي
                </div>
                <h1 className="text-4xl font-black text-text-primary tracking-tighter">إعدادات الموقع</h1>
                <p className="text-text-muted font-medium">تحكم في حالة الموقع، إعدادات الـ SEO، والقواعد العامة للنظام</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* General Status */}
                <div className="glass-card p-8 rounded-[40px] space-y-6 shadow-xl border-border-subtle/50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
                            <Zap className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">حالة النظام</h2>
                    </div>

                    <div className="space-y-6 pt-4">
                        <div className="flex items-center justify-between p-4 bg-elevated/40 rounded-3xl border border-border-subtle shadow-inner">
                            <div className="space-y-1 pr-2">
                                <p className="text-sm font-bold text-text-primary">وضع الصيانة (Maintenance Mode)</p>
                                <p className="text-[10px] text-text-muted">عند التفعيل، سيظهر تنبيه للمستخدمين بأن الموقع قيد التطوير.</p>
                            </div>
                            <button 
                                onClick={() => setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })}
                                className={cn(
                                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                    settings.maintenance_mode ? 'bg-error' : 'bg-success/50'
                                )}
                            >
                                <span className={cn(
                                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                    settings.maintenance_mode ? '-translate-x-5' : 'translate-x-0'
                                )} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-elevated/40 rounded-3xl border border-border-subtle shadow-inner">
                            <div className="space-y-1 pr-2">
                                <p className="text-sm font-bold text-text-primary">السماح بتسجيل الحسابات</p>
                                <p className="text-[10px] text-text-muted">تعطيل هذا الخيار سيمنع تسجيل مستخدمين جدد.</p>
                            </div>
                            <button 
                                onClick={() => setSettings({ ...settings, allowed_registrations: !settings.allowed_registrations })}
                                className={cn(
                                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                    settings.allowed_registrations ? 'bg-success' : 'bg-text-muted'
                                )}
                            >
                                <span className={cn(
                                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                    settings.allowed_registrations ? '-translate-x-5' : 'translate-x-0'
                                )} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* SEO Settings */}
                <div className="glass-card p-8 rounded-[40px] space-y-6 shadow-xl border-border-subtle/50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                            <Globe className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">محركات البحث (SEO)</h2>
                    </div>

                    <div className="space-y-5 pt-2">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-2">عنوان الموقع الافتراضي</label>
                            <input 
                                type="text"
                                value={settings.site_title}
                                onChange={(e) => setSettings({...settings, site_title: e.target.value})}
                                className="w-full bg-elevated/30 border border-border-subtle rounded-2xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
                                placeholder="دليل السويس - مرجع المدينة"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-2">وصف الميتا (Meta Description)</label>
                            <textarea 
                                rows={3}
                                value={settings.site_description}
                                onChange={(e) => setSettings({...settings, site_description: e.target.value})}
                                className="w-full bg-elevated/30 border border-border-subtle rounded-2xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none shadow-inner"
                                placeholder="اكتب وصفاً جذاباً لمحركات البحث..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Notice */}
            <div className="p-6 bg-warning/5 border border-warning/20 rounded-3xl flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-warning shrink-0 mt-1" />
                <div className="space-y-1">
                    <p className="text-sm font-black text-warning">تنبيه أمان</p>
                    <p className="text-xs text-text-muted leading-relaxed font-medium">هذه الإعدادات تؤثر على كامل مستخدمي النظام فور حفظها. يرجى التأكد من المراجعة قبل الحفظ. وضع الصيانة سيقوم بإيقاف الوصول للخدمات الرئيسية للمستخدمين العاديين.</p>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end pt-6 border-t border-border-subtle/50">
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-3 px-12 py-4 bg-primary text-white font-black rounded-3xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/40 disabled:opacity-50 disabled:hover:scale-100"
                >
                    {isSaving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    حفظ التغييرات
                </button>
            </div>
        </div>
    );
}

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}
