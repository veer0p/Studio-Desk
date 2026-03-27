"use client"

import { MetricCard } from "../shared/MetricCard"
import { ChartCard } from "../shared/ChartCard"
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell 
} from "recharts"
import { Image as ImageIcon, Clock, CheckSquare, HardDrive } from "lucide-react"

const deliveryData = [
  { name: "Same Day", count: 8 },
  { name: "1-3 Days", count: 15 },
  { name: "4-7 Days", count: 22 },
  { name: "8-14 Days", count: 18 },
  { name: "15-30 Days", count: 5 },
  { name: "30+ Days", count: 2 },
]

const statusData = [
  { name: "Delivered", value: 65, color: "#10b981" },
  { name: "Selection Pending", value: 15, color: "#f59e0b" },
  { name: "In Review", value: 8, color: "#3b82f6" },
  { name: "Uploading", value: 12, color: "#8b5cf6" },
]

const selectionData = [
  { name: "Wedding", rate: 85 },
  { name: "Pre-Wedding", rate: 92 },
  { name: "Corporate", rate: 45 },
  { name: "Birthday", rate: 58 },
]

export function GalleryAnalytics() {
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      
      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Galleries Dispatched" value="105" subtext="successfully delivered this period" delta={24} icon={ImageIcon} />
        <MetricCard label="Avg Turnaround" value="6.4 Days" subtext="from shoot date to link delivery" delta={-1.2} deltaLabel="acceleration vs last period" icon={Clock} color="green" />
        <MetricCard label="Selection Hit Rate" value="72%" subtext="of clients submit photo arrays" delta={5} icon={CheckSquare} />
        <MetricCard label="Storage Exhaustion" value="450 GB" subtext="running total footprint" icon={HardDrive} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <ChartCard title="Delivery Speed Distribution" subtitle="Turnaround Service Level Agreement (SLA) footprints natively.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deliveryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip 
                cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                contentStyle={{ backgroundColor: "hsl(var(--popover))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Global Gallery Status" subtitle="Real-time macro snapshot formatting distinct limits safely.">
           <ResponsiveContainer width="100%" height="100%">
             <PieChart>
               <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                 {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
               </Pie>
               <Tooltip 
                  contentStyle={{ backgroundColor: "hsl(var(--popover))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
               />
             </PieChart>
           </ResponsiveContainer>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
              {statusData.map(p => (
                 <div key={p.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.name} ({p.value}%)
                 </div>
              ))}
           </div>
        </ChartCard>

        <ChartCard title="Client Review Conversion Rates" subtitle="Which events prompt native selection responses rapidly.">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={selectionData} layout="vertical" margin={{ top: 0, right: 30, left: -20, bottom: 0 }}>
               <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
               <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
               <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--foreground))", fontWeight: 500 }} dx={-10} />
               <Tooltip 
                  cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                  contentStyle={{ backgroundColor: "hsl(var(--popover))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                  formatter={(val: any) => [`${val}%`, "Selection Rate"]}
               />
               <Bar dataKey="rate" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
             </BarChart>
           </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  )
}
