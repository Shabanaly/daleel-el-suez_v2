import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ratelimit, getIP } from './lib/ratelimit'


export async function proxy(request: NextRequest) {
    const supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        const isAuthCookie = name.startsWith('sb-') || name.includes('auth-token');

                        // 🔥 Ensure client-side accessibility for auth tokens
                        const cookieOptions = {
                            ...options,
                            secure: request.nextUrl.protocol === 'https:',
                            httpOnly: !isAuthCookie,
                            path: '/',
                            sameSite: 'lax' as const,
                        }

                        request.cookies.set(name, value)
                        supabaseResponse.cookies.set(name, value, cookieOptions)
                    })
                },
            },
        }
    )

    // IMPORTANT: Avoid network calls on non-authenticated paths? 
    // Not really possible with SSR session sync, but we use getUser() for safety.
    const { data: { user } } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    // 🛡️ Rate Limiting Logic
    if (pathname.startsWith('/api/') || pathname === '/signup' || pathname === '/login') {
        if (ratelimit) {
            const ip = getIP(request.headers)
            const { success, limit, reset, remaining } = await ratelimit.limit(`ratelimit_${ip}`)
            
            if (!success) {
                return new NextResponse('Too Many Requests', {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': limit.toString(),
                        'X-RateLimit-Remaining': remaining.toString(),
                        'X-RateLimit-Reset': reset.toString(),
                    },
                })
            }
        }
    }

    const isAuthPage = pathname === '/login' || pathname === '/signup'

    // Define routes that require authentication
    const isProtectedRoute = pathname.startsWith('/places/add') || pathname.endsWith('/edit') || pathname.startsWith('/profile') || pathname.startsWith('/dashboard') || pathname.startsWith('/settings');

    // Redirect unauthenticated users trying to access protected routes
    if (!user && isProtectedRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
    }

    // Redirect authenticated users trying to access auth pages (login/signup)
    if (user && isAuthPage) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        url.searchParams.set('t', Date.now().toString())

        const redirectResponse = NextResponse.redirect(url)

        // Sync cookies to the redirect
        supabaseResponse.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
        })

        return redirectResponse
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|auth/callback|favicon.ico|ads.txt|manifest.json|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
}
