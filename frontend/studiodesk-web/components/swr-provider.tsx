"use client"

import * as React from "react"
import { SWRConfig } from "swr"
import { ROUTES } from "@/lib/constants/routes"

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      fetcher: (url: string) => fetch(url).then(res => {
        if (!res.ok) {
          const error = new Error('An error occurred while fetching the data.') as Error & { status?: number }
          error.status = res.status
          throw error
        }
        return res.json().then(payload => payload.data || payload)
      }),
      onError: (error) => {
        if (error.status === 401) {
          if (typeof window !== "undefined") {
            window.location.href = ROUTES.LOGIN
          }
        }
      }
    }}>
      {children}
    </SWRConfig>
  )
}
