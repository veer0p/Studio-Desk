"use client"

import { MetricCard } from "../shared/MetricCard"
import { ChartCard } from "../shared/ChartCard"
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend 
} from "recharts"
import { Users, UserPlus, Repeat, HeartHandshake } from "lucide-react"

const timeData = [
  { name: "Apr", new: 12, repeat: 2 },
  { name: "May", new: 15, repeat: 4 },
  { name: "Jun", new: 8, repeat: 5 },
  { name: "Jul", new: 22, repeat: 8 },
  { name: "Aug", new: 18, repeat: 4 },
  { name: "Sep", new: 25, repeat: 10 },
]

const sourceData = [
  { name: "Instagram", value: 45, color: "#e11d48" },
  { name: "Referral", value: 35, color: "#10b981" },
  { name: "Google", value: 15, color: "#3b82f6" },
  { name: "WedMeGood", value: 5, color: "#8b5cf6" },
]

const topClients = [
  { name: "Priya & Raj", rev: 450000, bookings: 3 },
  { name: "Acme Corp", rev: 320000, bookings: 8 },
  { name: "Neha Sharma", rev: 180000, bookings: 2 },
  { name: "Rohan Gupta", rev: 150000, bookings: 4 },
]

export function ClientAnalytics() {
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      
      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Active Clients" value="128" subtext="across all time natively" delta={14} icon={Users} />
        <MetricCard label="New Acquisitions" value="84" subtext="first-time bookings this period" delta={22} icon={UserPlus} />
        <MetricCard label="Repeat Rate" value="34%" subtext="booked 2 or more shoots" delta={8} icon={Repeat} />
        <MetricCard label="Lifetime Value (LTV)" value="₹1.2L" subtext="avg spend per unique client" delta={5} icon={HeartHandshake} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <ChartCard title="New vs Repeat Dynamics" subtitle="Client acquisition channels resolving monthly overlays.">
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
              <Bar dataKey="new" name="New Clients" stackId="a" fill="#6366f1" radius={[0, 0, 4, 4]} barSize={24} />
              <Bar dataKey="repeat" name="Repeat Clients" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Acquisition Sources" subtitle="Where your clients are finding you.">
           <ResponsiveContainer width="100%" height="100%">
             <PieChart>
               <Pie data={sourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                 {sourceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
               </Pie>
               <Tooltip 
                  contentStyle={{ backgroundColor: "hsl(var(--popover))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
               />
             </PieChart>
           </ResponsiveContainer>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
              {sourceData.map(p => (
                 <div key={p.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.name} ({p.value}%)
                 </div>
              ))}
           </div>
        </ChartCard>

        <ChartCard title="Top Clients by Spend" subtitle="VIP ledger tracking lifetime attribution totals.">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={topClients} layout="vertical" margin={{ top: 0, right: 30, left: -30, bottom: 0 }}>
               <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
               <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
               <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--foreground))", fontWeight: 500 }} dx={-10} />
               <Tooltip 
                  cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                  contentStyle={{ backgroundColor: "hsl(var(--popover))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                  formatter={(val: any) => [`₹${(val / 100000).toFixed(1)}L`, "Revenue"]}
               />
               <Bar dataKey="rev" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
             </BarChart>
           </ResponsiveContainer>
        </ChartCard>

        <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm overflow-hidden flex flex-col justify-center items-center text-center">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
            <HeartHandshake className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="font-semibold tracking-tight text-foreground">Referral Tree Tracking</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mb-6">
            Identifies clients who bring in the most additional business. "Priya & Raj" generated 4 secondary referrals outputting ₹8.5L in downstream revenue.
          </p>
          <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">View Full Tree →</button>
        </div>

      </div>
    </div>
  )
}
