"use client"

import { MetricCard } from "../shared/MetricCard"
import { ChartCard } from "../shared/ChartCard"
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell 
} from "recharts"
import { IndianRupee, TrendingUp, AlertCircle, ShoppingCart, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      
      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Revenue" value="₹18.3L" subtext="vs ₹15.2L last period" delta={18} icon={TrendingUp} />
        <MetricCard label="Net Revenue" value="₹14.2L" subtext="₹4.1L expenses deducted" delta={22} icon={IndianRupee} />
        <MetricCard label="Outstanding Balance" value="₹1.2L" subtext="across 4 active invoices" delta={-5} deltaLabel="reduction vs last period" icon={AlertCircle} color="amber" />
        <MetricCard label="Avg Booking Value" value="₹65.4K" subtext="across 28 total bookings" delta={2} icon={ShoppingCart} />
      </div>

      <div className="space-y-6">
        {/* Full width Line Chart */}
        <ChartCard title="Revenue vs Expenses" subtitle="Financial trajectory over selected period.">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
              <YAxis tickFormatter={formatINR} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip 
                cursor={{ stroke: "hsl(var(--border))" }}
                contentStyle={{ backgroundColor: "hsl(var(--popover))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                formatter={(val: any) => [formatINR(val)]}
              />
              <Line type="monotone" dataKey="rev" name="Revenue" stroke="#6366f1" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="exp" name="Expenses" stroke="#f43f5e" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2 Column Chart Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Revenue by Event Type" subtitle="Total gross attribution by category.">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={eventData} layout="vertical" margin={{ top: 0, right: 30, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                 <XAxis type="number" tickFormatter={formatINR} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                 <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dx={-10} />
                 <Tooltip 
                    cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                    contentStyle={{ backgroundColor: "hsl(var(--popover))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                    formatter={(val: any) => [formatINR(val), "Revenue"]}
                 />
                 <Bar dataKey="rev" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
               </BarChart>
             </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Payment Method Breakdown" subtitle="Distribution of native Indian channels.">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={paymentData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                   {paymentData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                 </Pie>
                 <Tooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--popover))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                    formatter={(val: any) => [formatINR(val), "Volume"]}
                 />
               </PieChart>
             </ResponsiveContainer>
             <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                {paymentData.map(p => (
                   <div key={p.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                      {p.name}
                   </div>
                ))}
             </div>
          </ChartCard>
        </div>

        {/* PnL Table */}
        <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm overflow-hidden">
           <div className="flex items-center justify-between mb-4">
             <h3 className="font-semibold text-foreground tracking-tight">Monthly P&L Ledger</h3>
             <Button variant="outline" size="sm" className="h-8"><Download className="w-3 h-3 mr-2" /> CSV</Button>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider">
                 <tr>
                   <th className="font-medium px-4 py-3">Month</th>
                   <th className="font-medium px-4 py-3 text-right">Revenue</th>
                   <th className="font-medium px-4 py-3 text-right">Expenses</th>
                   <th className="font-medium px-4 py-3 text-right">Net Income</th>
                   <th className="font-medium px-4 py-3 text-right">Bookings</th>
                   <th className="font-medium px-4 py-3 text-right">Avg Value</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border/40">
                 {timeData.map(row => (
                   <tr key={row.name} className="hover:bg-muted/10">
                     <td className="px-4 py-3 font-medium">{row.name}</td>
                     <td className="px-4 py-3 text-right font-mono text-emerald-600">{row.rev.toLocaleString("en-IN")}</td>
                     <td className="px-4 py-3 text-right font-mono text-red-500">{row.exp.toLocaleString("en-IN")}</td>
                     <td className="px-4 py-3 text-right font-mono font-bold">{(row.rev - row.exp).toLocaleString("en-IN")}</td>
                     <td className="px-4 py-3 text-right text-muted-foreground">12</td>
                     <td className="px-4 py-3 text-right font-mono text-muted-foreground">{Math.round((row.rev)/12).toLocaleString("en-IN")}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>

    </div>
  )
}
