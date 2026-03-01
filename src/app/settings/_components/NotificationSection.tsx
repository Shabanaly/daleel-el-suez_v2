'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Mail, Smartphone, MessageSquare, Save, Loader2, CheckCircle } from 'lucide-react'

export function NotificationSection() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSaved, setIsSaved] = useState(false)

    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        messages: true,
        updates: true
    })

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
        setIsSaved(false)
    }

    const handleSave = () => {
        setIsLoading(true)
        // Mock save delay
        setTimeout(() => {
            setIsLoading(false)
            setIsSaved(true)
            setTimeout(() => setIsSaved(false), 3000)
        }, 1000)
    }

    const sections = [
        {
            id: 'email',
            label: 'إشعارات البريد الإلكتروني',
            description: 'تلقي ملخصات أسبوعية وأخبار الأماكن الجديدة عبر بريدك.',
            icon: <Mail className="w-5 h-5" />,
            enabled: notifications.email
        },
        {
            id: 'push',
            label: 'إشعارات المتصفح',
            description: 'تنبيهك فوراً عند وجود رد جديد على تعليقاتك أو تقييماتك.',
            icon: <Smartphone className="w-5 h-5" />,
            enabled: notifications.push
        },
        {
            id: 'messages',
            label: 'رسائل المجتمع',
            description: 'تلقي إشعارات بخصوص نشاطك وتفاعلك في قسم المجتمع.',
            icon: <MessageSquare className="w-5 h-5" />,
            enabled: notifications.messages
        }
    ]

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Bell className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-text-primary">إشعارات التنبيهات</h3>
                    <p className="text-sm text-text-muted font-bold">تحكم في كيفية وصول التحديثات إليك</p>
                </div>
            </div>

            <div className="space-y-4">
                {sections.map((section) => (
                    <div
                        key={section.id}
                        onClick={() => toggleNotification(section.id as any)}
                        className={`p-4 md:p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${section.enabled
                            ? 'bg-primary/5 border-primary/20'
                            : 'bg-surface border-border-subtle hover:border-border-subtle/80'
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl transition-colors ${section.enabled ? 'bg-primary text-white' : 'bg-elevated text-text-muted'
                                }`}>
                                {section.icon}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm md:text-base font-black text-text-primary mb-1">{section.label}</h4>
                                <p className="text-xs font-bold text-text-muted leading-relaxed max-w-sm">
                                    {section.description}
                                </p>
                            </div>
                        </div>

                        {/* Custom Toggle Switch */}
                        <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 shrink-0 border ${section.enabled
                            ? 'bg-primary border-primary'
                            : 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700'
                            }`}>
                            <motion.div
                                animate={{ x: section.enabled ? -24 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Save Button Container */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
                <div className="text-xs font-bold text-text-muted italic">
                    ملاحظة: هذه الإعدادات تُحفظ محلياً في نسخة البيتا الحالية.
                </div>

                <button
                    onClick={handleSave}
                    disabled={isLoading || isSaved}
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 disabled:opacity-80 disabled:scale-100 ${isSaved
                        ? 'bg-green-500 text-white shadow-green-500/20'
                        : 'bg-primary text-white shadow-primary/20 hover:scale-105'
                        }`}
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSaved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />)}
                    <span>{isSaved ? 'تم الحفظ' : 'حفظ التفضيلات'}</span>
                </button>
            </div>
        </div>
    )
}
