'use client'

import useSWR from 'swr'
import { getMe } from '@/lib/auth'

/**
 * hooks/use-auth.ts
 * Custom hook for managing auth state across the application.
 * Uses SWR for caching and automatic revalidation.
 */

interface AuthContext {
    user: { id: string; email: string } | null
    studio: {
        id: string;
        name: string;
        slug: string;
        plan_tier: string;
        onboarding_completed: boolean;
    } | null
    member: {
        id: string;
        role: 'owner' | 'admin' | 'editor' | 'viewer';
        display_name: string;
    } | null
}

export function useAuth() {
    const { data, error, isLoading, mutate } = useSWR<AuthContext>(
        '/api/v1/auth/me',
        getMe,
        {
            shouldRetryOnError: false,
            revalidateOnFocus: false,
        }
    )

    const user = data?.user ?? null
    const studio = data?.studio ?? null
    const member = data?.member ?? null

    // 401 Unauthorized handling
    const isUnauthorized = error?.message === 'Unauthorized' || (error && typeof error === 'object' && 'status' in error && error.status === 401)

    return {
        user: isUnauthorized ? null : user,
        studio: isUnauthorized ? null : studio,
        member: isUnauthorized ? null : member,
        isLoading,
        isError: error,
        isOwner: member?.role === 'owner',
        mutate,
    }
}
