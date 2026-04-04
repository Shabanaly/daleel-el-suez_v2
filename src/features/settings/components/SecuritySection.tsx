'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, ShieldCheck, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { updatePassword } from '@/features/settings/actions/settings.server'

export function SecuritySection() {
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        const result = await updatePassword(formData)

        if (result && result.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'success', text: 'تم تحديث كلمة المرور بنجاح' })
                // Reset form
                ; (e.target as HTMLFormElement).reset()
        }
        setIsLoading(false)
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-text-primary">أمان الحساب</h3>
                    <p className="text-sm text-text-muted font-bold">تغيير كلمة المرور وتأمين حسابك</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* New Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-black text-text-primary pr-2">كلمة المرور الجديدة</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="8 أحرف على الأقل"
                                className="w-full h-14 bg-elevated border border-border-subtle rounded-2xl pr-12 pl-12 text-sm font-bold focus:outline-hidden focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-left"
                                dir="ltr"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 left-0 pl-4 flex items-center text-text-muted hover:text-primary transition-colors cursor-pointer"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-black text-text-primary pr-2">تأكيد كلمة المرور</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                placeholder="أعد إدخال كلمة المرور"
                                className="w-full h-14 bg-elevated border border-border-subtle rounded-2xl pr-12 pl-12 text-sm font-bold focus:outline-hidden focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-left"
                                dir="ltr"
                                required
                            />
                        </div>
                    </div>

                </div>

                {/* Feedback Message */}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-4 rounded-2xl flex items-center gap-3 border ${message.type === 'success'
                                ? 'bg-green-500/10 border-green-500/20 text-green-600'
                                : 'bg-red-500/10 border-red-500/20 text-red-600'
                            }`}
                    >
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span className="text-sm font-black">{message.text}</span>
                    </motion.div>
                )}

                {/* Note */}
                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                    <p className="text-xs font-bold text-amber-600 leading-relaxed">
                        نصيحة: استخدم كلمة مرور قوية تحتوي على حروف وأرقام ورموز لضمان أقصى قدر من الأمان لحسابك.
                    </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-accent text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                        <span>تغيير كلمة المرور</span>
                    </button>
                </div>

            </form>
        </div>
    )
}
