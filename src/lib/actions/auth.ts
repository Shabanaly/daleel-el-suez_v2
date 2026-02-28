'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

const AUTH_ERRORS_AR: Record<string, string> = {
    'Invalid login credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    'Email not confirmed': 'يرجى تأكيد بريدك الإلكتروني أولاً عبر الرابط المرسل لبريدك',
    'User already registered': 'هذا البريد الإلكتروني مسجل بالفعل، حاول تسجيل الدخول',
    'Password is too short': 'كلمة المرور قصيرة جداً (يجب أن تكون ٦ أحرف على الأقل)',
    'Network error': 'خطأ في الاتصال بالشبكة، يرجى التحقق من الإنترنت',
    'Auth session missing!': 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى',
    'Database error': 'خطأ في قاعدة البيانات، يرجى المحاولة لاحقاً',
    'rate_limit': 'لقد قمت بمحاولات كثيرة جداً، يرجى الانتظار قليلاً',
}

function getErrorMessage(error: any): string {
    const message = error?.message || String(error);
    if (error?.status === 429) return AUTH_ERRORS_AR['rate_limit'];
    return AUTH_ERRORS_AR[message] || 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً';
}

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: getErrorMessage(error) }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}


export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    if (!email || !password || !fullName) {
        return { error: 'يرجى ملء جميع الحقول المطلوبة' }
    }

    if (password.length < 6) {
        return { error: AUTH_ERRORS_AR['Password is too short'] }
    }

    // Generating a simple username from email for now to satisfy DB constraint
    const username = email.split('@')[0] + Math.floor(Math.random() * 1000)

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                username: username,
            },
        },
    })

    if (error) {
        return { error: getErrorMessage(error) }
    }

    // Since we have a trigger or manual profiles insertion:
    // Supabase Auth signup doesn't automatically insert into public.profiles 
    // unless a trigger is set up in SQL. If not, we do it here.
    if (data.user) {
        const supabaseAdmin = createAdminClient()
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: data.user.id,
                username: username,
                full_name: fullName,
            })

        if (profileError) {
            console.error('Error creating profile:', profileError)
        }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()

    // Explicitly revalidate everything to clear user state from the UI
    revalidatePath('/', 'layout')

    // Redirect to login with a cache-buster just in case
    redirect(`/login?t=${Date.now()}`)
}


export async function signInWithGoogle() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
            queryParams: {
                prompt: 'select_account',
            },
        },
    })

    if (error) {
        return { error: getErrorMessage(error) }
    }

    if (data.url) {
        return { url: data.url }
    }
}

export async function signInWithFacebook() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
            queryParams: {
                prompt: 'select_account',
            },
        },
    })


    if (error) {
        return { error: getErrorMessage(error) }
    }

    if (data.url) {
        return { url: data.url }
    }
}


export async function loginWithIdToken(idToken: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
    })

    if (error) {
        return { error: getErrorMessage(error) }
    }

    if (data && data.user) {
        const user = data.user;
        // Ensure profile exists for One Tap users (first time login)
        // Use Admin client to bypass RLS
        const supabaseAdmin = createAdminClient()
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: user.id,
                username: (user.email?.split('@')?.[0] || 'user') + Math.floor(Math.random() * 1000),
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'مستخدم جديد',
                avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
            }, { onConflict: 'id' })

        if (profileError) {
            console.error('[AUTH] OneTap Profile Sync Error:', profileError)
        }

        revalidatePath('/', 'layout')
        redirect(`/?t=${Date.now()}`)
    }


    return { error: 'Failed to verify user' }
}

