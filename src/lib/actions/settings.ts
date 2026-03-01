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
    const username = formData.get('username') as string

    if (!fullName || !username) {
        return { error: 'يرجى ملء جميع الحقول المطلوبة' }
    }

    // Update Auth User Metadata
    const { error: authError } = await supabase.auth.updateUser({
        data: {
            full_name: fullName,
            username: username,
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
            username: username,
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

export async function updateAvatar(avatarUrl: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'يجب تسجيل الدخول لتحديث الصورة' }
    }

    // Update Auth User Metadata
    const { error: authError } = await supabase.auth.updateUser({
        data: {
            avatar_url: avatarUrl,
        }
    })

    if (authError) {
        return { error: authError.message }
    }

    // Update Public Profiles Table
    const { error: profileError } = await supabase
        .from('profiles')
        .update({
            avatar_url: avatarUrl,
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
