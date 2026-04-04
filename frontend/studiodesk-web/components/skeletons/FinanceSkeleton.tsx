import { Skeleton } from "@/components/ui/skeleton"

export default function FinanceSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1600px] mx-auto animate-pulse">
      {/* Finance Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </div>

      {/* KPI Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border/40 rounded-md p-6 space-y-3">
             <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-sm shrink-0" />
                <Skeleton className="h-3 w-24" />
             </div>
             <Skeleton className="h-8 w-3/4" />
             <div className="flex items-center gap-2 pt-2">
                <Skeleton className="h-4 w-12 rounded-full" />
                <Skeleton className="h-3 w-20" />
             </div>
          </div>
        ))}
      </div>

      {/* Tabs Column Skeleton */}
      <div className="flex gap-8 border-b border-border/40 px-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-none" />
        ))}
      </div>

      {/* Recent Invoices Table Skeleton */}
      <div className="bg-card border border-border/40 rounded-md overflow-hidden">
        <div className="p-4 border-b border-border/40 flex justify-between items-center">
           <Skeleton className="h-5 w-40" />
           <Skeleton className="h-9 w-24 rounded-md" />
        </div>
        <div className="p-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border-b border-border/40 p-4 flex gap-4 items-center">
              <div className="w-1/4 flex flex-col gap-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-4 w-1/4" />
              <div className="w-1/4 flex flex-col gap-1">
                 <Skeleton className="h-4 w-1/2" />
                 <Skeleton className="h-3 w-1/4" />
              </div>
              <div className="w-1/4 flex items-center justify-end">
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
