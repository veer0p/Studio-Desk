import { Skeleton } from "@/components/ui/skeleton"

export default function TeamSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1600px] mx-auto animate-pulse">
      {/* Team Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </div>

      {/* Team Stats/Summary Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border/40 rounded-md p-4 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>

      {/* Team Members Grid/Table Skeleton */}
      <div className="bg-card border border-border/40 rounded-md overflow-hidden">
        <div className="p-4 border-b border-border/40 flex justify-between items-center">
           <Skeleton className="h-5 w-40" />
           <div className="flex gap-2">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-24 rounded-md" />
           </div>
        </div>
        <div className="p-0">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border-b border-border/40 p-4 flex gap-4 items-center">
              <div className="flex-1 flex gap-4 items-center">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-1">
                   <Skeleton className="h-4 w-1/3" />
                   <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
              <Skeleton className="h-4 w-1/5" />
              <Skeleton className="h-4 w-1/5" />
              <div className="flex gap-2 w-1/6 justify-end">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
