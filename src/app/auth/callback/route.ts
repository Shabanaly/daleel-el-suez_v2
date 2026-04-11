import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
    const url = new URL(request.url)
    const host = request.headers.get('host') ?? url.host
    const protocol = request.headers.get('x-forwarded-proto') === 'https' ? 'https' : (url.protocol.replace(':', '') || 'http')
    const origin = `${protocol}://${host}`
    
    const { searchParams } = url
    const code = searchParams.get('code')
    const type = searchParams.get('type')
    let next = searchParams.get('next') ?? '/'

    if (type === 'recovery') {
        next = '/reset-password'
    }

    // 🛡️ SECURITY: Prevent Open Redirect vulnerability
    // If 'next' is an absolute URL and doesn't match our origin, reset it to '/'
    if (next.startsWith('http://') || next.startsWith('https://') || next.startsWith('//')) {
        try {
            const nextUrl = new URL(next)
            if (nextUrl.origin !== origin) {
                console.warn(`[AUTH] Blocked potential open redirect to: ${next}`)
                next = '/'
            }
        } catch {
            next = '/'
        }
    }

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, {
                                ...options,
                                secure: new URL(origin).protocol === 'https:',
                            })
                        })
                    },
                },
            }
        )

        // 1. Perform exchange
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data && data.user) {
            const user = data.user;
            // 1.5 Ensure profile exists (OAuth first-time login)
            // Use Admin client to bypass RLS for background profile sync
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
                console.error('[AUTH] Callback Profile Sync Error:', profileError)
            }

            const redirectUrl = new URL(next, origin)
            redirectUrl.searchParams.set('t', Date.now().toString())

            const response = NextResponse.redirect(redirectUrl.toString())

            // 2. Explicitly transfer cookies from the store to the redirect response
            cookieStore.getAll().forEach((cookie) => {
                // Determine if it's a Supabase auth cookie
                const isSupabaseCookie = cookie.name.startsWith('sb-') ||
                    cookie.name.includes('auth-token');

                response.cookies.set({
                    name: cookie.name,
                    value: cookie.value,
                    path: '/',
                    sameSite: 'lax',
                    secure: new URL(origin).protocol === 'https:',
                    // 🔥 CRITICAL: Auth cookies MUST be accessible to Client JS (httpOnly: false)
                    // otherwise the browser-side Supabase client won't see the session.
                    httpOnly: !isSupabaseCookie,
                })
            })

            revalidatePath('/', 'layout')
            return response
        }

        if (error) {
            console.error('Auth callback error:', error.message)
        }
    }

    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed&t=${Date.now()}`)
}
