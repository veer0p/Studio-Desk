import { Skeleton } from "@/components/ui/skeleton"

export default function ClientsSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1600px] mx-auto animate-pulse">
      {/* Search and Filters Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div className="relative w-full max-w-sm">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>

      {/* Stats Bar Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border/40 rounded-md p-4 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-card border border-border/40 rounded-md overflow-hidden">
        <div className="border-b border-border/40 p-4">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="p-0">
          <div className="border-b border-border/40 bg-muted/30 p-4 flex gap-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border-b border-border/40 p-4 flex gap-4 items-center">
              <div className="w-1/4 flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <div className="w-1/4 flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
