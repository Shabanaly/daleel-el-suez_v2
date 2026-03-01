'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { updateAvatar } from '@/lib/actions/settings'

interface AvatarSectionProps {
    user: SupabaseUser
}

export function AvatarSection({ user }: AvatarSectionProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        user.user_metadata?.avatar_url || user.user_metadata?.picture || null
    )

    // In a real app, this would handle Cloudinary upload. 
    // For now, we'll implement a simple "Select from samples" or just mock the upload.
    // Given the project uses Cloudinary, we should ideally use the existing upload logic.

    async function handleAvatarUpdate(url: string) {
        setIsLoading(true)
        setMessage(null)

        const result = await updateAvatar(url)

        if (result.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setPreviewUrl(url)
            setMessage({ type: 'success', text: 'تم تحديث الصورة بنجاح' })
        }
        setIsLoading(false)
    }

    return (
        <div className="flex flex-col md:flex-row items-center gap-8 py-2">

            {/* Avatar Preview */}
            <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background bg-elevated shadow-xl overflow-hidden relative">
                    {previewUrl ? (
                        <Image
                            src={previewUrl}
                            alt="Profile"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-4xl font-black">
                            {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)}
                        </div>
                    )}

                    {isLoading && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-white" />
                        </div>
                    )}
                </div>

                <button className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center border-4 border-background shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer">
                    <Camera className="w-5 h-5" />
                </button>
            </div>

            {/* Title & Description */}
            <div className="flex-1 text-center md:text-right">
                <h3 className="text-xl font-black text-text-primary mb-2">صورة الملف الشخصي</h3>
                <p className="text-sm text-text-muted font-bold mb-6">
                    تساعد صورتك الأشخاص الآخرين في التعرف عليك والتفاعل معك بشكل أفضل.
                </p>

                {/* Feedback Message */}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-black mb-4 ${message.type === 'success'
                                ? 'bg-green-500/10 border-green-500/20 text-green-600'
                                : 'bg-red-500/10 border-red-500/20 text-red-600'
                            }`}
                    >
                        {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        <span>{message.text}</span>
                    </motion.div>
                )}

                {/* Note about uploading */}
                <div className="bg-elevated/50 border border-border-subtle p-3 rounded-xl text-[11px] font-bold text-text-muted inline-block">
                    ملاحظة: سيتم دمج نظام رفع الصور مع Cloudinary قريباً.
                </div>
            </div>

        </div>
    )
}
