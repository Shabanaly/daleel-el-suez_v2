'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, AtSign, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { updateProfile } from '@/lib/actions/settings'
import { User as SupabaseUser } from '@supabase/supabase-js'

interface PersonalInfoFormProps {
    user: SupabaseUser
}

export function PersonalInfoForm({ user }: PersonalInfoFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        const result = await updateProfile(formData)

        if (result.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'success', text: 'تم تحديث البيانات بنجاح' })
        }
        setIsLoading(false)
    }

    const metadata = user.user_metadata || {}

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Full Name */}
                <div className="space-y-2">
                    <label className="text-sm font-black text-text-primary pr-2">الاسم بالكامل</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
                            <User className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            name="fullName"
                            defaultValue={metadata.full_name || ''}
                            placeholder="مثال: أحمد محمد"
                            className="w-full h-14 bg-elevated border border-border-subtle rounded-2xl pr-12 pl-4 text-sm font-bold focus:outline-hidden focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                            required
                        />
                    </div>
                </div>

                {/* Username */}
                <div className="space-y-2">
                    <label className="text-sm font-black text-text-primary pr-2">اسم المستخدم</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
                            <AtSign className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            name="username"
                            defaultValue={metadata.username || ''}
                            placeholder="مثال: ahmed_123"
                            className="w-full h-14 bg-elevated border border-border-subtle rounded-2xl pr-12 pl-4 text-sm font-bold focus:outline-hidden focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-left"
                            dir="ltr"
                            required
                        />
                    </div>
                </div>

                {/* Email (Read Only for now) */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-black text-text-primary pr-2">البريد الإلكتروني (غير قابل للتعديل)</label>
                    <div className="relative group opacity-60">
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-text-muted">
                            <Mail className="w-5 h-5" />
                        </div>
                        <input
                            type="email"
                            value={user.email || ''}
                            readOnly
                            className="w-full h-14 bg-surface border border-border-subtle rounded-2xl pr-12 pl-4 text-sm font-bold cursor-not-allowed text-left"
                            dir="ltr"
                        />
                    </div>
                </div>

            </div>

            {/* Feedback Message */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl flex items-center gap-3 border ${message.type === 'success'
                            ? 'bg-green-500/10 border-green-500/20 text-green-600'
                            : 'bg-red-500/10 border-red-500/20 text-red-600'
                        }`}
                >
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="text-sm font-black">{message.text}</span>
                </motion.div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>حفظ التغييرات</span>
                </button>
            </div>

        </form>
    )
}
