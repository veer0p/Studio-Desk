import DashboardShell from "@/components/dashboard/DashboardShell"
import TodayStrip from "@/components/dashboard/TodayStrip"
import QuickStats from "@/components/dashboard/QuickStats"
import BookingPipeline from "@/components/dashboard/BookingPipeline"
import PendingActions from "@/components/dashboard/PendingActions"
import UpcomingEvents from "@/components/dashboard/UpcomingEvents"
import RecentActivity from "@/components/dashboard/RecentActivity"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Dashboard | StudioDesk",
  description: "Daily Ops Dashboard",
}

import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <Suspense fallback={<Skeleton className="w-full h-[100px] rounded-md" />}>
          <TodayStrip />
        </Suspense>
        
        {/* Mobile: Flex col with explicit order. Desktop: 3-column Grid. */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
          
          {/* Left Column wrapper (Desktop) */}
          <div className="contents lg:block lg:col-span-2 lg:space-y-6">
            <div className="order-4 flex-none">
              <Suspense fallback={<Skeleton className="w-full h-[300px] rounded-md" />}>
                <BookingPipeline />
              </Suspense>
            </div>
            <div className="order-5 flex-none">
              <Suspense fallback={<Skeleton className="w-full h-[300px] rounded-md" />}>
                <UpcomingEvents />
              </Suspense>
            </div>
          </div>
          
          {/* Right Column wrapper (Desktop) */}
          <div className="contents lg:block lg:col-span-1 lg:space-y-6">
            <div className="order-1 flex-none">
              <Suspense fallback={<Skeleton className="w-full h-[360px] rounded-md" />}>
                <QuickStats />
              </Suspense>
            </div>
            <div className="order-2 flex-none">
              <Suspense fallback={<Skeleton className="w-full h-[240px] rounded-md" />}>
                <PendingActions />
              </Suspense>
            </div>
            <div className="order-6 flex-none">
              <Suspense fallback={<Skeleton className="w-full h-[400px] rounded-md" />}>
                <RecentActivity />
              </Suspense>
            </div>
          </div>

        </div>
      </div>
    </DashboardShell>
  )
}
