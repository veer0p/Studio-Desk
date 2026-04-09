"use client"

import useSWR from "swr"
import { useSearchParams } from "next/navigation"
import { MetricCard } from "../shared/MetricCard"
import { ChartCard } from "../shared/ChartCard"
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts"
import { IndianRupee, TrendingUp, AlertCircle, ShoppingCart } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const formatINR = (value: number) => {
  if (!value) return "₹0"
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`
  return `₹${value}`
}

export function RevenueAnalytics() {
  const searchParams = useSearchParams()
  const period = searchParams.get("period") || "this_month"

  const months = (() => {
    switch (period) {
      case "this_month":
      case "last_month": return 3
      case "this_quarter":
      case "last_quarter": return 3
      case "last_12": return 12
      case "this_fy":
      case "last_fy": return 12
      default: return 3
    }
  })()

  const { data, isLoading, error } = useSWR(`/api/v1/analytics/revenue?months=${months}`, {
    refreshInterval: 300000
  })

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-md" />)}
        </div>
        <Skeleton className="h-[400px] w-full rounded-md" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Failed to load revenue data</p>
        <p className="text-sm">{error.message || "Please try again later."}</p>
      </div>
    )
  }

  const totalCollected = data?.total_collected ?? 0
  const totalPending = data?.total_pending ?? 0
  const totalOverdue = data?.chart_data?.reduce((s: number, r: any) => s + (r.overdue ?? 0), 0) ?? 0
  const growthPct = data?.growth_pct ?? 0
  const chartData = data?.chart_data ?? []
  const totalBookings = chartData.reduce((s: number, r: any) => s + (r.booking_count ?? 0), 0)
  const avgValue = totalBookings > 0 ? Math.round(totalCollected / totalBookings) : 0

  const lineChartData = chartData.map((row: any) => ({
    name: row.month ?? "—",
    rev: row.collected ?? 0,
    exp: row.overdue ?? 0,
    bookings: row.booking_count ?? 0,
  }))

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">

      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Revenue"
          value={formatINR(totalCollected)}
          subtext="collected this period"
          delta={growthPct}
          icon={TrendingUp}
        />
        <MetricCard
          label="Pending"
          value={formatINR(totalPending)}
          subtext="awaiting payment"
          delta={0}
          icon={IndianRupee}
        />
        <MetricCard
          label="Outstanding"
          value={formatINR(totalOverdue)}
          subtext="overdue invoices"
          delta={0}
          deltaLabel="overdue"
          icon={AlertCircle}
          color="amber"
        />
        <MetricCard
          label="Avg Booking Value"
          value={formatINR(avgValue)}
          subtext={`${totalBookings} bookings`}
          delta={0}
          icon={ShoppingCart}
        />
      </div>

      {/* Revenue vs Expenses Chart */}
      {lineChartData.length > 0 ? (
        <ChartCard title="Revenue vs Overdue" subtitle="Monthly financial overview.">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }} dy={10} />
              <YAxis tickFormatter={formatINR} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }} />
              <Tooltip
                cursor={{ stroke: "hsl(var(--border))" }}
                contentStyle={{ backgroundColor: "hsl(var(--popover))", borderRadius: "4px", border: "1px solid hsl(var(--border))", fontSize: "10px", fontFamily: "var(--font-mono)" }}
                formatter={(val: any) => [formatINR(val)]}
              />
              <Line type="monotone" dataKey="rev" name="Revenue" stroke="hsl(var(--foreground))" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="exp" name="Overdue" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      ) : (
        <div className="p-12 flex flex-col items-center justify-center text-center text-muted-foreground bg-card border border-border/40 rounded-md">
          <IndianRupee className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-medium text-foreground mb-1">No revenue data yet</p>
          <p className="text-sm">Charts will appear once payments are recorded.</p>
        </div>
      )}

    </div>
  )
}
