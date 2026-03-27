"use client"

import { MetricCard } from "../shared/MetricCard"
import { ChartCard } from "../shared/ChartCard"
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend 
} from "recharts"
import { Camera, ShieldCheck, Banknote, Briefcase } from "lucide-react"

const payoutData = [
  { name: "Rahul S.", paid: 45000, pending: 15000 },
  { name: "Vikram P.", paid: 32000, pending: 0 },
  { name: "Neha K.", paid: 28000, pending: 12000 },
  { name: "Arjun M.", paid: 15000, pending: 25000 },
]

const shootsData = [
  { name: "Rahul S.", count: 18 },
  { name: "Vikram P.", count: 14 },
  { name: "Neha K.", count: 12 },
  { name: "Arjun M.", count: 8 },
]

const roleData = [
  { name: "Photographer", value: 6, color: "#3b82f6" },
  { name: "Videographer", value: 4, color: "#f59e0b" },
  { name: "Drone", value: 2, color: "#10b981" },
  { name: "Editor", value: 3, color: "#8b5cf6" },
]

export function TeamAnalytics() {
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      
      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Covered Shoots" value="48" subtext="across 15 active members" delta={12} icon={Camera} />
        <MetricCard label="Most Active" value="Rahul S." subtext="18 shoots assigned" icon={ShieldCheck} />
        <MetricCard label="Total Payouts Done" value="₹1.2L" subtext="₹52K pending clearance" delta={-4} icon={Banknote} color="green" />
        <MetricCard label="Avg Per/Shoot Fee" value="₹3,500" subtext="blended rate across roles" icon={Briefcase} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <ChartCard title="Shoot Volumes by Member" subtitle="Identify the most heavily utilized freelancers systematically.">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={shootsData} layout="vertical" margin={{ top: 0, right: 30, left: -20, bottom: 0 }}>
               <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
               <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
               <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--foreground))", fontWeight: 500 }} dx={-10} />
               <Tooltip 
                  cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                  contentStyle={{ backgroundColor: "hsl(var(--popover))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
               />
               <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
             </BarChart>
           </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Freelancer Payout Status" subtitle="Native mapping of paid balances against pending TDS outputs.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={payoutData} layout="vertical" margin={{ top: 0, right: 30, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `₹${v/1000}k`} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} dx={-10} />
              <Tooltip 
                cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                contentStyle={{ backgroundColor: "hsl(var(--popover))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="paid" name="Paid Out" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={20} />
              <Bar dataKey="pending" name="Pending" stackId="a" fill="#f59e0b" opacity={0.6} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Role Distribution */}
        <ChartCard title="Team Role Distribution" subtitle="Internal breakdown of studio capacities.">
           <ResponsiveContainer width="100%" height="100%">
             <PieChart>
               <Pie data={roleData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                 {roleData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
               </Pie>
               <Tooltip 
                  contentStyle={{ backgroundColor: "hsl(var(--popover))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
               />
             </PieChart>
           </ResponsiveContainer>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
              {roleData.map(p => (
                 <div key={p.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.name} ({p.value})
                 </div>
              ))}
           </div>
        </ChartCard>

      </div>
    </div>
  )
}
