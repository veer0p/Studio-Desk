"use client"

import useSWR from "swr"
import { fetchDashboardOverview } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { IndianRupee, CalendarCheck, Clock, UserPlus } from "lucide-react"

const formatMoney = (value: unknown) => `Rs ${Number(value ?? 0).toLocaleString("en-IN")}`

export default function QuickStats() {
  const { data, isLoading } = useSWR("/api/v1/dashboard/overview", fetchDashboardOverview, {
    dedupingInterval: 60000,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="w-full h-[90px] rounded-md" />
        ))}
      </div>
    )
  }

  const summary = data?.this_month

  return (
    <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
      <div className="bg-card border border-border/60 rounded-md p-4 relative flex flex-col justify-center">
        <IndianRupee className="absolute top-4 right-4 w-4 h-4 text-muted-foreground opacity-50" />
        <h3 className="text-xl font-mono tracking-widest">{formatMoney(summary?.revenue_collected)}</h3>
        <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider">Revenue collected this month</p>
      </div>

      <div className="bg-card border border-border/60 rounded-md p-4 relative flex flex-col justify-center">
        <CalendarCheck className="absolute top-4 right-4 w-4 h-4 text-muted-foreground opacity-50" />
        <h3 className="text-xl font-mono tracking-widest">{Number(summary?.total_bookings ?? 0)}</h3>
        <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider">Bookings in the current period</p>
      </div>

      <div className="bg-card border border-border/60 rounded-md p-4 relative flex flex-col justify-center">
        <Clock className="absolute top-4 right-4 w-4 h-4 text-muted-foreground opacity-50" />
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-foreground rounded-sm" />
          <h3 className="text-xl font-mono tracking-widest text-foreground">
            {formatMoney(summary?.revenue_pending)}
          </h3>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider">Outstanding amount still pending</p>
      </div>

      <div className="bg-card border border-border/60 rounded-md p-4 relative flex flex-col justify-center">
        <UserPlus className="absolute top-4 right-4 w-4 h-4 text-muted-foreground opacity-50" />
        <h3 className="text-xl font-mono tracking-widest">{Number(summary?.new_leads ?? 0)}</h3>
        <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider">New leads added this month</p>
      </div>
    </div>
  )
}
