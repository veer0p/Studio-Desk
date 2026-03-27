import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { Response as ApiResponse } from '@/lib/response'
import { AuthService } from '@/lib/services/auth.service'
import { logError } from '@/lib/logger'
import { env } from '@/lib/env'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    let response = NextResponse.json({ data: null, error: null })

    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const result = await AuthService.login(supabase, body)
    
    // Create the final success response
    const finalResponse = ApiResponse.ok(result)
    
    // Copy cookies from our temporary response object to the final one
    response.cookies.getAll().forEach(cookie => {
      finalResponse.cookies.set(cookie.name, cookie.value)
    })
    
    return finalResponse
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return ApiResponse.error(err.errors[0]?.message || 'Validation failed', 'VALIDATION_ERROR', 400)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error(err.message || 'Invalid credentials', err.code || 'AUTH_ERROR', 401)
  }
}


