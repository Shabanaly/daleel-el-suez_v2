'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Loader2, CheckCircle, AlertCircle, Save, X } from 'lucide-react'
import Image from 'next/image'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { updateAvatar } from '@/features/settings/actions/settings.server'
import { useRouter } from 'next/navigation'
import imageCompression from 'browser-image-compression'

interface AvatarSectionProps {
    user: SupabaseUser
}

export function AvatarSection({ user }: AvatarSectionProps) {
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    
    const [avatarUrl, setAvatarUrl] = useState<string>(
        user.user_metadata?.avatar_url || user.user_metadata?.picture || ''
    )
    
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    useEffect(() => {
        setAvatarUrl(user.user_metadata?.avatar_url || user.user_metadata?.picture || '')
    }, [user.user_metadata?.avatar_url, user.user_metadata?.picture])

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setMessage(null)
        setIsUploading(true)
        
        try {
            const options = {
                maxSizeMB: 0.5, // 500KB tops for avatar
                maxWidthOrHeight: 800,
                useWebWorker: true,
                fileType: 'image/webp'
            }
            
            const compressedBlob = await imageCompression(file, options)
            const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: 'image/webp',
                lastModified: Date.now()
            })
            
            // Clean up previous preview url to avoid memory leaks
            if (previewUrl) URL.revokeObjectURL(previewUrl)
                
            const localUrl = URL.createObjectURL(compressedFile)
            setSelectedFile(compressedFile)
            setPreviewUrl(localUrl)
        } catch (error) {
            console.error('Image compression failed:', error)
            setMessage({ type: 'error', text: 'حدث خطأ أثناء معالجة الصورة.' })
        } finally {
            setIsUploading(false)
        }
    }
    
    const cancelSelection = () => {
        setSelectedFile(null)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        setMessage(null)
    }

    const handleSave = async () => {
        if (!selectedFile) return
        
        setIsUploading(true)
        setMessage(null)

        try {
            const formData = new FormData()
            formData.append('file', selectedFile)

            const result = await updateAvatar(formData)

            if (result.success && result.avatarUrl) {
                setMessage({ type: 'success', text: 'تم تحديث الصورة الشخصية بنجاح' })
                setAvatarUrl(result.avatarUrl)
                // Reset state
                setSelectedFile(null)
                if (previewUrl) URL.revokeObjectURL(previewUrl)
                setPreviewUrl(null)
                
                router.refresh()
            } else {
                setMessage({ type: 'error', text: result.error || 'فشل تحديث الصورة' })
            }
        } catch (err) {
            console.error('Avatar update failed:', err)
            setMessage({ type: 'error', text: 'حدث خطأ أثناء رفع الصورة' })
        } finally {
            setIsUploading(false)
        }
    }

    const currentDisplayImage = previewUrl || avatarUrl

    return (
        <div className="flex flex-col md:flex-row items-center gap-8 py-2">
            {/* Avatar Preview */}
            <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background bg-elevated shadow-xl overflow-hidden relative">
                        {currentDisplayImage ? (
                            <Image
                                src={currentDisplayImage}
                                alt="Profile"
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-4xl font-black">
                                {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || '؟'}
                            </div>
                        )}

                        {isUploading && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
                                <Loader2 className="w-8 h-8 animate-spin text-white" />
                            </div>
                        )}
                    </div>

                    {/* Camera Button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center border-4 border-background shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed z-20"
                        aria-label="تغيير الصورة الشخصية"
                    >
                        <Camera className="w-5 h-5" />
                    </button>

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>
                
                {/* Save / Cancel Buttons - Only show when a new file is selected */}
                <AnimatePresence>
                    {selectedFile && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2"
                        >
                            <button
                                onClick={handleSave}
                                disabled={isUploading}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                حفظ
                            </button>
                            <button
                                onClick={cancelSelection}
                                disabled={isUploading}
                                className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 text-sm font-bold rounded-xl transition-all disabled:opacity-50"
                                aria-label="إلغاء التحديد"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Title & Description */}
            <div className="flex-1 text-center md:text-right">
                <h3 className="text-xl font-black text-text-primary mb-2">صورة الملف الشخصي</h3>
                <p className="text-sm text-text-muted font-bold mb-6">
                    تساعد صورتك الأشخاص الآخرين في التعرف عليك والتفاعل معك بشكل أفضل. يفضل أن تكون مربعة وبجودة عالية.
                </p>

                {/* Feedback Message */}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black ${
                            message.type === 'success'
                                ? 'bg-green-500/10 border border-green-500/20 text-green-600'
                                : 'bg-red-500/10 border border-red-500/20 text-red-600'
                        }`}
                    >
                        {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        <span>{message.text}</span>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

