"use client"

import { createContext, useContext, useCallback, type ReactNode } from "react"
import useSWR, { mutate } from "swr"
import { type FeatureFlag, fetchFeatureFlags, toggleFeatureFlag } from "@/lib/api"

type FeatureFlagsContextValue = {
  flags: FeatureFlag[]
  isLoading: boolean
  error: Error | null
  toggleFlag: (key: string, isEnabled: boolean) => Promise<void>
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | null>(null)

const FLAGS_KEY = "/api/v1/feature-flags"

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, error } = useSWR<FeatureFlag[]>(
    FLAGS_KEY,
    fetchFeatureFlags,
    {
      dedupingInterval: 60_000,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  const toggleFlag = useCallback(async (key: string, isEnabled: boolean) => {
    // Optimistic update
    await mutate<FeatureFlag[]>(
      FLAGS_KEY,
      (currentFlags) => {
        if (!currentFlags) return currentFlags
        return currentFlags.map((flag) =>
          flag.key === key ? { ...flag, is_enabled: isEnabled } : flag
        )
      },
      false
    )

    try {
      await toggleFeatureFlag(key, isEnabled)
      // Revalidate after successful toggle
      await mutate(FLAGS_KEY)
    } catch (err) {
      // Rollback on error — revalidate to get server state
      await mutate(FLAGS_KEY)
      throw err
    }
  }, [])

  return (
    <FeatureFlagsContext.Provider
      value={{
        flags: data ?? [],
        isLoading,
        error: error instanceof Error ? error : null,
        toggleFlag,
      }}
    >
      {children}
    </FeatureFlagsContext.Provider>
  )
}

export function useFeatureFlagsContext(): FeatureFlagsContextValue {
  const ctx = useContext(FeatureFlagsContext)
  if (!ctx) {
    throw new Error("useFeatureFlagsContext must be used within FeatureFlagsProvider")
  }
  return ctx
}

export function useFeatureFlag(key: string): boolean {
  const { flags } = useFeatureFlagsContext()
  return flags.find((f) => f.key === key)?.is_enabled ?? false
}

export function useFeatureFlags(): FeatureFlag[] {
  const { flags } = useFeatureFlagsContext()
  return flags
}
