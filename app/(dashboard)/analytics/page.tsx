import { Suspense } from "react";
import { RevenueChart } from "@/components/analytics/RevenueChart";
import { BookingFunnelChart } from "@/components/analytics/BookingFunnelChart";
import { EventTypeChart } from "@/components/analytics/EventTypeChart";
import { KPICard } from "@/components/analytics/KPICard";
import { TopClientsTable } from "@/components/analytics/TopClientsTable";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Download, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function ChartSkeleton() {
  return <Skeleton className="h-[300px] w-full rounded-xl" />;
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map(i => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Business Intelligence</h1>
          <p className="text-sm font-medium text-slate-500">Track your studio's performance and growth</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="12m">
            <SelectTrigger className="w-[140px] h-11 rounded-xl bg-white border-slate-200 font-bold">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="12m">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-11 px-4 rounded-xl border-slate-200 font-bold gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Row 1 - KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          label="Total Revenue" 
          value={1245000} 
          format="inr" 
          trend={12.5} 
          trendPeriod="last month"
          icon={DollarSign}
          color="blue"
        />
        <KPICard 
          label="Collected" 
          value={850000} 
          format="inr" 
          trend={8.2} 
          trendPeriod="last month"
          icon={TrendingUp}
          color="emerald"
        />
        <KPICard 
          label="Average Booking" 
          value={85000} 
          format="inr" 
          trend={-2.4} 
          trendPeriod="last month"
          icon={Calendar}
          color="amber"
        />
        <KPICard 
          label="Total Clients" 
          value={142} 
          format="number" 
          trend={18} 
          trendPeriod="last month"
          icon={Users}
          color="purple"
        />
      </div>

      {/* Row 2 - Revenue Chart */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Revenue Trends</h3>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Collected</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending</span>
             </div>
          </div>
        </div>
        <Suspense fallback={<ChartSkeleton />}>
          <RevenueChart period="12m" />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Row 3 - Funnel */}
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Lead Funnel</h3>
            <Suspense fallback={<ChartSkeleton />}>
              <BookingFunnelChart />
            </Suspense>
         </div>

         {/* Row 4 - Event Types */}
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Project Distribution</h3>
            <Suspense fallback={<ChartSkeleton />}>
              <EventTypeChart />
            </Suspense>
         </div>
      </div>

      {/* Row 5 - Top Clients */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
         <h3 className="text-lg font-black text-slate-900 tracking-tight">Top Performance Clients</h3>
         <Suspense fallback={<TableSkeleton />}>
            <TopClientsTable />
         </Suspense>
      </div>
    </div>
  );
}

