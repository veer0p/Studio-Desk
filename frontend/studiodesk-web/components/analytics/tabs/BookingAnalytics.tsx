"use client"

import { MetricCard } from "../shared/MetricCard"
import { ChartCard } from "../shared/ChartCard"
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend 
} from "recharts"
import { CalendarCheck, Percent, XCircle, Clock, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

const timeData = [
  { name: "Apr '25", confirmed: 12, inquiry: 24, cancelled: 2 },
  { name: "May '25", confirmed: 18, inquiry: 28, cancelled: 1 },
  { name: "Jun '25", confirmed: 8, inquiry: 15, cancelled: 4 },
  { name: "Jul '25", confirmed: 22, inquiry: 40, cancelled: 3 },
  { name: "Aug '25", confirmed: 15, inquiry: 20, cancelled: 1 },
]

const funnelData = [
  { stage: "Inquiry", count: 127 },
  { stage: "Proposal Sent", count: 85 },
  { stage: "Confirmed", count: 75 },
  { stage: "Completed", count: 42 }
]

const eventData = [
  { name: "Wedding", value: 45, color: "#cbd5e1" },
  { name: "Pre-Wedding", value: 20, color: "#94a3b8" },
  { name: "Corporate", value: 10, color: "#475569" },
]

export function BookingAnalytics() {
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      
      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Bookings" value="75" subtext="confirmed securely this period" delta={12} icon={CalendarCheck} />
        <MetricCard label="Confirmed Rate" value="59%" subtext="127 total inquiries received" delta={4} icon={Percent} />
        <MetricCard label="Cancellation Rate" value="8.5%" subtext="11 bookings cancelled" delta={-2} deltaLabel="reduction vs last period" icon={XCircle} color="red" />
        <MetricCard label="Avg Lead Time" value="45 Days" subtext="from inquiry creation to event" delta={-5} icon={Clock} />
      </div>

      <div className="space-y-6">
        
        {/* Full width Bookings over Time Chart */}
        <ChartCard title="Booking Volume Trends" subtitle="Stage comparisons monitoring operational throughput.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip 
                cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                contentStyle={{ backgroundColor: "hsl(var(--popover))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="confirmed" name="Confirmed" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} barSize={32} />
              <Bar dataKey="inquiry" name="Inquiry" stackId="a" fill="#3b82f6" opacity={0.5} />
              <Bar dataKey="cancelled" name="Cancelled" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2 Column Chart Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <ChartCard title="Conversion Funnel" subtitle="Pipeline drop-off visualization natively.">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 30, left: -10, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                 <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                 <YAxis type="category" dataKey="stage" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }} dx={-10} />
                 <Tooltip 
                    cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                    contentStyle={{ backgroundColor: "hsl(var(--popover))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                 />
                 <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={28} label={{ position: 'right', fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 600 }} />
               </BarChart>
             </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Event Categorization" subtitle="Booking splits by package architecture.">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={eventData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                   {eventData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                 </Pie>
                 <Tooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--popover))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                 />
               </PieChart>
             </ResponsiveContainer>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                {eventData.map(p => (
                   <div key={p.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                      {p.name} ({p.value})
                   </div>
                ))}
             </div>
          </ChartCard>

        </div>

        {/* Aggregate Data Table */}
        <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm overflow-hidden">
           <div className="flex items-center justify-between mb-4">
             <h3 className="font-semibold text-foreground tracking-tight">Booking Matrix Register</h3>
             <Button variant="outline" size="sm" className="h-8"><Download className="w-3 h-3 mr-2" /> Export</Button>
           </div>
           <div className="overflow-x-auto border border-border/40 rounded-lg">
             <table className="w-full text-sm text-left">
               <thead className="bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider">
                 <tr>
                   <th className="font-medium px-4 py-3 border-b border-border/40">Month</th>
                   <th className="font-medium px-4 py-3 border-b border-border/40 text-right">Inquiries</th>
                   <th className="font-medium px-4 py-3 border-b border-border/40 text-right">Confirmed</th>
                   <th className="font-medium px-4 py-3 border-b border-border/40 text-right">Cancelled</th>
                   <th className="font-medium px-4 py-3 border-b border-border/40 text-right">Conversion</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border/40">
                 {timeData.map(row => {
                    const convRatio = Math.round((row.confirmed / row.inquiry) * 100)
                    return (
                     <tr key={row.name} className="hover:bg-muted/10 transition-colors">
                       <td className="px-4 py-3 font-medium">{row.name}</td>
                       <td className="px-4 py-3 text-right font-mono text-muted-foreground">{row.inquiry}</td>
                       <td className="px-4 py-3 text-right font-mono text-emerald-600 font-bold">{row.confirmed}</td>
                       <td className="px-4 py-3 text-right font-mono text-red-500">{row.cancelled}</td>
                       <td className="px-4 py-3 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${convRatio > 50 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                             {convRatio}%
                          </span>
                       </td>
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
