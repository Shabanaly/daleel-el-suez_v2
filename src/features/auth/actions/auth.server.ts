/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { AuthResult } from '../types'
import { AUTH_MESSAGES, APP_CONFIG, ROUTES, API_ENDPOINTS } from '@/constants'

function getErrorMessage(error: unknown): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const message = (error as any)?.message || String(error);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.status === 429) return AUTH_MESSAGES.RATE_LIMIT;

    const errorMapping: Record<string, string> = {
        'Invalid login credentials': AUTH_MESSAGES.INVALID_CREDENTIALS,
        'Email not confirmed': AUTH_MESSAGES.EMAIL_NOT_CONFIRMED,
        'User already registered': AUTH_MESSAGES.USER_ALREADY_REGISTERED,
        'Password is too short': AUTH_MESSAGES.PASSWORD_TOO_SHORT,
        'Network error': AUTH_MESSAGES.NETWORK_ERROR,
        'Auth session missing!': AUTH_MESSAGES.SESSION_EXPIRED,
        'Database error': AUTH_MESSAGES.DATABASE_ERROR,
    };

    return errorMapping[message] || AUTH_MESSAGES.UNEXPECTED_ERROR;
}

export async function login(formData: FormData): Promise<AuthResult> {
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
    return { success: true }
}


export async function signup(formData: FormData): Promise<AuthResult> {
    // 🛡️ Honeypot check
    const honeypot = formData.get('hp_field_check') as string
    if (honeypot) {
        console.warn('Spam detected via signup honeypot')
        return { error: 'تم اكتشاف نشاط مشبوه' }
    }

    const supabase = await createClient()


    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('full_name') as string

    if (!email || !password || !fullName) {
        return { error: AUTH_MESSAGES.FILL_REQUIRED_FIELDS }
    }

    if (password.length < 6) {
        return { error: AUTH_MESSAGES.PASSWORD_TOO_SHORT }
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
    return { success: true }
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()

    revalidatePath('/', 'layout')
    return { success: true }
}


export async function signInWithGoogle() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${APP_CONFIG.SITE_URL}${ROUTES.AUTH_CALLBACK}`,
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
            redirectTo: `${APP_CONFIG.SITE_URL}${ROUTES.AUTH_CALLBACK}`,
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


export async function loginWithIdToken(idToken: string): Promise<AuthResult> {
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
        return { success: true }
    }


    return { error: 'Failed to verify user' }
}

export async function sendPasswordResetEmail(email: string): Promise<AuthResult> {
    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${APP_CONFIG.SITE_URL}${ROUTES.AUTH_CALLBACK}?type=recovery`,
    })

    if (error) {
        return { error: getErrorMessage(error) }
    }

    return { success: true }
}

export async function updatePassword(password: string): Promise<AuthResult> {
    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({
        password,
    })

    if (error) {
        return { error: getErrorMessage(error) }
    }

    return { success: true }
}

