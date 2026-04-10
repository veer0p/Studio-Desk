"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

type PortalUser = {
  token: string
  studioSlug: string
  clientName?: string
  bookingId?: string
}

type PortalAuthContext = {
  user: PortalUser | null
  isLoading: boolean
  logout: () => void
}

const PortalAuthContext = createContext<PortalAuthContext>({
  user: null,
  isLoading: true,
  logout: () => {},
})

export function PortalAuthProvider({
  children,
  studioSlug,
}: {
  children: React.ReactNode
  studioSlug: string
}) {
  const [user, setUser] = useState<PortalUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = sessionStorage.getItem(`portal_token_${studioSlug}`)
    if (!token) {
      setIsLoading(false)
      router.replace(`/portal/${studioSlug}/login`)
      return
    }

    // Validate token by hitting portal API
    fetch(`/api/v1/portal/${token}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          sessionStorage.removeItem(`portal_token_${studioSlug}`)
          router.replace(`/portal/${studioSlug}/login`)
          return null
        }
        const payload = await res.json()
        const portalUser: PortalUser = {
          token,
          studioSlug,
          clientName: payload?.data?.client?.full_name,
          bookingId: payload?.data?.booking?.id,
        }
        setUser(portalUser)
        return null
      })
      .catch(() => {
        sessionStorage.removeItem(`portal_token_${studioSlug}`)
        router.replace(`/portal/${studioSlug}/login`)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [studioSlug, router])

  const logout = useCallback(() => {
    sessionStorage.removeItem(`portal_token_${studioSlug}`)
    setUser(null)
    router.push(`/portal/${studioSlug}/login`)
  }, [studioSlug, router])

  return (
    <PortalAuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </PortalAuthContext.Provider>
  )
}

export function usePortalAuth() {
  return useContext(PortalAuthContext)
}
