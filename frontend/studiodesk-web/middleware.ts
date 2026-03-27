import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * middleware.ts
 * Enforces route protection and session refreshing.
 */

// Define route categories
const PROTECTED_ROUTES = [
    '/dashboard',
    '/analytics',
    '/bookings',
    '/clients',
    '/finance',
    '/gallery',
    '/team',
    '/settings',
    '/onboarding'
]

const AUTH_ROUTES = [
    '/login',
    '/signup',
    '/forgot-password'
]

const PUBLIC_PATTERNS = [
    '/portal/',
    '/gallery/p/',
    '/proposals/view/',
    '/contracts/view/',
    '/invoices/view/',
    '/api/v1/webhooks/',
    '/api/v1/inquiry',
    '/api/v1/gallery/.*/lookup'
]

export async function middleware(request: NextRequest) {
    // 1. Refresh Supabase session
    const response = await updateSession(request)
    const { pathname } = request.nextUrl

    // 2. Get user from response headers (updateSession adds it via supabase.auth.getUser())
    // Note: updateSession doesn't explicitly return the user, so we check for the auth cookie
    // but in a more robust way by checking the refreshed state.
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }: { name: string, value: string, options: CookieOptions }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )
    const { data: { user } } = await supabase.auth.getUser()

    // Check if it's a protected route
    const isProtectedRoute = PROTECTED_ROUTES.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    )

    // Check if it's an auth route (login/signup)
    const isAuthRoute = AUTH_ROUTES.some(route =>
        pathname === route || pathname.startsWith(`${route}/`) || pathname === '/auth/reset-password'
    )

    // Check if it's a public pattern (skip protection)
    const isPublicPattern = PUBLIC_PATTERNS.some(pattern => {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'))
        return regex.test(pathname)
    })

    // 3. Logic: Unauthenticated -> Protected Route
    if (isProtectedRoute && !user && !isPublicPattern) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 4. Logic: Authenticated -> Auth Route
    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }


    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public (public files)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
