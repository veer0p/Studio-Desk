import { getDashboardStats, getPendingActions } from "@/lib/dashboard-server";
import { StatCard } from "./StatCard";
import { CircleDollarSign, Users, Calendar as CalendarIcon, Receipt } from "lucide-react";

export async function StatCardsWrapper({ studioId }: { studioId: string }) {
  const stats = await getDashboardStats(studioId);
  const pending = await getPendingActions(studioId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        label="Total Revenue" 
        value={`₹${(stats.revenue || 0).toLocaleString('en-IN')}`}
        description={`Current month`}
        icon={CircleDollarSign}
        trend={{ value: 12, isUp: true }}
      />
      <StatCard 
        label="Bookings" 
        value={stats.bookings || 0}
        description="This month"
        icon={CalendarIcon}
        trend={{ value: 5, isUp: true }}
      />
      <StatCard 
        label="Pending Actions" 
        value={pending.unsignedContracts + pending.overdueInvoices}
        description={`${pending.unsignedContracts} docs, ${pending.overdueInvoices} invoices`}
        icon={Users}
      />
      <StatCard 
        label="Unread Messages" 
        value={pending.unreadMessages}
        description="New client inquiries"
        icon={Receipt}
      />
    </div>
  );
}
