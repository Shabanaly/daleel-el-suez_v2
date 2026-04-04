'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'يجب تسجيل الدخول لتحديث البيانات' }
    }

    const fullName = formData.get('fullName') as string

    if (!fullName) {
        return { error: 'يرجى ملء الاسم بالكامل' }
    }

    // Update Auth User Metadata
    const { error: authError } = await supabase.auth.updateUser({
        data: {
            full_name: fullName,
        }
    })

    if (authError) {
        return { error: authError.message }
    }

    // Update Public Profiles Table
    const { error: profileError } = await supabase
        .from('profiles')
        .update({
            full_name: fullName,
        })
        .eq('id', user.id)

    if (profileError) {
        return { error: profileError.message }
    }

    revalidateTag(`user-${user.id}-stats`, 'max')
    revalidateTag(`user-${user.id}-activities`, 'max')
    revalidatePath('/profile')
    revalidatePath('/settings')
    return { success: true }
}

export async function updateAvatar(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'يجب تسجيل الدخول لتحديث الصورة' }
    }

    const file = formData.get('file') as File
    if (!file) {
        return { error: 'لم يتم العثور على ملف للصورة' }
    }

    try {
        // 1. Upload to Supabase Storage (avatars bucket)
        // We use a unique name including user ID to overwrite previous avatar and save space
        const fileExt = file.name.split('.').pop()
        const fileName = `avatar.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
                upsert: true,
                contentType: file.type
            })

        if (uploadError) {
            console.error('Storage upload error:', uploadError)
            return { error: 'فشل رفع الصورة إلى الخادم' }
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)

        // Add a timestamp to bypass browser cache
        const finalUrl = `${publicUrl}?t=${Date.now()}`

        // 3. Update Auth User Metadata
        const { error: authError } = await supabase.auth.updateUser({
            data: {
                avatar_url: finalUrl,
            }
        })

        if (authError) {
            return { error: authError.message }
        }

        // 4. Update Public Profiles Table
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                avatar_url: finalUrl,
            })
            .eq('id', user.id)

        if (profileError) {
            return { error: profileError.message }
        }

        revalidateTag(`user-${user.id}-stats`, 'max')
        revalidatePath('/profile')
        revalidatePath('/settings')
        
        return { success: true, avatarUrl: finalUrl }
    } catch (err) {
        console.error('Unexpected updateAvatar error:', err)
        return { error: 'حدث خطأ غير متوقع أثناء تحديث الصورة' }
    }
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()

    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!password || !confirmPassword) {
        return { error: 'يرجى إدخال كلمة المرور وتأكيدها' }
    }

    if (password !== confirmPassword) {
        return { error: 'كلمات المرور غير متطابقة' }
    }

    if (password.length < 6) {
        return { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }
    }

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}
