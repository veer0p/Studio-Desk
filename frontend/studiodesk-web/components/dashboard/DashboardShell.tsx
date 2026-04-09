"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    // Prefetch key routes to make navigation feel instant
    const routes = ["/bookings", "/clients", "/finance", "/team"]
    routes.forEach(route => router.prefetch(route))
  }, [router])

  return (
    <div className="w-full h-full p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
      {children}
    </div>
  )
}
