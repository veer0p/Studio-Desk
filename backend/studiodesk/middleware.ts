import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/lib/env'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  let user = null
  try {
    const { data, error: authError } = await supabase.auth.getUser()
    if (!authError) {
      user = data?.user
    } else {
      console.error('Auth error in middleware:', authError)
    }
  } catch (err) {
    console.error('Unexpected error in middleware auth check:', err)
  }

  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')

  // Public exceptions (no auth needed)
  const isPublicRoute =
    request.nextUrl.pathname.startsWith('/api/v1/webhooks') ||
    /\/api\/v1\/gallery\/.*\/lookup/.test(request.nextUrl.pathname) ||
    request.nextUrl.pathname.startsWith('/api/v1/inquiry') ||
    request.nextUrl.pathname.startsWith('/api/v1/portal') ||
    request.nextUrl.pathname.startsWith('/api/v1/auth')

  if (!user && !isPublicRoute) {
    if (isApiRoute) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    if (isDashboardRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
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
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
