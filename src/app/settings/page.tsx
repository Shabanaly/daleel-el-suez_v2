'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Lock, Bell, ChevronRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { PersonalInfoForm } from '@/features/settings/components/PersonalInfoForm'
import { SecuritySection } from '@/features/settings/components/SecuritySection'
import { NotificationSection } from '@/features/settings/components/NotificationSection'
import { AvatarSection } from '@/features/settings/components/AvatarSection'
import { AppBar } from '@/components/ui/AppBar'
import Image from 'next/image'
import CustomLink from '@/components/customLink/customLink'
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

    const handleTabChange = (id: 'profile' | 'security' | 'notifications') => {
        setActiveTab(id)
        router.push(`/settings?tab=${id}`, { scroll: false })
    }

    return (
        <div className="max-w-4xl mx-auto">

            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-text-primary tracking-tight mb-2">الإعدادات</h1>
                    <p className="text-text-muted font-bold text-sm">إدارة حسابك وتفضيلاتك في مكان واحد</p>
                </div>
                <CustomLink
                    href="/profile"
                    className="flex items-center gap-2 text-primary font-black text-sm hover:underline"
                >
                    <span>الرجوع للبروفايل</span>
                    <ChevronRight className="w-4 h-4 rotate-180" />
                </CustomLink>
            </div>

            {/* Mobile: Horizontal chips */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar lg:hidden mb-6 pb-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id as 'profile' | 'security' | 'notifications')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-black text-sm whitespace-nowrap transition-all shrink-0 ${
                            activeTab === tab.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-surface border border-border-subtle text-text-muted'
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Desktop Sidebar */}
                <div className="hidden lg:block lg:col-span-4 space-y-3">

                    {/* User Info Card */}
                    <div className="flex items-center gap-3 p-4 bg-surface border border-border-subtle rounded-2xl">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 shrink-0 relative">
                            {user.user_metadata?.avatar_url ? (
                                <Image
                                    src={user.user_metadata.avatar_url}
                                    alt="Profile"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-primary font-black text-lg">
                                    {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || '؟'}
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-black text-text-primary truncate">
                                {user.user_metadata?.full_name || 'المستخدم'}
                            </p>
                            <p className="text-xs text-text-muted truncate">{user.email}</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id as 'profile' | 'security' | 'notifications')}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-sm transition-all text-right ${
                                activeTab === tab.id
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
                        className="bg-surface border border-border-subtle rounded-[32px] p-6 md:p-10 shadow-sm"
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

export default function SettingsPage() {
    return (
        <>
            <AppBar title="الإعدادات" backHref="/profile" />
        <div className="min-h-screen bg-background pb-20 pt-16 md:pt-20 px-4 md:px-8">
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            }>
                <SettingsContent />
            </Suspense>
        </div>
        </>
    )
}
