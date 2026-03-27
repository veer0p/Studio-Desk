"use client"

import useSWR from "swr"
import { fetcher } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { IndianRupee, CalendarCheck, Clock, ImageIcon } from "lucide-react"

export default function QuickStats() {
  const { data, isLoading } = useSWR("/api/v1/dashboard/summary", fetcher, { dedupingInterval: 60000 })

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="w-full h[90px] rounded-lg" />
        ))}
      </div>
    )
  }

  // Fallbacks if data empty
  const stats = data || {
    revenue: { value: "₹0", sub: "vs last month", trend: "up" },
    bookings: { count: 0, pending: 0, confirmed: 0 },
    payments: { pendingAmount: "₹0", invoices: 0 },
    deliveries: { count: 0, overdue: 0 }
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
      {/* Revenue */}
      <div className="bg-card border border-border/60 rounded-lg p-4 relative flex flex-col justify-center">
        <IndianRupee className="absolute top-4 right-4 w-5 h-5 text-muted-foreground opacity-50" />
        <h3 className="text-2xl font-bold">{stats.revenue.value}</h3>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          {stats.revenue.trend === "up" ? (
            <span className="text-emerald-500">↑</span>
          ) : (
            <span className="text-rose-500">↓</span>
          )}
          {stats.revenue.sub}
        </p>
      </div>

      {/* Bookings */}
      <div className="bg-card border border-border/60 rounded-lg p-4 relative flex flex-col justify-center">
        <CalendarCheck className="absolute top-4 right-4 w-5 h-5 text-muted-foreground opacity-50" />
        <h3 className="text-2xl font-bold">{stats.bookings.count}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {stats.bookings.confirmed} confirmed, {stats.bookings.pending} pending
        </p>
      </div>

      {/* Pending Payments */}
      <div className={`bg-card border border-border/60 rounded-lg p-4 relative flex flex-col justify-center ${stats.payments.invoices > 0 ? 'border-amber-500/30 bg-amber-500/5' : ''}`}>
        <Clock className={`absolute top-4 right-4 w-5 h-5 opacity-50 ${stats.payments.invoices > 0 ? "text-amber-500" : "text-muted-foreground"}`} />
        <h3 className={`text-2xl font-bold ${stats.payments.invoices > 0 ? "text-amber-600 dark:text-amber-500" : ""}`}>
          {stats.payments.pendingAmount}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          across {stats.payments.invoices} invoices
        </p>
      </div>

      {/* Deliveries */}
      <div className="bg-card border border-border/60 rounded-lg p-4 relative flex flex-col justify-center">
        <ImageIcon className="absolute top-4 right-4 w-5 h-5 text-muted-foreground opacity-50" />
        <h3 className="text-2xl font-bold">{stats.deliveries.count}</h3>
        <p className={`text-xs mt-1 ${stats.deliveries.overdue > 0 ? "text-rose-500 font-medium" : "text-muted-foreground"}`}>
          {stats.deliveries.overdue > 0 ? `${stats.deliveries.overdue} overdue` : "All on track"}
        </p>
      </div>
    </div>
  )
}
