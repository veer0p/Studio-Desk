import { Skeleton } from "@/components/ui/skeleton"

export default function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1600px] mx-auto animate-pulse">
      {/* Analytics Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="bg-muted/30 p-1 rounded-md flex gap-2 w-full max-w-xl">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-9 flex-1 rounded-sm" />
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border/40 rounded-md p-6 space-y-4">
             <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-20" />
             </div>
             <Skeleton className="h-[300px] w-full rounded-sm" />
          </div>
        ))}
      </div>

      {/* Table/Details Area Skeleton */}
      <div className="bg-card border border-border/40 rounded-md p-6 space-y-4">
         <Skeleton className="h-5 w-48" />
         <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
               <div key={i} className="flex gap-4 items-center border-b border-border/40 pb-3 last:border-0 last:pb-0">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
               </div>
            ))}
         </div>
      </div>
    </div>
  )
}
