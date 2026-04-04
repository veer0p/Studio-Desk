import { Skeleton } from "@/components/ui/skeleton"

export default function MemberDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1600px] mx-auto animate-pulse">
      {/* Member Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Skeleton className="h-20 w-20 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </div>

      {/* Stats/KPIs Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border/40 rounded-md p-4 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Content Area Skeleton */}
          <div className="bg-card border border-border/40 rounded-md overflow-hidden">
             <div className="p-4 border-b border-border/40">
                <Skeleton className="h-5 w-40" />
             </div>
             <div className="p-4 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                   <div key={i} className="flex gap-4 items-center border-b border-border/40 pb-4 last:border-0 last:pb-0">
                      <Skeleton className="h-10 w-10 rounded-sm shrink-0" />
                      <div className="flex-1 space-y-1">
                         <Skeleton className="h-4 w-1/3" />
                         <Skeleton className="h-3 w-1/4" />
                      </div>
                      <Skeleton className="h-4 w-20" />
                   </div>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Sidebar Area Skeleton */}
          <div className="bg-card border border-border/40 rounded-md p-6 space-y-4">
             <Skeleton className="h-5 w-32" />
             <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                   <Skeleton key={i} className="h-8 w-16 rounded-full" />
                ))}
             </div>
          </div>

          <div className="bg-card border border-border/40 rounded-md p-6 space-y-4">
             <Skeleton className="h-5 w-40" />
             <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                   <div key={i} className="flex flex-col gap-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-4 w-full" />
                   </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
