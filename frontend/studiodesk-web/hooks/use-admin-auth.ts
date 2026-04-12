'use client'

import useSWR from 'swr'
import { getAdminMe, adminLogout, AdminRecord } from '@/lib/admin-api'

export function useAdminAuth() {
  const { data, error, isLoading, mutate } = useSWR<AdminRecord>(
    '/api/v1/admin/auth/me',
    () => getAdminMe(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
      onError: () => {
        // If auth fails, data will be null
      },
    }
  )

  const logout = async () => {
    try {
      await adminLogout()
    } finally {
      mutate(undefined, false)
      window.location.href = '/admin/login'
    }
  }

  return {
    admin: data || null,
    isLoading,
    isError: !!error,
    logout,
    mutate,
    isAuthenticated: !!data,
    isSuperAdmin: data?.role === 'super_admin',
  }
}
