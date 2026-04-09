"use client"

import useSWR from "swr"
import { fetchDashboardOverview } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

export function GreetingSkeleton() {
  return (
    <div className="flex flex-row justify-between items-center gap-4 w-full">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-32 rounded-sm" />
      </div>
      <Skeleton className="h-6 w-24 hidden sm:block rounded-sm" />
    </div>
  )
}

const GREETING_MAP: Record<string, string> = {
  morning: "Good morning",
  afternoon: "Good afternoon",
  evening: "Good evening",
}

export default function GreetingSection() {
  const { data, isLoading } = useSWR("/api/v1/dashboard/overview", fetchDashboardOverview, {
    dedupingInterval: 60000,
  })

  const greetingKey = data?.greeting?.time_of_day ?? "morning"
  const greeting = GREETING_MAP[greetingKey] ?? "Good morning"
  const userName = data?.greeting?.name ?? "Studio"
  const dateStr = data?.greeting?.date ?? ""

  if (isLoading) {
    return <GreetingSkeleton />
  }

  return (
    <div className="flex items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold tracking-tight">
          {greeting}, {userName}
        </h1>
        <span className="hidden md:block w-px h-5 bg-border/50" />
        <p className="hidden md:block font-mono text-muted-foreground text-xs mt-0.5">
          {dateStr}
        </p>
      </div>
      <div className="hidden sm:flex border border-border/60 rounded-sm px-2.5 py-1 items-center bg-muted/10">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
          Studio Plan
        </span>
      </div>
    </div>
  )
}
