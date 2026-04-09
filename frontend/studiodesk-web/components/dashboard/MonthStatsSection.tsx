"use client"

import useSWR from "swr"
import { fetchDashboardOverview } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

export function MonthStatsSkeleton() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-5 rounded-xl border border-border/60 bg-card space-y-3 shadow-sm">
          <Skeleton className="h-4 w-24 rounded-sm" />
          <Skeleton className="h-8 w-20 rounded-sm" />
          <Skeleton className="h-3 w-32 rounded-sm" />
        </div>
      ))}
    </section>
  )
}

const formatMoneyCompact = (value: unknown) => {
  const num = Number(value ?? 0)
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`
  if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`
  return `₹${num.toLocaleString("en-IN")}`
}

export default function MonthStatsSection() {
  const { data, isLoading } = useSWR("/api/v1/dashboard/overview", fetchDashboardOverview, {
    refreshInterval: 120000,
  })

  if (isLoading) {
    return <MonthStatsSkeleton />
  }

  const month = data?.this_month
  const revenueCollected = Number(month?.revenue_collected ?? 0)
  const revenuePending = Number(month?.revenue_pending ?? 0)
  const totalBookings = Number(month?.total_bookings ?? 0)

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-5 rounded-xl border border-border/60 bg-card shadow-sm flex flex-col justify-between hover:bg-muted/20 transition-colors">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-3">Collected</h2>
        <div className="text-3xl font-bold tabular-nums text-emerald-600 mb-1">{formatMoneyCompact(revenueCollected)}</div>
        <div className="font-mono text-xs text-muted-foreground">
          {month?.is_estimated ? "Estimated (month in progress)" : "Finalized for the month"}
        </div>
      </div>

      <div className="p-5 rounded-xl border border-border/60 bg-card shadow-sm flex flex-col justify-between hover:bg-muted/20 transition-colors">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-3">Pending</h2>
        <div className="text-3xl font-bold tabular-nums text-warning mb-1">{formatMoneyCompact(revenuePending)}</div>
        <div className="font-mono text-xs text-muted-foreground">
          {totalBookings} booking{totalBookings !== 1 ? "s" : ""} this month
        </div>
      </div>

      <div className="p-5 rounded-xl border border-border/60 bg-card shadow-sm flex flex-col justify-between hover:bg-muted/20 transition-colors">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-3">Leads</h2>
        <div className="text-3xl font-bold tabular-nums text-foreground mb-1">{month?.new_leads ?? 0}</div>
        <div className="font-mono text-xs text-muted-foreground">
          New leads this month
        </div>
      </div>
    </section>
  )
}
