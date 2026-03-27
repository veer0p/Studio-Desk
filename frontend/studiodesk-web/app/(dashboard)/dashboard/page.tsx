import DashboardShell from "@/components/dashboard/DashboardShell"
import TodayStrip from "@/components/dashboard/TodayStrip"
import QuickStats from "@/components/dashboard/QuickStats"
import BookingPipeline from "@/components/dashboard/BookingPipeline"
import PendingActions from "@/components/dashboard/PendingActions"
import UpcomingEvents from "@/components/dashboard/UpcomingEvents"
import RecentActivity from "@/components/dashboard/RecentActivity"

export const metadata = {
  title: "Dashboard | StudioDesk",
  description: "Daily Ops Dashboard",
}

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <TodayStrip />
        
        {/* Mobile: Flex col with explicit order. Desktop: 3-column Grid. */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
          
          {/* Left Column wrapper (Desktop) */}
          <div className="contents lg:block lg:col-span-2 lg:space-y-6">
            <div className="order-4 flex-none"><BookingPipeline /></div>
            <div className="order-5 flex-none"><UpcomingEvents /></div>
          </div>
          
          {/* Right Column wrapper (Desktop) */}
          <div className="contents lg:block lg:col-span-1 lg:space-y-6">
            <div className="order-1 flex-none"><QuickStats /></div>
            <div className="order-2 flex-none"><PendingActions /></div>
            <div className="order-6 flex-none"><RecentActivity /></div>
          </div>

        </div>
      </div>
    </DashboardShell>
  )
}
