import { NextResponse, type NextRequest } from 'next/server'
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
    '/gallery/.*/public',
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

    // Get session cookie (simple check for middleware speed)
    // Real verification happens in updateSession via @supabase/ssr
    const hasAuthCookie = request.cookies.getAll().some(
        c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
    )

    // 2. Logic: Unauthenticated -> Protected Route
    if (isProtectedRoute && !hasAuthCookie && !isPublicPattern) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 3. Logic: Authenticated -> Auth Route
    if (isAuthRoute && hasAuthCookie) {
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
