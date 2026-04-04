import { createClient } from './supabase/client'

/**
 * lib/auth.ts
 * Client-side auth utilities using @supabase/ssr.
 * All API calls follow the project structure /api/v1/auth/*
 */

export async function signIn(email: string, password: string) {
    console.log('[Auth] Attempting login for:', email)
    const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
    })

    let data: any = {}
    const text = await res.text()
    try {
        data = JSON.parse(text)
    } catch {
        console.error('[Auth] Failed to parse JSON response:', text)
        data = { error: text || 'Internal server error' }
    }

    console.log('[Auth] Login response status:', res.status, data)

    if (!res.ok) {
        throw new Error(data.error || 'Invalid email or password')
    }

    return data.data // { user, studio, member }
}

export async function signUp(email: string, password: string, fullName: string, studioName: string, studioSlug: string) {
    console.log('[Auth] Attempting signup for:', email, studioName)
    const res = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, studioName, studioSlug }),
        credentials: 'include',
    })

    let data: any = {}
    const text = await res.text()
    try {
        data = JSON.parse(text)
    } catch {
        console.error('[Auth] Failed to parse JSON response:', text)
        data = { error: text || 'Internal server error' }
    }

    console.log('[Auth] Signup response status:', res.status, data)

    if (!res.ok) {
        // Attach status so the component can detect 409 conflicts
        const err = new Error(data.error || 'Signup failed') as Error & { status: number }
        err.status = res.status
        throw err
    }

    return data.data // { user, studio }
}

export async function signOut() {
    // Only call our proxy logout. It handles both clearing server session (via cookies)
    // and correctly notifying Supabase server-side if needed.
    await fetch('/api/v1/auth/logout', { method: 'POST' })
    window.location.href = '/login'
}

export async function getMe() {
    const res = await fetch('/api/v1/auth/me', {
        credentials: 'include',
    })
    const data = await res.json()

    if (!res.ok) {
        throw new Error(data.error || 'Unauthorized')
    }

    return data.data // { user, studio, member }
}

export async function forgotPassword(email: string) {
    const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
    })

    if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send reset link')
    }
}

export async function resetPassword(password: string) {
    const res = await fetch('/api/v1/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include',
    })

    if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update password')
    }
}
