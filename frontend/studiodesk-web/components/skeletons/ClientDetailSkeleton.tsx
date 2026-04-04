import { Skeleton } from "@/components/ui/skeleton"

export default function ClientDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1600px] mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Skeleton className="h-16 w-16 md:h-20 md:w-20 rounded-full shrink-0" />
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
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="border-b border-border/40">
        <div className="flex gap-8 px-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-20 rounded-none border-b-2 border-transparent" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card border border-border/40 rounded-md p-4 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>

          <div className="bg-card border border-border/40 rounded-md p-6 space-y-4">
            <Skeleton className="h-5 w-40" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col gap-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity/Documents */}
        <div className="space-y-6">
            <div className="bg-card border border-border/40 rounded-md p-6 space-y-4">
               <Skeleton className="h-5 w-32" />
               <div className="space-y-4">
                 {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                       <Skeleton className="h-8 w-8 rounded-sm shrink-0" />
                       <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-1/2" />
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
