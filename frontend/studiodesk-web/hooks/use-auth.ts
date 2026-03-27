'use client'

import useSWR from 'swr'
import { getMe } from '@/lib/auth'

/**
 * hooks/use-auth.ts
 * Custom hook for managing auth state across the application.
 * Uses SWR for caching and automatic revalidation.
 */

interface AuthContext {
    user: {
        id: string;
        email: string;
        user_metadata: {
            full_name?: string;
            avatar_url?: string;
        };
    } | null
    studio: {
        id: string;
        name: string;
        slug: string;
        plan_tier: string;
        onboarding_completed: boolean;
        brand_color?: string;
        logo_url?: string;
    } | null
    member: {
        id: string;
        role: 'owner' | 'admin' | 'editor' | 'viewer';
        display_name: string;
        profile_photo_url?: string;
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
        brandColor: isUnauthorized ? null : studio?.brand_color || '#1A3C5E',
        mutate,
    }
}
