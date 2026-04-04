import { Skeleton } from "@/components/ui/skeleton"

export default function BookingsSkeleton() {
  return (
    <div className="flex w-full h-full overflow-hidden animate-pulse">
      <div className="flex-1 min-w-0 h-full flex flex-col gap-6 p-4 md:p-8">
        {/* Bookings Shell Skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-4 w-60" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        
        {/* Kanban Columns Skeleton */}
        <div className="flex gap-6 overflow-x-auto h-full pb-4 items-start">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="min-w-[280px] w-[300px] flex flex-col gap-4 bg-muted/20 p-4 rounded-md">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-6 rounded-sm" />
              </div>
              <div className="flex flex-col gap-3 h-full">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="bg-card border border-border/40 rounded-md p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex -space-x-2">
                        {[1, 2].map((k) => (
                           <Skeleton key={k} className="h-6 w-6 rounded-full border border-card" />
                        ))}
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
