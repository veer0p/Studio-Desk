import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';
import { rateLimit } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });


  // 1. ADD SECURITY HEADERS
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;
  const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';

  // 2. RATE LIMITING
  // Protect Auth & Public APIs
  if (
    pathname.startsWith('/api/auth') || 
    pathname.startsWith('/auth/login') ||
    pathname.startsWith('/api/inquiry')
  ) {
    const isAllowed = await rateLimit(`ratelimit_${ip}_${pathname}`, 10, 60);
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' },
        { status: 429 }
      );
    }
  }

  // 3. ROUTE PROTECTION
  const isPublicApiRoute = 
    pathname.startsWith('/api/webhooks/') ||
    (pathname.startsWith('/api/gallery/') && pathname.endsWith('/lookup')) ||
    pathname.startsWith('/api/inquiry/') ||
    pathname.startsWith('/api/portal/');

  // Protect Dashboard routes
  if (pathname.startsWith('/dashboard') && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Onboarding enforcement
  if (user && pathname.startsWith('/dashboard')) {
    const isOnboardingPage = pathname === '/dashboard/onboarding';
    const { data: member } = await supabase
      .from('studio_members')
      .select('studio_id')
      .eq('user_id', user.id)
      .single();

    if (member) {
      const { data: studio } = await supabase
        .from('studios')
        .select('onboarding_completed')
        .eq('id', member.studio_id)
        .single();

      if (studio) {
        if (!studio.onboarding_completed && !isOnboardingPage) {
          return NextResponse.redirect(new URL('/dashboard/onboarding', request.url));
        }
        if (studio.onboarding_completed && isOnboardingPage) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
    }
  }

  // Protect API routes
  if (pathname.startsWith('/api/') && !user && !isPublicApiRoute) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  return response;
}


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
