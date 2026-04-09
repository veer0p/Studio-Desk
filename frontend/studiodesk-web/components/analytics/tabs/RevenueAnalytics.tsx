"use client"

import useSWR from "swr"
import { useSearchParams } from "next/navigation"
import { MetricCard } from "../shared/MetricCard"
import { ChartCard } from "../shared/ChartCard"
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell 
} from "recharts"
import { IndianRupee, TrendingUp, AlertCircle, ShoppingCart, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

const timeData = [
  { name: "Apr '25", rev: 150000, exp: 40000 },
  { name: "May '25", rev: 230000, exp: 45000 },
  { name: "Jun '25", rev: 340000, exp: 90000 },
  { name: "Jul '25", rev: 180000, exp: 35000 },
  { name: "Aug '25", rev: 520000, exp: 120000 },
  { name: "Sep '25", rev: 410000, exp: 80000 },
]

const eventData = [
  { name: "Wedding", rev: 1400000, count: 12 },
  { name: "Pre-Wedding", rev: 250000, count: 8 },
  { name: "Corporate", rev: 150000, count: 4 },
  { name: "Birthday", rev: 30000, count: 3 },
]

const paymentData = [
  { name: "UPI", value: 450000, color: "#10b981" },
  { name: "Bank Transfer", value: 1100000, color: "#3b82f6" },
  { name: "Cash", value: 150000, color: "#f59e0b" },
  { name: "Card", value: 130000, color: "#8b5cf6" },
]

// Custom formatter for Compact INR mapping (Laksh & Crores)
const formatINR = (value: number) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`
  return `₹${value}`
}

export function RevenueAnalytics() {
  const searchParams = useSearchParams()
  const period = searchParams.get("period") || "this_month"

  const { data, isLoading, error } = useSWR(`/api/v1/analytics/revenue?period=${period}`, {
    refreshInterval: 300000 // 5 mins
  })

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-md" />)}
        </div>
        <Skeleton className="h-[400px] w-full rounded-md" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] w-full rounded-md" />
          <Skeleton className="h-[300px] w-full rounded-md" />
        </div>
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

  // Use API data; if unavailable, show empty state instead of fake data
  if (!data) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center text-muted-foreground">
        <IndianRupee className="w-12 h-12 mb-4 opacity-30" />
        <p className="font-medium text-foreground mb-1">No revenue data available</p>
        <p className="text-sm">Revenue analytics will appear once bookings and payments are recorded.</p>
      </div>
    )
  }

  const displayData = data
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      
      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Revenue" value={displayData.metrics.totalRevenue} subtext="vs prev period" delta={18} icon={TrendingUp} />
        <MetricCard label="Net Revenue" value={displayData.metrics.netRevenue} subtext="expenses deducted" delta={22} icon={IndianRupee} />
        <MetricCard label="Outstanding Balance" value={displayData.metrics.outstanding} subtext="active invoices" delta={-5} deltaLabel="reduction" icon={AlertCircle} color="amber" />
        <MetricCard label="Avg Booking Value" value={displayData.metrics.avgValue} subtext="all bookings" delta={2} icon={ShoppingCart} />
      </div>

      <div className="space-y-6">
        {/* Full width Line Chart */}
        <ChartCard title="Revenue vs Expenses" subtitle="Financial trajectory over selected period.">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData.timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }} dy={10} />
              <YAxis tickFormatter={formatINR} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }} />
              <Tooltip 
                cursor={{ stroke: "hsl(var(--border))" }}
                contentStyle={{ backgroundColor: "hsl(var(--popover))", borderRadius: "4px", border: "1px solid hsl(var(--border))", fontSize: "10px", fontFamily: "var(--font-mono)" }}
                formatter={(val: any) => [formatINR(val)]}
              />
              <Line type="monotone" dataKey="rev" name="Revenue" stroke="hsl(var(--foreground))" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="exp" name="Expenses" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2 Column Chart Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Revenue by Event Type" subtitle="Total gross attribution by category.">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={displayData.eventData} layout="vertical" margin={{ top: 0, right: 30, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                 <XAxis type="number" tickFormatter={formatINR} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }} />
                 <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }} dx={-10} />
                 <Tooltip 
                    cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                    contentStyle={{ backgroundColor: "hsl(var(--popover))", borderRadius: "4px", border: "1px solid hsl(var(--border))", fontSize: "10px", fontFamily: "var(--font-mono)" }}
                    formatter={(val: any) => [formatINR(val), "Revenue"]}
                 />
                 <Bar dataKey="rev" fill="hsl(var(--foreground))" radius={[0, 2, 2, 0]} barSize={16} />
               </BarChart>
             </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Payment Method Breakdown" subtitle="Distribution of native Indian channels.">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={displayData.paymentData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                   {displayData.paymentData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={`hsl(var(--foreground) / ${1 - index * 0.2})`} strokeWidth={0} />)}
                 </Pie>
                 <Tooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--popover))", borderRadius: "4px", border: "1px solid hsl(var(--border))", fontSize: "10px", fontFamily: "var(--font-mono)" }}
                    formatter={(val: any) => [formatINR(val), "Volume"]}
                 />
               </PieChart>
             </ResponsiveContainer>
             <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                {displayData.paymentData.map((p: any, index: number) => (
                   <div key={p.name} className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                      <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: `hsl(var(--foreground) / ${1 - index * 0.2})` }} />
                      {p.name}
                   </div>
                ))}
             </div>
          </ChartCard>
        </div>

        {/* PnL Table */}
        <div className="bg-card border border-border/60 rounded-md p-5 shadow-sm overflow-hidden">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-[10px] font-mono font-bold tracking-widest uppercase text-foreground">Monthly P&L Ledger</h3>
             <Button variant="outline" size="sm" className="h-8 rounded-sm text-[10px] font-mono font-bold tracking-widest uppercase"><Download className="w-3 h-3 mr-2" /> CSV</Button>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="bg-muted text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest border-y border-border/40">
                 <tr>
                   <th className="px-4 py-3">Month</th>
                   <th className="px-4 py-3 text-right">Revenue</th>
                   <th className="px-4 py-3 text-right">Expenses</th>
                   <th className="px-4 py-3 text-right">Net Income</th>
                   <th className="px-4 py-3 text-right">Bookings</th>
                   <th className="px-4 py-3 text-right">Avg Value</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border/40">
                 {displayData.timeData.map((row: any) => {
                    const bookingCount = row.bookings ?? 0
                    const avgValue = bookingCount > 0 ? Math.round(row.rev / bookingCount) : 0
                    return (
                   <tr key={row.name} className="hover:bg-muted/10 transition-colors">
                     <td className="px-4 py-3 font-mono text-[11px] font-bold">{row.name}</td>
                     <td className="px-4 py-3 text-right font-mono text-[11px] text-foreground">{row.rev.toLocaleString("en-IN")}</td>
                     <td className="px-4 py-3 text-right font-mono text-[11px] text-muted-foreground">{row.exp.toLocaleString("en-IN")}</td>
                     <td className="px-4 py-3 text-right font-mono text-[11px] font-bold">{(row.rev - row.exp).toLocaleString("en-IN")}</td>
                     <td className="px-4 py-3 text-right text-[11px] text-muted-foreground font-mono">{bookingCount || "—"}</td>
                     <td className="px-4 py-3 text-right font-mono text-[11px] text-muted-foreground">{avgValue ? avgValue.toLocaleString("en-IN") : "—"}</td>
                   </tr>
                    )
                 })}
               </tbody>
             </table>
           </div>
        </div>
      </div>

    </div>
  )
}
