import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()
    const headerList = await headers()

    // Check if we are on a secure connection
    const isSecure = headerList.get('x-forwarded-proto') === 'https' || 
                    process.env.NODE_ENV === 'production'

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            const isAuthCookie = name.startsWith('sb-') || name.includes('auth-token');
                            const cookieOptions = {
                                ...options,
                                // 🔥 Consistency is key: Sync with middleware and callback
                                secure: isSecure ?? false,
                                httpOnly: !isAuthCookie,
                                path: '/',
                                sameSite: 'lax' as const,
                            }
                            cookieStore.set(name, value, cookieOptions)
                        })
                    } catch {
                        // Server Component - cookies can't be set
                    }
                },
            },
        }
    )
}
