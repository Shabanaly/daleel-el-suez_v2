'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Lock, Bell, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { PersonalInfoForm } from '@/app/settings/_components/PersonalInfoForm'
import { SecuritySection } from '@/app/settings/_components/SecuritySection'
import { NotificationSection } from '@/app/settings/_components/NotificationSection'
import { AvatarSection } from '@/app/settings/_components/AvatarSection'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SettingsContent() {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>(
        (searchParams.get('tab') as 'profile' | 'security' | 'notifications') || 'profile'
    )

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login')
        }
    }, [user, isLoading, router])

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    const tabs = [
        { id: 'profile', label: 'البيانات الشخصية', icon: <User className="w-5 h-5" /> },
        { id: 'security', label: 'الأمان وكلمة المرور', icon: <Lock className="w-5 h-5" /> },
        { id: 'notifications', label: 'الإشعارات', icon: <Bell className="w-5 h-5" /> },
    ]

    return (
        <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="hidden md:flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    {/* Native Back Button Handled by Layout */}
                    <div>
                        <h1 className="text-3xl font-black text-text-primary tracking-tight mb-2">الإعدادات</h1>
                        <p className="text-text-muted font-bold text-sm">إدارة حسابك وتفضيلاتك في مكان واحد</p>
                    </div>
                </div>
                <Link
                    href="/profile"
                    className="flex items-center gap-2 text-primary font-black text-sm hover:underline"
                >
                    <span>الرجوع للبروفايل</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Sidebar Tabs */}
                <div className="lg:col-span-4 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                const id = tab.id as 'profile' | 'security' | 'notifications'
                                setActiveTab(id)
                                router.push(`/settings?tab=${id}`, { scroll: false })
                            }}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-sm transition-all text-right ${activeTab === tab.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-surface text-text-muted hover:bg-elevated border border-border-subtle'
                                }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-8">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-surface border border-border-subtle rounded-[32px] p-6 md:p-8 shadow-sm"
                    >
                        <AnimatePresence mode="wait">
                            {activeTab === 'profile' && (
                                <div key="profile" className="space-y-8">
                                    <AvatarSection user={user} />
                                    <div className="h-px bg-border-subtle/50" />
                                    <PersonalInfoForm user={user} />
                                </div>
                            )}
                            {activeTab === 'security' && (
                                <div key="security">
                                    <SecuritySection />
                                </div>
                            )}
                            {activeTab === 'notifications' && (
                                <div key="notifications">
                                    <NotificationSection />
                                </div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

            </div>
        </div>
    )
}

import { AppBar } from '@/components/ui/AppBar';

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-background pb-20 pt-14 md:pt-24 px-4 md:px-8">
            <AppBar title="الإعدادات" backHref="/profile" />
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            }>
                <SettingsContent />
            </Suspense>
        </div>
    )
}
