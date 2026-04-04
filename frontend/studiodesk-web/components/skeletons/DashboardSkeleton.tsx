import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1600px] mx-auto animate-pulse">
      {/* Today Strip Skeleton */}
      <Skeleton className="w-full h-[100px] rounded-md" />
      
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Pipeline Skeleton */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <Skeleton className="w-24 h-6" />
              <Skeleton className="w-16 h-4" />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="min-w-[220px] h-[300px] rounded-md" />
              ))}
            </div>
          </div>
          
          {/* Upcoming Events Skeleton */}
          <div className="space-y-4">
            <Skeleton className="w-32 h-6 ml-1" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-full h-[120px] rounded-md" />
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Stats Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-full h-[90px] rounded-md" />
            ))}
          </div>
          
          {/* Pending Actions Skeleton */}
          <div className="bg-card border border-border/40 rounded-md p-4 space-y-4">
            <Skeleton className="w-36 h-5" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-10 h-10 rounded-sm shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-2/3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent Activity Skeleton */}
          <div className="bg-card border border-border/40 rounded-md p-4 space-y-4">
            <Skeleton className="w-40 h-5" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-2 h-2 rounded-full mt-2" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-1/3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
