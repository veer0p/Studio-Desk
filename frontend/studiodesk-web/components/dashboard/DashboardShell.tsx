"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ROUTES } from "@/lib/constants/routes"

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    // Prefetch key routes to make navigation feel instant
    const routes = [ROUTES.BOOKINGS, ROUTES.CLIENTS, ROUTES.FINANCE, ROUTES.TEAM]
    routes.forEach(route => router.prefetch(route))
  }, [router])

  return (
    <div className="w-full h-full p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
      {children}
    </div>
  )
}
